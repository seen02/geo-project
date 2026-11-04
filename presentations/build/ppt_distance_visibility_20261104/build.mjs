import fs from 'node:fs/promises';
import path from 'node:path';
import {FileBlob,PresentationFile} from '@oai/artifact-tool';
const root='C:/Users/admin/img2place_project',dir=root+'/ppt_distance_visibility_20261104';
const p=await PresentationFile.importPptx(await FileBlob.load(dir+'/source.pptx'));
const scan=await p.inspect({select:'$.slides[*]',include:['id','index','elements.id','elements.kind','elements.text','elements.position','elements.style','notes.text']});
await fs.writeFile(dir+'/source_inventory.json',JSON.stringify(scan.records,null,2));
const dims=JSON.parse(await fs.readFile(root+'/ppt_visual_update_20261104/image_dimensions.json','utf8'));
const projection=JSON.parse(await fs.readFile(dir+'/projection_data.json','utf8'));
const observed=JSON.parse(await fs.readFile(root+'/geo_work_20261103_precision/observed_points.json','utf8'));
const raw='geo_slueth_test/terrain_test_images/test_sol_3.jpg',map='geo_work_20261103_precision/google20.jpg';
const B={left:64,top:208,width:656,height:308},red='#E53935',yellow='#FFE45C',green='#65F48F',blue='#1973C9',ink='#202326';
const slides=n=>p.resolve(scan.records[n-1].id);
const near=(a,b)=>Math.abs(a-b)<1;
function at(n,x,y){return scan.records[n-1].elements.find(e=>e.kind==='textbox'&&near(e.position.left,x)&&near(e.position.top,y));}
function setAt(n,x,y,t){const e=at(n,x,y);if(!e)throw Error(`Missing text ${n}:${x},${y}`);const q=p.resolve(e.id);q.text=t;return q;}
function caption(n,t){const q=setAt(n,64,520,t);q.text.style={fontFamily:'Pretendard',fontSize:20,color:'#666B73'};q.position={left:64,top:520,width:656,height:40};}
function label(n,name,t,rect,{color=ink,fill='#FFFFFF',size=24,border='none'}={}){
 const q=slides(n).shapes.add({geometry:'textbox',name,position:rect,fill,line:{fill:border,width:border==='none'?0:1.3}});
 q.text=t;q.text.style={fontFamily:'Pretendard',fontSize:size,bold:true,color};q.text.insets=3;return q;
}
function box(n,name,rect,{color=red,width=4.5,fill='none'}={}){return slides(n).shapes.add({geometry:'rect',name,position:rect,fill,line:{style:'solid',fill:color,width}});}
function dot(n,name,xy,{color=red,size=13}={}){return slides(n).shapes.add({geometry:'ellipse',name,position:{left:xy.x-size/2,top:xy.y-size/2,width:size,height:size},fill:color,line:{fill:'#FFFFFF',width:2.2}});}
function line(n,name,points,{color=red,width=4.5,style='solid'}={}){
 const xs=points.map(q=>q.x),ys=points.map(q=>q.y),x=Math.min(...xs),y=Math.min(...ys),w=Math.max(...xs)-x,h=Math.max(...ys)-y;
 return slides(n).shapes.add({geometry:'custom',name,position:{left:x,top:y,width:Math.max(w,.1),height:Math.max(h,.1)},fill:'none',line:{style,fill:color,width},customPaths:[{width:Math.max(w,.1),height:Math.max(h,.1),commands:points.map((q,i)=>i?{lineTo:{x:q.x-x,y:q.y-y}}:{moveTo:{x:q.x-x,y:q.y-y}})}]});
}
function connect(n,from,to,{color=red,fromSide='bottom',toSide='top',width=3}={}){const c=slides(n).shapes.connect(from,to,{kind:'straight',fromSide,toSide,line:{style:'solid',fill:color,width}});c.bringToFront();return c;}
function pt(im,[x,y]){const s=im.frame.width/im.roi[2];return {x:im.frame.left+(x-im.roi[0])*s,y:im.frame.top+(y-im.roi[1])*s};}
function rect(im,[x,y,w,h]){const a=pt(im,[x,y]),s=im.frame.width/im.roi[2];return {left:a.x,top:a.y,width:w*s,height:h*s};}
async function image(n,file,bounds=B,roi,index=0){
 const source=scan.records[n-1].elements.filter(e=>e.kind==='image').sort((a,b)=>a.position.left-b.position.left)[index];if(!source)throw Error(`Missing image ${n}:${index}`);
 const q=p.resolve(source.id),wh=dims[file]??(file.endsWith('naver_streetview.jpg')?[1280,720]:null);if(!wh)throw Error('Dimensions '+file);
 const [w,h]=wh;roi??=[0,0,w,h];const s=Math.min(bounds.width/roi[2],bounds.height/roi[3]);
 const frame={left:bounds.left+(bounds.width-roi[2]*s)/2,top:bounds.top+(bounds.height-roi[3]*s)/2,width:roi[2]*s,height:roi[3]*s};
 q.replace({blob:await fs.readFile(path.join(root,file)),contentType:file.endsWith('.png')?'image/png':'image/jpeg',fit:'contain',alt:path.basename(file)+' 발표용 확대 보기'});
 q.crop={left:roi[0]/w,top:roi[1]/h,right:1-(roi[0]+roi[2])/w,bottom:1-(roi[1]+roi[3])/h};q.fit='contain';q.frame=frame;return {q,frame,roi};
}
function feature(n,im,name,t,sourceRect,labelRect,{color=red,fromSide='bottom',toSide='top',fill='#FFFFFF'}={}){
 const r=box(n,name+' 강조',rect(im,sourceRect),{color});const l=label(n,name+' 설명',t,labelRect,{color:color===yellow?ink:color,fill});connect(n,l,r,{color,fromSide,toSide});l.bringToFront();return {r,l};
}

// The introductory photo retains its full scene. Identify its distant subject clearly.
const s10=await image(10,raw,{left:64,top:198,width:800,height:411});
feature(10,s10,'입력 사진의 전망대','조사 대상: 흰 전망대',[440,220,165,98],{left:s10.frame.left+24,top:s10.frame.top+32,width:258,height:38});

// Show the OCR's exact image region at useful size, without tiny raster text.
const s13=await image(13,raw,B,[410,205,230,135]);
feature(13,s13,'OCR 오인식 영역','글자로 잘못 읽은 부분',[449,227,106,33],{left:s13.frame.left+30,top:462,width:300,height:38},{color:yellow,fromSide:'top',toSide:'bottom'});
caption(13,'노란 박스는 OCR이 글자로 잘못 읽은 구조물입니다.');

// Enlarge the annotations already requested on slide 14.
for(const q of slides(14).shapes.items){
 if(/^단서 \d 빨간 강조/.test(q.name))q.line={style:'solid',fill:red,width:4.5};
 if(/^단서 번호/.test(q.name)){const r=q.position;q.position={...r,width:30,height:32};q.text.style={fontFamily:'Pretendard',fontSize:24,bold:true,color:'#FFFFFF'};q.text.insets=2;}
}
caption(14,'① 전망대·계단  ② 색 블록  ③ 안쪽으로 휘어진 물가');

// Public photo: use a tighter crop and readable callouts for the evidence.
const s15=await image(15,'geo_work_20261102_coast/refs/0.jpg',B,[0,90,1100,565]);
feature(15,s15,'공개 사진의 전망대','전망대·계단',[425,125,535,390],{left:487,top:210,width:176,height:36});
feature(15,s15,'공개 사진의 색 블록','색 블록',[0,395,430,165],{left:102,top:470,width:124,height:36},{fromSide:'top',toSide:'bottom'});
caption(15,'공개 사진에서도 전망대·계단·색 블록을 확인했습니다.');

// Structural comparison: point directly at each fixed feature.
const s16=await image(16,raw,B,[410,210,220,125]);
for(const f of [
 {name:'지지대',xy:[464,252],text:'지지대',label:{left:s16.frame.left+8,top:216,width:118,height:36}},
 {name:'가로 판재',xy:[544,268],text:'가로 판재',label:{left:s16.frame.left+284,top:216,width:148,height:36}},
 {name:'오른쪽 계단',xy:[583,286],text:'오른쪽 계단',label:{left:s16.frame.left+350,top:472,width:168,height:36},below:true}
]){
 const m=dot(16,f.name+' 기준 위치',pt(s16,f.xy),{color:yellow,size:13});const l=label(16,f.name+' 설명',f.text,f.label);
 connect(16,l,m,{color:yellow,fromSide:f.below?'top':'bottom',toSide:f.below?'bottom':'top'});l.bringToFront();
}
caption(16,'지지대·가로 판재·계단의 형태와 배치를 비교했습니다.');

// Crop excess sky while retaining the path and structure in their original relation.
const s17=await image(17,'geo_work_20261102_coast/refs/2.jpg',B,[200,275,620,310]);
feature(17,s17,'시설 위치의 기준','전망대 위치',[445,312,105,96],{left:s17.frame.left+20,top:218,width:180,height:36});
caption(17,'전망대 위치와 사진을 찍은 위치는 서로 다릅니다.');

// Give the aerial image readable facility labels and orientation.
const s18=await image(18,map,B,[0,190,1280,820]);
feature(18,s18,'위성영상의 전망대','전망대',[1065,625,165,185],{left:s18.frame.left+270,top:472,width:120,height:36},{color:blue,fromSide:'top',toSide:'bottom'});
const breakwater=dot(18,'방파제 위치',pt(s18,[1000,380]),{color:red,size:14});
const breakLabel=label(18,'방파제 설명','방파제',{left:s18.frame.left+170,top:218,width:122,height:36},{color:red});
connect(18,breakLabel,breakwater,{color:red,fromSide:'right',toSide:'top'});breakLabel.bringToFront();
label(18,'지도 방향','북 ↑',{left:s18.frame.left+8,top:214,width:76,height:36});
caption(18,'위쪽이 북쪽입니다. 지도에서 읽은 좌표에는 오차가 포함됩니다.');

for(const q of slides(19).shapes.items){
 if(q.name==='곡선 해안 빨간 강조선')q.line={style:'solid',fill:red,width:6};
 if(q.name==='곡선 해안 이름'){q.position={...q.position,width:140,height:36};q.text.style={fontFamily:'Pretendard',fontSize:24,bold:true,color:red};q.text.insets=3;}
}
caption(19,'빨간 선: 전망대 북서쪽으로 휘어진 해안');

// The street view supports facility recognition, while showing its different ground.
for(const q of slides(20).shapes.items)if(q.name==='거리뷰의 전망대 강조')q.line={style:'solid',fill:red,width:4.5};
const street=scan.records[19].elements.find(e=>e.kind==='image');
const streetImage={frame:p.resolve(street.id).frame,roi:[400,250,680,370]};
const streetObs=slides(20).shapes.items.find(q=>q.name==='거리뷰의 전망대 강조');
const streetLabel=label(20,'거리뷰 전망대 설명','전망대',{left:182,top:222,width:124,height:36},{color:red});
connect(20,streetLabel,streetObs,{color:red,fromSide:'bottom',toSide:'top'});streetLabel.bringToFront();
const ground=dot(20,'거리뷰 지면 위치',pt(streetImage,[835,555]),{color:blue,size:14});
const groundLabel=label(20,'거리뷰 지면 설명','거리뷰의 지면',{left:228,top:470,width:190,height:36},{color:blue});
connect(20,groundLabel,ground,{color:blue,fromSide:'right',toSide:'bottom'});groundLabel.bringToFront();
caption(20,'거리뷰에서도 같은 돌 경사면은 확인되지 않았습니다.');

// Replace tiny baked-in A-E letters with editable large markers on source photos.
const photo21=await image(21,raw,{left:64,top:208,width:376,height:308},[420,210,205,120],0);
const map21=await image(21,map,{left:458,top:208,width:262,height:308},[1040,620,200,220],1);
const positionsPhoto={A:[-16,-40],B:[-24,-40],D:[-5,-40],E:[-5,12]};
const positionsMap={A:[-44,-12],B:[4,-40],D:[12,-12],E:[-30,12]};
for(const im of [photo21,map21])for(const q of observed){
 const letter=q.name[0],xy=pt(im,im===photo21?q.px:q.map_px);
 if(letter==='C'){
  const m=dot(21,(im===photo21?'사진':'지도')+' 제외 C',xy,{color:'#737A82',size:12});
  const r=im===photo21?{left:78,top:370,width:88,height:36}:{left:620,top:346,width:88,height:36};
  const l=label(21,(im===photo21?'사진':'지도')+' C 제외 설명','C 제외',r,{color:'#626A73'});
  connect(21,l,m,{color:'#737A82',fromSide:'top',toSide:'bottom',width:2.7});l.bringToFront();
 }else{
  dot(21,(im===photo21?'사진':'지도')+' 비교점 '+letter,xy,{color:red,size:13});
  const [dx,dy]=(im===photo21?positionsPhoto:positionsMap)[letter];
  label(21,(im===photo21?'사진':'지도')+' 점 이름 '+letter,letter,{left:xy.x+dx,top:xy.y+dy,width:34,height:36},{color:'#FFFFFF',fill:'#202326',size:26});
 }
}
caption(21,'A·B·D·E 사용, C 제외 · 현장 측량점은 아닙니다.');

// Enlarge the candidate roof and mark the same provisional F on both images.
const photo22=await image(22,raw,{left:64,top:208,width:318,height:308},[1350,160,90,90],0);
const map22=await image(22,'geo_work_20261103_precision/hotel_map.jpg',{left:402,top:208,width:318,height:308},[30,180,650,550],1);
for(const [im,xy0,xoff]of [[photo22,[1401,185],8],[map22,[238,350],130]]){
 const m=dot(22,im===photo22?'사진 속 후보 F':'지도 속 후보 F',pt(im,xy0),{color:blue,size:17});
 const l=label(22,im===photo22?'사진 F 설명':'지도 F 설명','F 후보 지붕',{left:im.frame.left+xoff,top:im.frame.top+8,width:158,height:36},{color:blue});
 connect(22,l,m,{color:blue,fromSide:'bottom',toSide:'top',width:3.5});l.bringToFront();
}
caption(22,'F는 잠정 지정한 건물입니다. 식별과 높이는 미확정입니다.');

// Recreate the measured comparison using the stored observed/projected pixels.
// The positions are not shifted to make the discrepancy look larger.
setAt(23,64,176,'사진에서 고른 점과 계산한 점 비교');
const photo23=await image(23,raw,{left:64,top:246,width:656,height:270},[425,212,195,122]);
label(23,'사진점 범례','＋ 사진에서 고른 점',{left:76,top:208,width:270,height:34},{color:'#15833E',size:24});
label(23,'계산점 범례','○ 계산한 점',{left:412,top:208,width:214,height:34},{color:red,size:24});
for(const q of projection.comparison_points.filter(q=>q.name!=='F')){
 const a=pt(photo23,q.observed),b=pt(photo23,q.projected);
 line(23,'사진점과 계산점 차이 '+q.name,[a,b],{color:yellow,width:2.6});
 slides(23).shapes.add({geometry:'plus',name:'사진에서 고른 점 '+q.name,position:{left:a.x-9,top:a.y-9,width:18,height:18},fill:green,line:{fill:'#0B2012',width:.8}});
 slides(23).shapes.add({geometry:'ellipse',name:'계산한 점 '+q.name,position:{left:b.x-8,top:b.y-8,width:16,height:16},fill:'none',line:{style:'solid',fill:'#FF4138',width:3.5}});
 const off=q.name==='E'?[-30,12]:[-14,-39];
 label(23,'비교점 이름 '+q.name,q.name,{left:a.x+off[0],top:a.y+off[1],width:33,height:34},{color:'#FFFFFF',fill:'#202326',size:25});
}
const ep=projection.comparison_points.find(q=>q.name==='E');const ex=pt(photo23,ep.projected);
const eLabel=label(23,'계단 E 차이 설명','E: 약 14픽셀 차이',{left:199,top:474,width:253,height:36},{color:red,size:24});
const eDot=dot(23,'계단 E 계산점 연결 기준',ex,{color:'#FF4138',size:5});connect(23,eLabel,eDot,{color:yellow,fromSide:'right',toSide:'bottom',width:2.8});eLabel.bringToFront();
caption(23,'계단 E의 높이나 비교점 선택을 다시 확인해야 합니다.');

// Shorter map names allow larger type without enlarging the white boxes.
for(const q of slides(25).shapes.items){
 const names={'추정 촬영 위치':['추정 위치',116],'실제 촬영 위치':['실제 위치',116],'사근진 전망대':['전망대',90]};
 if(names[q.name]){const [t,w]=names[q.name];q.text=t;q.position={...q.position,width:w,height:36};q.text.style={fontFamily:'Pretendard',fontSize:24,bold:true,color:q.name==='추정 촬영 위치'?'#FF6F0F':q.name==='실제 촬영 위치'?'#168742':blue};q.text.insets=3;}
 if(/좌표$/.test(q.name)){const r=q.position;q.position={left:r.left+r.width/2-7,top:r.top+r.height/2-7,width:14,height:14};q.line={fill:'#FFFFFF',width:2.2};}
 if(q.geometry==='connector'){
  const sourceName=slides(25).shapes.items.find(s=>s.id===q.connector.fromElementId)?.name;
  const color=sourceName?.startsWith('추정')?'#FF6F0F':sourceName?.startsWith('실제')?'#168742':blue;
  q.line={style:'solid',fill:color,width:3.4};q.bringToFront();
 }
}
caption(25,'주황: 추정 위치 / 초록: 실제 위치 / 파랑: 전망대');

// Show the shoreline mismatch at useful size with thick native lines and Korean legends.
const photo26=await image(26,raw,B,[0,285,780,445]);
line(26,'원본 사진에서 확인한 물가',projection.shore_observed.map(v=>pt(photo26,v)),{color:green,width:5.5});
line(26,'지도 물가를 투영한 선',projection.shore_projected.map(v=>pt(photo26,v)),{color:'#FF4138',width:5.5,style:'dashed'});
label(26,'사진 물가 범례','사진의 물가',{left:photo26.frame.left+12,top:218,width:175,height:36},{color:green,fill:'#202326',size:24});
label(26,'지도 물가 범례','지도에서 계산한 물가',{left:photo26.frame.left+12,top:258,width:284,height:36},{color:'#FF6960',fill:'#202326',size:24});
const mismatch=box(26,'물가 불일치 확대 구역',rect(photo26,[580,325,182,98]),{color:yellow,width:3});
const mismatchLabel=label(26,'물가 불일치 설명','물가가 어긋난 부분',{left:photo26.frame.left+265,top:474,width:265,height:36},{color:ink,size:24});
connect(26,mismatchLabel,mismatch,{color:yellow,fromSide:'top',toSide:'bottom',width:3});mismatchLabel.bringToFront();
caption(26,'두 선이 겹치지 않아 정밀 위치 검증에는 부족합니다.');

// Source notes stay with their images. Explain derived annotations without changing claims.
for(const n of [10,13,14,15,16,17,18,19,20,21,22,23,25,26]){
 slides(n).speakerNotes.text=scan.records[n-1].notes.text+'\n사진 표시는 원본 이미지의 해당 위치에 PPT 도형과 큰 글자를 얹은 것이다. 원본 비율을 유지했으며 강조 표시와 설명은 편집할 수 있다.';
}
slides(21).speakerNotes.text+='\nA~E 표시는 observed_points.json의 사진 픽셀과 지도 픽셀을 그대로 사용했다. C는 계산에서 제외한 점이다.';
slides(22).speakerNotes.text+='\nF 표시는 full_spec.json의 사진 좌표 (1401,185)와 hotel_map.jpg 지도 픽셀 (238,350)을 사용했다. 건물 식별과 높이는 잠정적이다.';
slides(23).speakerNotes.text+='\n사진점은 full_spec.json, 계산점은 저장된 full_pose.json의 매개변수로 project()를 실행해 얻었다. 표시를 잘 보이게 하려고 점의 위치를 인위적으로 벌리지 않았다.';
slides(26).speakerNotes.text+='\n초록 실선은 shore_observed.json, 빨간 점선은 shore_points.json을 기존 full_pose.json 조건으로 투영한 결과다. 지도와 원본은 촬영 시점이 같지 않아, 물가 비교만으로 촬영 위치를 확정할 수 없다.';
const after=await p.inspect({select:'$.slides[*]',include:['id','index','elements.id','elements.kind','elements.text','elements.position','notes.text']});
await fs.writeFile(dir+'/draft_inventory.json',JSON.stringify(after.records,null,2));
await(await PresentationFile.exportPptx(p)).save(dir+'/candidate.pptx');
console.log(JSON.stringify({slides:p.slides.items.length,photoSlidesChanged:[10,13,14,15,16,17,18,19,20,21,22,23,25,26],candidate:dir+'/candidate.pptx'}));
