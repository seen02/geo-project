import fs from 'node:fs/promises';
import {FileBlob,PresentationFile} from '@oai/artifact-tool';
const dir='C:/Users/admin/img2place_project/ppt_precision_update_20261104';
const p=await PresentationFile.importPptx(await FileBlob.load(dir+'/source.pptx'));
const scan=await p.inspect({select:'$.slides[*]',include:['id','index','elements.id','elements.kind','elements.text','elements.position','elements.style','notes.text']});
await fs.writeFile(dir+'/artifact_inventory.json',JSON.stringify(scan.records,null,2));
for(const n of [1,10,13,17,20,21,22,23,24,25,28]){
 const rec=scan.records[n-1]; console.log(JSON.stringify({slide:n,id:rec.id,elements:rec.elements.map(e=>({id:e.id,kind:e.kind,text:e.text?.slice(0,80),position:e.position,style:e.kind==='textbox'?e.style:undefined}))}));
}
console.log('masters',p.masters?.items?.length,'slides',p.slides.items.length);
