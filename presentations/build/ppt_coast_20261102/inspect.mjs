import fs from 'node:fs/promises';
import {FileBlob,PresentationFile} from '@oai/artifact-tool';
const src='C:/Users/admin/img2place_project/output/geo-slueth_소개_절차설명_보완본.pptx';
const p=await PresentationFile.importPptx(await FileBlob.load(src));
const r=await p.inspect({select:'$.slides[*]',include:['id','index','title','elements.id','elements.kind','elements.text','elements.alt','elements.position'],fileName:'inventory.ndjson'});
await fs.writeFile('inventory.json',JSON.stringify(r.records,null,2));
console.log(JSON.stringify({slides:p.slides.items.length,snapshot:r.recordCount,first:r.records?.[0],shapes:p.slides.items[9].shapes.items.slice(0,4).map(s=>({id:s.id,name:s.name,text:String(s.text),pos:s.position}))},null,2));
