import {FileBlob,PresentationFile} from '@oai/artifact-tool';
const dir='C:/Users/admin/img2place_project/ppt_distance_visibility_20261104';
const p=await PresentationFile.importPptx(await FileBlob.load(dir+'/source.pptx'));
console.log(JSON.stringify(p.slides.items[24].shapes.items.map(q=>({id:q.id,name:q.name,geometry:q.geometry,connector:q.connector,line:q.line,position:q.position})),null,2));
