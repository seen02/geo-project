import fs from 'node:fs/promises';
import path from 'node:path';
import {FileBlob,PresentationFile} from '@oai/artifact-tool';
const root='C:/Users/admin/img2place_project',b=path.join(root,'ppt_dividers_20261103');
const src=path.join(root,'output/geo-slueth_소개_과정설명_발표용_최종본.pptx');
const backup=path.join(b,'source.pptx');try{await fs.access(backup);}catch{await fs.copyFile(src,backup);}
const p=await PresentationFile.importPptx(await FileBlob.load(backup));
const r=await p.inspect({select:'$.slides[*]',include:['id','index','elements.id','elements.kind','elements.text','elements.position']});
const old=r.records;
if(old.length!==32)throw Error('Unexpected source count');
function text(s,v,x,y,w,h,size,bold,color){const q=s.shapes.add({geometry:'textbox',name:v,position:{left:x,top:y,width:w,height:h},fill:'none',line:{fill:'none',width:0}});q.text=v;q.text.style={typeface:'Pretendard',fontSize:size,bold,color,wrap:'square',autoFit:'none',insets:0,verticalAlignment:'top'};}
function divider(s,title,desc){s.background.fill='#FFF5F0';text(s,title,72,277,1136,80,52,true,'#212124');text(s,desc,76,385,1128,65,28,false,'#FF6F0F');s.speakerNotes.text=title+'\n'+desc;}
const first=p.resolve(old[2].id);p.delete(old[2].elements.map(e=>e.id));
divider(first,'01  필요한 이유','위치를 모르는 사진을 조사할 때 필요한 근거와 기록');
const defs=[
 {before:5,title:'02  geo-sleuth 소개',desc:'사진의 단서를 실제 장소와 연결하는 스킬과 도구의 역할'},
 {before:8,title:'03  테스트 소개',desc:'야간 해안 사진 한 장으로 시작한 사근진 위치 조사'},
 {before:10,title:'04  테스트 과정과 산출물',desc:'단계별 확인 방법과 결과, 활용 가능성'},
 {before:29,title:'부록',desc:'세부 작업별 소스·결과·수행 주체 정리'},
];
for(const d of defs){const s=p.slides.add();divider(s,d.title,d.desc);}
const all=await p.inspect({select:'$.slides[*]',include:['id','index']});
const before=new Map(defs.map((d,i)=>[d.before,all.records[32+i].id]));
const order=[];for(let n=1;n<=32;n++){if(before.has(n))order.push(before.get(n));order.push(old[n-1].id);}
p.slides.reorder(order);
const mapping={};for(let n=1;n<=32;n++)mapping[n]=order.indexOf(old[n-1].id)+1;
for(let n=1;n<=32;n++){
 if(n===3)continue;
 for(const e of old[n-1].elements.filter(e=>e.kind==='textbox')){
  const q=p.resolve(e.id);let v=String(q.text);
  if(e.position.left>=1180&&e.position.top>=680)v=String(mapping[n]);
  else v=v.replace(/(\d+)쪽/g,(m,num)=>mapping[+num]?mapping[+num]+'쪽':m);
  q.text=v;
 }
 const s=p.resolve(old[n-1].id);s.speakerNotes.text=String(s.speakerNotes.text??'').replace(/(\d+)쪽/g,(m,num)=>mapping[+num]?mapping[+num]+'쪽':m);
}
function replace(n,from,to){const e=old[n-1].elements.find(e=>e.kind==='textbox'&&e.text===from);if(!e)throw Error('Missing '+from);p.resolve(e.id).text=to;}
replace(2,'05–07','05–08');replace(2,'08–09','09–11');replace(2,'10–28','12–31');
const appendix=old[1].elements.find(e=>e.kind==='textbox'&&e.text.startsWith('부록  '));p.resolve(appendix.id).text='부록  32–36   작업·소스·결과·수행 대상·명령 대상·기타';
replace(8,'02  실제 테스트','03  테스트 소개');replace(9,'03  테스트 과정','03  테스트 소개');
replace(25,'05  테스트 평가','04  테스트 평가');replace(27,'06  활용 가능성','04  활용 가능성');
const owners=[7,14,16,20,21,22,23,24,25,27,28,29,30,31,32].map(n=>mapping[n]);
await fs.writeFile(path.join(b,'mapping.json'),JSON.stringify({mapping,owners,dividers:[3,5,9,12,32]},null,2));
await(await PresentationFile.exportPptx(p)).save(path.join(b,'candidate.pptx'));
console.log(JSON.stringify({slides:p.slides.items.length,mapping}));
