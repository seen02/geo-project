import fs from 'node:fs/promises';
import path from 'node:path';
import {FileBlob,PresentationFile} from '@oai/artifact-tool';
import {steps,overview,process as processContent,extras,tableContent,appendix,notes} from './content.mjs';
const root='C:/Users/admin/img2place_project',dir=path.join(root,'ppt_precision_update_20261104');
const p=await PresentationFile.importPptx(await FileBlob.load(path.join(dir,'source.pptx')));
const inventory=JSON.parse(await fs.readFile(path.join(dir,'source_inventory.json'),'utf8'));
const scan=await p.inspect({select:'$.slides[*]',include:['id','index','elements.id','elements.kind','elements.text','elements.position','elements.style']});
const changes=[];
const imageDimensions=JSON.parse(await fs.readFile(path.join(dir,'image_dimensions.json'),'utf8'));
function fitImageFrame(file,bounds,cropHeight){
 const [w,h]=imageDimensions[file],visibleHeight=cropHeight??h;
 const scale=Math.min(bounds.width/w,bounds.height/visibleHeight);
 return {left:bounds.left+(bounds.width-w*scale)/2,top:bounds.top+(bounds.height-visibleHeight*scale)/2,width:w*scale,height:visibleHeight*scale};
}
const normalize=s=>String(s??'').replace(/\r/g,'').replace(/\s+/g,' ').trim();
const idMap=new Map();
for(const rec of scan.records){
 const source=inventory.slides[rec.index];const taken=new Set();const sm=new Map();
 for(const s of source.shapes.filter(s=>s.text&&s.kind==='sp')){
  const candidates=rec.elements.filter(e=>e.kind==='textbox'&&!taken.has(e.id));
  let match=candidates.find(e=>e.text===s.text);
  if(!match)match=candidates.find(e=>normalize(e.text)===normalize(s.text));
  if(!match&&s.xy)match=candidates.find(e=>Math.abs(e.position.left-Number(s.xy.x)/9525)<.5&&Math.abs(e.position.top-Number(s.xy.y)/9525)<.5);
  if(!match)throw new Error(`Missing source shape ${rec.index+1}:${s.id} ${s.text}`);
  sm.set(String(s.id),match.id);taken.add(match.id);
 }
 idMap.set(rec.index+1,sm);
}
function setText(n,e,value){
 if(!e)throw new Error(`Missing text target slide ${n}`);
 const q=p.resolve(typeof e==='string'?e:e.id);const old=String(q.text);
 if(old===value)return;q.text=value;q.name=value.replace(/\n/g,' ').slice(0,75);
 changes.push({slide:n,kind:'text',id:q.id,before:old,after:value});
}
function at(n,left,top){return scan.records[n-1].elements.find(e=>e.kind==='textbox'&&Math.abs(e.position.left-left)<1&&Math.abs(e.position.top-top)<1);}
function setAt(n,left,top,value){setText(n,at(n,left,top),value);}
function setTable(n,matrix){
 const elements=scan.records[n-1].elements.filter(e=>e.kind==='table');
 if(elements.length!==1)throw new Error(`Expected one table: ${n}`);
 const t=p.resolve(elements[0].id);
 const src=inventory.slides[n-1].shapes.find(s=>s.table)?.table;
 if(src?.length!==matrix.length||src[0].length!==matrix[0].length)throw new Error(`Table dimensions ${n}`);
 for(let r=0;r<matrix.length;r++)for(let c=0;c<matrix[r].length;c++)t.cells.set(r,c,matrix[r][c]);
 changes.push({slide:n,kind:'table',values:matrix});
}
async function image(n,file,index=0,mode){
 const ids=scan.records[n-1].elements.filter(e=>e.kind==='image');
 const q=p.resolve(ids[index].id),oldFrame=q.frame;
 const blob=await fs.readFile(path.join(root,file));
 q.replace({blob,contentType:file.toLowerCase().endsWith('.png')?'image/png':'image/jpeg',fit:'contain',alt:file.split('/').pop()});
 q.fit='contain';q.crop={left:0,top:0,right:0,bottom:mode==='map'?1-760/1141:0};
 const bounds={left:n===22&&index===1?390:64,top:253,width:n===21||n===22?306:632,height:263};
 q.frame=fitImageFrame(file,bounds,mode==='map'?760:undefined);
 changes.push({slide:n,kind:'image',source:file,oldFrame,newFrame:q.frame});
}
for(const [n0,updates]of Object.entries(extras)){
 const n=Number(n0);for(const [sourceId,text]of Object.entries(updates))setText(n,idMap.get(n).get(sourceId),text);
}
for(let n=13;n<=26;n++){
 const rec=scan.records[n-1];
 for(const e of rec.elements.filter(e=>e.kind==='textbox'&&e.position.top<30&&/^0[1-8] /.test(e.text))){
  const k=Number(e.text.slice(0,2))-1;setText(n,e,steps[k]);
  if(n===24){const q=p.resolve(e.id);q.text.style={...e.style,color:k===6?'#FF6F0F':'#666B73',bold:k===6};}
 }
 if(n===24){const underline=rec.elements.find(e=>e.kind==='shape'&&Math.abs(e.position.top-54)<1);p.resolve(underline.id).position={...underline.position,left:928};}
 const c=processContent[n];
 setAt(n,64,78,c.title);setAt(n,208,142,c.why);setAt(n,64,215,c.imageTitle);
 if(c.steps)for(let i=0;i<3;i++){setAt(n,744,253+90*i,c.steps[i][0]);setAt(n,744,287+90*i,c.steps[i][1]);}
 if(c.table)setTable(n,c.table);
 setAt(n,64,520,c.caption);setAt(n,179,563,c.result);setAt(n,64,605,c.io);setAt(n,64,651,c.next);
 if(c.image)await image(n,c.image,0,c.crop);
 if(c.images)for(let i=0;i<c.images.length;i++)await image(n,c.images[i],i);
 if(n===21)p.resolve(rec.id).images.add({blob:await fs.readFile(path.join(root,'geo_work_20261103_precision/map_controls.png')),contentType:'image/png',fit:'contain',alt:'Satellite control points A to E, C excluded from final solve',position:fitImageFrame('geo_work_20261103_precision/map_controls.png',{left:390,top:253,width:306,height:263})});
 p.resolve(rec.id).speakerNotes.text=c.notes;
}
// Keep the same overview composition, replacing only its stage labels and outputs.
const overviewSourceIds=[[6,7],[9,10],[12,13],[15,16],[18,19],[21,22],[24,25],[27,28]];
for(let i=0;i<8;i++)for(let j=0;j<2;j++)setText(11,idMap.get(11).get(String(overviewSourceIds[i][j])),overview[i][j]);
for(const [n,m]of Object.entries(tableContent))setTable(Number(n),m);
for(const [n,m]of Object.entries(appendix)){
 m[0]=['작업','소스','결과','수행 주체','지시자','기타'];
 setTable(Number(n),m);
 p.resolve(scan.records[Number(n)-1].id).speakerNotes.text=`이 장은 이번 재검증의 세부 작업과 실행 주체를 정리한 표입니다. 모든 프로그램의 실행 조건과 다음 작업은 위치 조사 AI가 정했습니다. 프로그램은 파일 검사·자료 조회·수치 계산·저장을 수행했고, 점의 선택과 자료 해석은 AI가 했습니다. 실제로 실행한 작업만 적었습니다. ${Number(n)===33?'같은 사진과 기존 실제 좌표를 알고 진행한 재검증이며, 실제 좌표는 최적화 입력에서 제외했습니다.':''} ${Number(n)===34?'기존 공개 사진을 재사용했고 DINOv2·SIFT를 이번에 재실행하지 않았습니다.':''} ${Number(n)===35?'모든 비교점이 현장 측량점인 것은 아닙니다. 곡선 점 C는 불명확해 제외했고 F의 건물 식별과 높이도 잠정적입니다.':''} ${Number(n)===36?'입력 조건을 바꿨을 때 결과가 크게 변했습니다. 약 5m는 이번 계산점과 알려진 실제점 사이의 거리이며 검증된 정확도나 오차반경이 아닙니다.':''}`;
}
for(const [n,text]of Object.entries(notes))p.resolve(scan.records[Number(n)-1].id).speakerNotes.text=text;
p.resolve(scan.records[0].id).speakerNotes.text='이번 발표는 geo-sleuth가 사진의 특징과 공개 자료로 위치를 조사하는 과정을 소개합니다. 같은 사근진 야간 사진을 재검증하면서 사진·지도 비교점을 실제로 지정하고 위치 계산과 검증을 수행했습니다. 기존 발표의 순서와 구성을 유지하고, 이번 재검증의 실제 과정과 결과를 설명합니다.';
await fs.writeFile(path.join(dir,'changes.json'),JSON.stringify(changes,null,2));
const after=await p.inspect({select:'$.slides[*]',include:['id','index','elements.id','elements.kind','elements.text','elements.position','notes.text']});
await fs.writeFile(path.join(dir,'draft_inventory.json'),JSON.stringify(after.records,null,2));
await(await PresentationFile.exportPptx(p)).save(path.join(dir,'candidate.pptx'));
console.log(JSON.stringify({slides:p.slides.items.length,changes:changes.length,changedSlides:[...new Set(changes.map(c=>c.slide))]}));
