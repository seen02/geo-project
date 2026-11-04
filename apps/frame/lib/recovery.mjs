import {readdir,stat,readFile,writeFile,rename,copyFile,lstat} from 'node:fs/promises';
import path from 'node:path';

const ignored=new Set(['reference.png','reference.jpg','reference.webp','report.schema.json','request.json','result.template.json','final.json','TASK.md','tools.json','TOOL_GUIDE.md','progress.json','checkpoint.json','recovery.json','network-diagnostics.json','asset-validation.json']);
const allowed=/\.(?:json|jsonl|md|txt|csv|geojson|jpg|jpeg|png|webp)$/i;
// Files only. Never follow symlinks or carry executable code from a previous attempt.
export async function inventory(root){
  const result=[];let bytes=0;
  async function walk(folder,depth){
    if(depth>5||result.length>=300)return;
    for(const entry of await readdir(folder,{withFileTypes:true}).catch(()=>[])){
      if(entry.name.startsWith('.')||ignored.has(entry.name)||entry.name.startsWith('codex.')||entry.name.startsWith('cli-'))continue;
      const target=path.join(folder,entry.name),rel=path.relative(root,target).split(path.sep).join('/');
      if(entry.isDirectory()){await walk(target,depth+1);continue;}
      if(!entry.isFile()||!allowed.test(entry.name))continue;
      const info=await stat(target);
      if(info.size===0||info.size>15*1024*1024||bytes+info.size>100*1024*1024)continue;
      result.push({file:rel,bytes:info.size});bytes+=info.size;if(result.length>=300)break;
    }
  }
  await walk(root,0);return result;
}
export async function saveCheckpoint(dir,job,tools){
  const checkpoint={version:1,savedAt:new Date().toISOString(),stage:job.stage,threadId:job.threadId||null,tools:[...tools],files:await inventory(dir)};
  await writeFile(path.join(dir,'checkpoint.tmp'),JSON.stringify(checkpoint,null,2));
  await rename(path.join(dir,'checkpoint.tmp'),path.join(dir,'checkpoint.json'));return checkpoint;
}
export async function carryForward(source,destination){
  const {mkdir,realpath}=await import('node:fs/promises');
  const files=await inventory(source),sourceRoot=await realpath(source);
  const copied=[];
  for(const item of files){
    const origin=path.join(source,item.file),actual=await realpath(origin);
    if(!actual.startsWith(sourceRoot+path.sep)||(await lstat(origin)).isSymbolicLink())continue;
    const target=path.join(destination,item.file);await mkdir(path.dirname(target),{recursive:true});await copyFile(origin,target);copied.push(item);
  }
  return {files:copied,tools:[]}; // New sessions must re-check old evidence, not inherit a verification pass.
}
