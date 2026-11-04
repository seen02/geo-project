import fs from 'node:fs/promises';
import {FileBlob,PresentationFile} from '@oai/artifact-tool';
const dir='C:/Users/admin/img2place_project/ppt_visual_update_20261104';
const p=await PresentationFile.importPptx(await FileBlob.load(dir+'/source.pptx'));
const s=await p.inspect({select:'$.slides[*]',include:['id','index','elements.id','elements.kind','elements.text','elements.position','elements.style','notes.text']});
await fs.writeFile(dir+'/source_inventory.json',JSON.stringify(s.records,null,2));
console.log(JSON.stringify(s.records.filter(x=>[9,13,18,19,24,26,30].includes(x.index)).map(x=>({slide:x.index+1,elements:x.elements.filter(e=>e.kind!=='textbox'||e.position.top<210||x.index===24).map(e=>({id:e.id,kind:e.kind,text:e.text?.slice(0,40),position:e.position}))}))));
console.log(p.slides.items[24].shapes.items.map(q=>({name:q.name,id:q.id})).slice(-8));
