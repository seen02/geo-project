import {spawn} from 'node:child_process';
import {readFile} from 'node:fs/promises';
import path from 'node:path';

export async function validateAssets(report,resolve,config){
  const names=new Set([report.evidence_spec,...report.evidence.map(x=>x.file),...Object.values(report.verification).flatMap(x=>x.files)]);
  try{
    const spec=JSON.parse((await readFile(await resolve(report.evidence_spec),'utf8')).replace(/^\uFEFF/,''));
    if(typeof spec.map==='string'){names.add(spec.map);names.add(spec.map.replace(/\.[^.]+$/,'.json'));}
    for(const panel of (spec.panels||[]).slice(0,20))if(typeof panel.image==='string')names.add(panel.image);
  }catch{}
  const files=new Map();for(const name of [...names].filter(Boolean).slice(0,100)){try{files.set(name,await resolve(name));}catch{}}
  if(!files.size)return {};
  const output=await new Promise(resolveResult=>{
    const child=spawn(config.uv,['run',path.join(config.helpers,'validate_assets.py')],{env:config.env,windowsHide:true,shell:false,stdio:['pipe','pipe','pipe']});
    let stdout='';child.stdout.setEncoding('utf8');child.stdout.on('data',data=>{stdout+=data;});
    child.stderr.resume();const timer=setTimeout(()=>child.kill(),30000);
    child.on('error',()=>{clearTimeout(timer);resolveResult({});});
    child.on('close',code=>{clearTimeout(timer);try{resolveResult(code===0?JSON.parse(stdout):{});}catch{resolveResult({});}});
    child.stdin.on('error',()=>{});child.stdin.end(JSON.stringify([...new Set(files.values())]));
  });
  return Object.fromEntries([...files].map(([name,full])=>[name,output[full]||{ok:false,error:'자료 검사기를 실행하지 못했습니다.'}]));
}
