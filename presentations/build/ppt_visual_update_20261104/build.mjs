import fs from 'node:fs/promises';
import path from 'node:path';
import {FileBlob,PresentationFile} from '@oai/artifact-tool';

const root='C:/Users/admin/img2place_project';
const dir=path.join(root,'ppt_visual_update_20261104');
const p=await PresentationFile.importPptx(await FileBlob.load(dir+'/source.pptx'));
const scan=await p.inspect({select:'$.slides[*]',include:['id','index','elements.id','elements.kind','elements.text','elements.position','elements.style','notes.text']});
const dims=JSON.parse(await fs.readFile(dir+'/image_dimensions.json','utf8'));
const changes=[];
const near=(a,b)=>Math.abs(a-b)<1;
function at(n,x,y){return scan.records[n-1].elements.find(e=>e.kind==='textbox'&&near(e.position.left,x)&&near(e.position.top,y));}
function textAt(n,x,y,text){const e=at(n,x,y);if(!e)throw Error(`Text missing ${n} ${x} ${y}`);p.resolve(e.id).text=text;changes.push({slide:n,text});}
function move(e,patch){p.resolve(e.id).position={...e.position,...patch};}
function pixelBox(frame,roi,box){const s=frame.width/roi[2];return {left:frame.left+(box[0]-roi[0])*s,top:frame.top+(box[1]-roi[1])*s,width:box[2]*s,height:box[3]*s};}
function pixelPoint(frame,roi,point){const s=frame.width/roi[2];return {x:frame.left+(point[0]-roi[0])*s,y:frame.top+(point[1]-roi[1])*s};}
async function image(n,file,bounds,roi,index=0){
 const rec=scan.records[n-1],s=p.resolve(rec.id);
 const candidates=rec.elements.filter(e=>e.kind==='image').sort((a,b)=>a.position.left-b.position.left);
 const q=p.resolve(candidates[index].id);
 let wh=dims[file];if(!wh){if(file.endsWith('naver_streetview.jpg'))wh=[1280,720];else throw Error('Missing dimensions '+file);}
 const [w,h]=wh;roi??=[0,0,w,h];
 const scale=Math.min(bounds.width/roi[2],bounds.height/roi[3]);
 const frame={left:bounds.left+(bounds.width-roi[2]*scale)/2,top:bounds.top+(bounds.height-roi[3]*scale)/2,width:roi[2]*scale,height:roi[3]*scale};
 q.replace({blob:await fs.readFile(path.join(root,file)),contentType:file.toLowerCase().endsWith('.png')?'image/png':'image/jpeg',fit:'contain',alt:n===20?'2024년 3월 네이버 거리뷰. 전망대와 해안이 보이고 앞쪽 지면은 모래밭이다.':path.basename(file)});
 q.crop={left:roi[0]/w,top:roi[1]/h,right:1-(roi[0]+roi[2])/w,bottom:1-(roi[1]+roi[3])/h};q.fit='contain';q.frame=frame;
 changes.push({slide:n,image:file,crop:roi,frame});return {slide:s,q,frame,roi};
}
function label(slide,name,text,position,color='#E53935',size=16,fill='#FFFFFF'){
 const q=slide.shapes.add({geometry:'textbox',name,position,fill,line:{fill:'none',width:0}});
 q.text=text;q.text.style={fontFamily:'Pretendard',fontSize:size,bold:true,color};q.text.insets=2;return q;
}

// Compact the common headers while keeping the supplied design, text and fonts.
const dividers=new Set([1,3,5,9,12,32]);
for(const rec of scan.records){
 const n=rec.index+1;if(dividers.has(n)||n>=13&&n<=26)continue;
 for(const e of rec.elements){const y=e.position.top;
  if(e.kind==='textbox'&&near(y,29))move(e,{top:22});
  else if(e.kind==='textbox'&&near(y,72))move(e,{top:58,height:58});
  else if(e.kind==='textbox'&&near(y,143))move(e,{top:121,height:48});
  else if(y>=180&&y<630){move(e,{top:y-28});}
 }
}
await image(10,'geo_slueth_test/terrain_test_images/test_sol_3.jpg',{left:64,top:198,width:800,height:411});

const mediaBounds={left:64,top:208,width:656,height:308};
for(let n=13;n<=26;n++){
 const rec=scan.records[n-1];
 for(const e of rec.elements){
  const o=e.position,y=o.top;
  if(e.kind==='textbox'){
   if(near(y,78))move(e,{top:64,height:50});
   else if(near(o.left,64)&&near(y,145))move(e,{top:120,height:30});
   else if(near(o.left,208)&&near(y,142))move(e,{top:116,height:56});
   else if(near(y,215))move(e,{top:176,height:26,...(near(o.left,64)?{width:656}:{})});
   else if(near(o.left,744)&&y>=253&&y<=520)move(e,{top:y-45});
   else if(near(o.left,64)&&near(y,520))move(e,{width:656});
  }else if(e.kind==='table'){
   const t=p.resolve(e.id);const oldHeights=[];
   for(let r=0;r<t.rows.length;r++)oldHeights.push(t.rows[r].height);
   t.position={...o,top:208,height:308};
   for(let r=0;r<oldHeights.length;r++)t.rows[r].height=oldHeights[r]*308/o.height;
  }
 }
}
await image(13,'geo_work_20261103_precision/intake/ocr.png',mediaBounds);
const s14=await image(14,'geo_slueth_test/terrain_test_images/test_sol_3.jpg',mediaBounds,[0,200,850,500]);
for(const [i,box]of [[1,[440,220,165,98]],[2,[0,279,440,80]],[3,[582,332,182,113]]]){
 const b=pixelBox(s14.frame,s14.roi,box);
 s14.slide.shapes.add({geometry:'rect',name:`단서 ${i} 빨간 강조`,position:b,fill:'#E53935/10',line:{style:'solid',fill:'#E53935',width:2.4}});
 label(s14.slide,`단서 번호 ${i}`,String(i),{left:b.left+2,top:b.top+2,width:18,height:18},'#FFFFFF',13,'#E53935');
}
textAt(14,64,520,'빨간 박스: ① 전망대·계단  ② 색 블록  ③ 곡선 물가');
await image(15,'geo_work_20261102_coast/refs/0.jpg',mediaBounds);
await image(16,'geo_slueth_test/terrain_test_images/test_sol_3.jpg',mediaBounds,[410,215,220,120]);
await image(17,'geo_work_20261102_coast/refs/2.jpg',mediaBounds);
await image(18,'geo_work_20261103_precision/google20.jpg',mediaBounds,[0,80,1280,940]);
const s19=await image(19,'geo_work_20261103_precision/google20.jpg',mediaBounds,[0,250,1280,750]);
const coast=[[0,275],[100,400],[200,490],[300,559],[400,603],[500,629],[600,650],[700,655],[800,653],[900,631],[1000,608],[1100,580]].map(v=>pixelPoint(s19.frame,s19.roi,v));
const minX=Math.min(...coast.map(v=>v.x)),maxX=Math.max(...coast.map(v=>v.x)),minY=Math.min(...coast.map(v=>v.y)),maxY=Math.max(...coast.map(v=>v.y));
s19.slide.shapes.add({geometry:'custom',name:'곡선 해안 빨간 강조선',position:{left:minX,top:minY,width:maxX-minX,height:maxY-minY},fill:'none',line:{style:'solid',fill:'#E53935',width:4.5},customPaths:[{width:maxX-minX,height:maxY-minY,commands:coast.map((v,i)=>i===0?{moveTo:{x:v.x-minX,y:v.y-minY}}:{lineTo:{x:v.x-minX,y:v.y-minY}})}]});
const coastLabelPoint=pixelPoint(s19.frame,s19.roi,[620,470]);
label(s19.slide,'곡선 해안 이름','곡선 해안',{left:coastLabelPoint.x-46,top:coastLabelPoint.y-8,width:92,height:26});
textAt(19,64,520,'빨간 선은 위성영상에서 확인한 곡선 해안입니다.');

const s20=await image(20,'ppt_visual_update_20261104/naver_streetview.jpg',mediaBounds,[400,250,680,370]);
const obs=pixelBox(s20.frame,s20.roi,[640,308,88,85]);
s20.slide.shapes.add({geometry:'rect',name:'거리뷰의 전망대 강조',position:obs,fill:'none',line:{style:'solid',fill:'#E53935',width:2.4}});
textAt(20,64,215,'네이버 거리뷰에서 본 전망대와 해안 (2024.03)');
textAt(20,64,520,'전망대와 해안은 보이지만, 원본과 같은 돌 경사면은\n이 화면에서 확인되지 않습니다.');
textAt(20,64,605,'입력: 후보 좌표·거리뷰 링크    조회: gsv.py·네이버 지도    저장: 조회 결과·거리뷰 캡처');
s20.slide.speakerNotes.text=scan.records[19].notes.text+'\n사진 자료: 네이버 지도 거리뷰, 촬영 시기 2024년 3월. 2026년 11월 4일 화면 확인.\nhttps://map.naver.com/p/entry/place/12079976?placePath=%2Fhome&c=14348779.2402674%2C4553100.0518474%2C17.17%2C0%2C0%2C2%2Cadh&p=_zxHjgvOMzX_XGctDzJNVQ%2C46.42%2C-2.28%2C37%2CFloat\n화면의 전망대와 주변 해안은 확인할 수 있으나, 원본 사진과 동일한 돌 경사면까지 대응시킨 자료는 아니다.';

await image(21,'geo_work_20261103_precision/photo_controls.png',{left:64,top:208,width:376,height:308},undefined,0);
await image(21,'geo_work_20261103_precision/map_controls.png',{left:458,top:208,width:262,height:308},undefined,1);
await image(22,'geo_work_20261103_precision/hotel_query.png',{left:64,top:208,width:318,height:308},undefined,0);
await image(22,'geo_work_20261103_precision/hotel_map.jpg',{left:402,top:208,width:318,height:308},undefined,1);
await image(23,'geo_work_20261103_precision/observed_projected_zoom.jpg',mediaBounds);

const s25=await image(25,'geo_work_20261103_precision/google20.jpg',mediaBounds,[0,240,1280,760]);
function mercator([lat,lon]){const r=lat*Math.PI/180;return [(lon+180)/360*(256*2**20)-899727*256,(1-Math.asinh(Math.tan(r))/Math.PI)/2*(256*2**20)-405149*256];}
const points=[
 {ll:[37.8143935,128.8968599],text:'추정 촬영 위치',color:'#FF6F0F',label:[8,35,116],fromSide:'top',toSide:'bottom'},
 {ll:[37.81438,128.89691],text:'실제 촬영 위치',color:'#168742',label:[25,147,116],fromSide:'bottom',toSide:'top'},
 {ll:[37.81419,128.89829],text:'사근진 전망대',color:'#1671C5',label:[s25.frame.width-128,240,112],fromSide:'bottom',toSide:'top'}
];
for(const pt of points){
 const xy=pixelPoint(s25.frame,s25.roi,mercator(pt.ll));
 const marker=s25.slide.shapes.items.find(q=>q.name===pt.text+' 좌표');
 const box=s25.slide.shapes.items.find(q=>q.name===pt.text);
 if(!marker||!box)throw Error('Map annotations missing '+pt.text);
 marker.position={left:xy.x-4.5,top:xy.y-4.5,width:9,height:9};
 box.position={left:s25.frame.left+pt.label[0],top:s25.frame.top+pt.label[1],width:pt.label[2],height:24};
 box.text.insets=2;box.text.style={fontFamily:'Pretendard',fontSize:16,bold:true,color:pt.color};
 const connector=s25.slide.shapes.connect(marker,box,{kind:'straight',fromSide:pt.fromSide,toSide:pt.toSide,line:{style:'solid',fill:pt.color,width:2.2}});
 connector.bringToFront();
}
await image(26,'geo_work_20261103_precision/shore_comparison.jpg',mediaBounds);

await fs.writeFile(dir+'/changes.json',JSON.stringify(changes,null,2));
const after=await p.inspect({select:'$.slides[*]',include:['id','index','elements.id','elements.kind','elements.text','elements.position','notes.text']});
await fs.writeFile(dir+'/draft_inventory.json',JSON.stringify(after.records,null,2));
await(await PresentationFile.exportPptx(p)).save(dir+'/candidate.pptx');
console.log(JSON.stringify({slides:p.slides.items.length,imageChanges:changes.filter(c=>c.image).length,output:dir+'/candidate.pptx'}));
