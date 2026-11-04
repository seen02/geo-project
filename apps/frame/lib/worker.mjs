import {appendFile,writeFile,readFile} from 'node:fs/promises';
import path from 'node:path';
import {codexArgs,describeEvent,executedTools} from './runtime.mjs';
import {saveCheckpoint} from './recovery.mjs';

export async function executeWorker(store,r,paths,prompt,tools,invocation,deadline,session){
  const {dir,reference,schema,final,runtimeDirectory}=paths;
  let args=codexArgs(dir,reference,schema,final,runtimeDirectory,r.job.model);
  if(session){args.pop();args.push('resume',session,'-');}
  const prefix=invocation===1?'codex':`cli-${invocation}`;
  const eventsFile=path.join(dir,prefix+'.events.jsonl'),stderrFile=path.join(dir,prefix+'.stderr.log');
  await Promise.all([writeFile(eventsFile,''),writeFile(stderrFile,'')]);
  const child=store.runCommand(store.config.codex,args,{cwd:dir,env:store.config.env,windowsHide:true,shell:false,stdio:['pipe','pipe','pipe']});
  store.children.set(r.id,child);
  let buffer='',stderr='',failure='',chain=Promise.resolve(),disk=Promise.resolve(),lastCheckpoint=0,lastProgress='',polling=false,timedOut=false;
  const checkpoint=async(force=false)=>{
    if(!force&&Date.now()-lastCheckpoint<1500)return;lastCheckpoint=Date.now();
    const saved=await saveCheckpoint(dir,r.job,tools);
    r.job.recovery={savedAt:saved.savedAt,stage:saved.stage,files:saved.files.length};
    r.job.resumable=saved.files.length>0;
    await store.update(r);
  };
  const consume=line=>{
    let event;try{event=JSON.parse(line);}catch{return;}
    if(event.type==='thread.started')r.job.threadId=event.thread_id;
    if(event.type==='item.completed')for(const name of executedTools(event.item))tools.add(name);
    if(event.type==='error'||event.type==='turn.failed')failure=event.error?.message||event.message||'Codex turn failed';
    if(event.type==='turn.completed'){
      const sum=r.job.usage||{};for(const [key,value] of Object.entries(event.usage||{}))if(Number.isFinite(value))sum[key]=(sum[key]||0)+value;
      r.job.usage=sum;failure='';
    }
    const described=describeEvent(event);
    chain=chain.then(async()=>{
      if(r.job.state!=='running')return;
      if(described){
        if(['intake.py','board.py'].includes(described.tool))await store.stage(r,'researching');
        if(['gsv.py','match.py','pose.py'].includes(described.tool))await store.stage(r,'verifying');
        await store.log(r,described.kind,described.message,{...(described.tool?{tool:described.tool}:{}),...(described.code?{code:described.code}:{} )});
      }
      if(event.type==='item.completed'&&event.item?.type==='command_execution')await checkpoint();
    });
  };
  child.stdout.setEncoding('utf8');child.stderr.setEncoding('utf8');
  child.stdout.on('data',chunk=>{
    disk=disk.then(()=>appendFile(eventsFile,chunk));buffer+=chunk;
    const lines=buffer.split('\n');buffer=lines.pop();for(const line of lines)consume(line);
  });
  child.stderr.on('data',chunk=>{stderr=(stderr+chunk).slice(-300000);disk=disk.then(()=>appendFile(stderrFile,chunk));});
  const poller=setInterval(async()=>{
    if(polling||r.job.state!=='running')return;polling=true;
    try{
      const raw=await readFile(path.join(dir,'progress.json'),'utf8');
      if(raw!==lastProgress){const progress=JSON.parse(raw.replace(/^\uFEFF/,''));lastProgress=raw;
        chain=chain.then(async()=>{if(r.job.state==='running'){await store.stage(r,progress.stage,String(progress.message||'').slice(0,500));await checkpoint();}});
      }
    }catch{}finally{polling=false;}
  },800);
  const timer=setTimeout(()=>{timedOut=true;store.stopChild(child);},Math.max(1,deadline-Date.now()));
  let outcome;
  try{
    outcome=await new Promise(resolve=>{
      child.once('error',error=>resolve({code:-1,error}));child.once('close',code=>resolve({code}));
      child.stdin.on('error',()=>{});child.stdin.end(prompt);
    });
  }finally{clearInterval(poller);clearTimeout(timer);}
  if(buffer.trim())consume(buffer);
  await chain;await disk;await checkpoint(true);
  store.children.delete(r.id);
  return {ok:outcome.code===0&&!failure&&!timedOut,error:timedOut?'timeout':failure||stderr||outcome.error?.message||`CLI exited ${outcome.code}`,timedOut};
}
