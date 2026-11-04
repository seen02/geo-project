import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import {Presentation,PresentationFile} from '@oai/artifact-tool';

const ROOT='C:/Users/admin/img2place_project';
const B=path.join(ROOT,'ppt_rebuild_20261029');
const T=path.join(ROOT,'geo_work_20261028_01');
const PHOTO=path.join(ROOT,'geo_slueth_test/terrain_test_images/test_astra_1.jpg');
const REF='C:/Users/admin/Desktop/발표 자료/통합_업무_비서_소개_기술설명_부록추가_최종.pptx';
const OLD=path.join(ROOT,'output/geo_sleuth_처리과정_입출력_테스트_발전방향_최종.pptx');
const SKILL='C:/Users/admin/.codex/skills/geo-sleuth/SKILL.md';
const TITLE='geo-slueth 소개 - 테스트 과정 정리 및 활용 가능성 파악';
const GH='https://github.com/Oldcircle/geo-sleuth';
const W=1280,H=720;
const C={ink:'#212124',gray:'#666B73',orange:'#FF6F0F',line:'#E5E7EB',soft:'#F6F7F9',warm:'#FFF5F0',white:'#FFFFFF'};
await fs.mkdir(path.join(B,'assets'),{recursive:true});
const A=path.join(B,'assets');
async function crop(file,name,left,top,width,height){const dest=path.join(A,name+'.jpg');await sharp(file).extract({left,top,width,height}).jpeg({quality:95}).toFile(dest);return dest;}
const skyline=path.join(T,'skyline.png');
const matches=await sharp(path.join(T,'matches.jpg')).metadata();
const roads=await sharp(path.join(T,'road_matches.jpg')).metadata();
const assets={
 refs:await crop(path.join(T,'matches.jpg'),'reference_top6',0,0,matches.width,Math.min(matches.height,720)),
 roads:await crop(path.join(T,'road_matches.jpg'),'street_top6',0,0,roads.width,Math.min(roads.height,720)),
 map:await crop(path.join(T,'doksan_detail.jpg'),'doksan_road_map',250,100,1350,1050),
 evidenceMap:await crop(path.join(T,'evidence.jpg'),'result_map',0,0,1280,995),
 pose:await crop(path.join(T,'pose_selfcheck.jpg'),'projection_detail',650,490,190,100),
 net:await crop(path.join(T,'sema_area.jpg'),'range_satellite',600,720,690,660),
 roof:await crop(PHOTO,'foreground_roof',1120,690,320,120),
};

const P=Presentation.create({slideSize:{width:W,height:H}});
P.theme.defaultFont='Pretendard';
P.theme.colorScheme={name:'Reference orange',themeColors:{accent1:C.orange,accent2:C.ink,accent3:C.gray,accent4:'#45515E',accent5:'#9198A1',accent6:'#DFE1E6',bg1:C.white,bg2:C.soft,tx1:C.ink,tx2:C.gray,dk1:'#000000',dk2:C.ink,lt1:C.white,lt2:C.soft,hlink:C.orange,folHlink:'#926447'}};
const manifest=[];
function text(s,value,x,y,w,h,size=26,bold=false,color=C.ink,align='left'){
 const q=s.shapes.add({geometry:'textbox',name:String(value).replace(/\n/g,' ').slice(0,60),position:{left:x,top:y,width:w,height:h},fill:'none',line:{fill:'none',width:0}});
 q.text=String(value);q.text.style={typeface:'Pretendard',fontSize:size,bold,color,alignment:align,verticalAlignment:'top',autoFit:'none',wrap:'square',insets:0};return q;
}
function rect(s,x,y,w,h,fill,line='none'){return s.shapes.add({geometry:'rect',position:{left:x,top:y,width:w,height:h},fill,line:{fill:line,width:line==='none'?0:1}});}
function rule(s,y=636,x=64,w=1152){rect(s,x,y,w,1,C.line);}
function page(s){text(s,P.slides.items.length,1182,682,34,22,14,false,C.gray,'right');}
function notes(s,detail='',sources=[]){s.speakerNotes.text=detail+'\n\n출처 및 원본\n'+[...new Set(sources)].map(v=>'- '+v).join('\n');}
function add(title,sub='',section='',sources=[],detail=''){
 const s=P.slides.add();s.background.fill=C.white;
 if(section)text(s,section,64,29,1100,25,18,false,C.gray);
 text(s,title,64,72,1152,63,42,true);
 if(sub)text(s,sub,64,143,1152,60,24,false,C.gray);
 page(s);notes(s,detail,sources);manifest.push({slide:P.slides.items.length,title,section,sources});return s;
}
function foot(s,value,color=C.ink){rule(s);text(s,value,64,651,1105,34,22,true,color);}
async function image(s,file,x,y,w,h,alt){const bytes=await fs.readFile(file);return s.images.add({blob:new Uint8Array(bytes),contentType:/\.png$/i.test(file)?'image/png':'image/jpeg',alt,fit:'contain',position:{left:x,top:y,width:w,height:h}});}
function label(s,value,x,y,w=500){text(s,value,x,y,w,29,20,true,C.orange);}
function table(s,heads,rows,{x=64,y=218,widths=[300,410,442],height=365,size=23,headSize=size,headerHeight=48}={}){
 const vals=[heads,...rows];const t=s.tables.add({rows:vals.length,columns:heads.length,left:x,top:y,width:widths.reduce((a,b)=>a+b,0),height,columnWidths:widths,values:vals});
 t.borders.assign({fill:C.line,width:0.7,style:'solid'});
 for(let r=0;r<vals.length;r++){
  t.rows[r].height=r===0?headerHeight:(height-headerHeight)/rows.length;
  for(let c=0;c<heads.length;c++){
   const cell=t.getCell(r,c);cell.fill=r===0?C.soft:C.white;
   cell.text.style={typeface:'Pretendard',fontSize:r===0?headSize:size,bold:r===0,color:C.ink,verticalAlignment:'middle',alignment:'left',wrap:'square',insets:{left:12,right:12,top:8,bottom:8}};
  }
 }
 return t;
}
const PHASES=['초기 검사','단서·후보','사진 순위','지도·기하','거리사진','구조물 비교','투영 검사','결과 정리'];
function process(phase,title,sub,input,output,who,sources,detail=''){
 const s=P.slides.add();s.background.fill=C.white;
 PHASES.forEach((v,i)=>{const x=64+i*144;text(s,String(i+1).padStart(2,'0')+' '+v,x,23,142,25,16.5,i===phase,i===phase?C.orange:C.gray);if(i===phase)rect(s,x,54,129,2,C.orange);});
 text(s,title,64,78,1152,56,39,true);text(s,sub,64,137,1152,43,22,false,C.gray);
 label(s,'입력',64,198,80);text(s,input,133,194,475,61,23);
 label(s,'산출물',661,198,85);text(s,output,754,194,462,61,23);
 text(s,'수행  '+who+'     명령  AI 에이전트',64,270,1152,31,20,false,C.gray);rule(s,312);
 page(s);notes(s,detail,sources);manifest.push({slide:P.slides.items.length,title,phase:phase+1,sources});return s;
}
function doc(s,title,body,x,y,w,h,size=23){rect(s,x,y,w,h,C.soft);text(s,title,x+20,y+16,w-40,30,19,true,C.gray);text(s,body,x+20,y+60,w-40,h-72,size,false,C.ink);}

// 01–07: the problem-to-tool sequence and visual language follow reference slides 1–8.
{
 const s=P.slides.add();s.background.fill=C.white;
 text(s,'geo-slueth 소개',72,235,1120,80,57,true);
 text(s,'테스트 과정 정리 및 활용 가능성 파악',74,338,1110,57,36,true,C.orange);
 text(s,'사진의 단서를 실제 장소와 연결하고,\n조사 단계별 입력과 산출물을 확인합니다',76,435,1060,82,27,false,C.gray);
 text(s,'테스트 2026.10.28    정리 2026.10.29',76,640,1050,30,19,false,C.gray);page(s);
 notes(s,TITLE+'\n사용자 요청 제목을 표지에 반영했습니다. 도구의 정식 표기는 geo-sleuth입니다.',[REF,OLD,SKILL]);manifest.push({slide:1,title:TITLE});
}
{
 const s=add('발표 구성','','',[REF]);
 const agenda=[['01','필요한 이유','위치를 모르는 사진을 조사할 때 생기는 문제','03–04'],['02','geo-sleuth 소개','스킬의 역할과 AI·프로그램·데이터의 관계','05–07'],['03','테스트 소개','사진 한 장으로 시작한 독산성 위치 조사','08–09'],['04','테스트 과정과 산출물','8단계의 실제 자료와 활용 가능성','10–24']];
 agenda.forEach((v,i)=>{const y=205+i*98;text(s,v[0],490,y,65,40,27,true,C.orange);text(s,v[1],568,y,520,41,29,true);text(s,v[2],568,y+46,590,36,22,false,C.gray);text(s,v[3],1110,y+5,106,27,18,false,C.gray,'right');});
 text(s,'부록  25–28   작업·소스·결과·수행 대상·명령 대상·기타',64,657,1100,30,20,false,C.gray);
}
{
 const s=P.slides.add();s.background.fill=C.warm;
 text(s,'01  필요한 이유',72,60,1100,30,20,false,C.gray);
 text(s,'위치를 모르는 사진의 조사',72,268,1130,75,52,true);
 text(s,'사진 속 단서와 실제 장소를 연결할 근거가 필요합니다',74,369,1120,53,32,true,C.orange);
 text(s,'GPS와 간판이 없으면 지도와 참고사진을 반복해서 확인해야 합니다.\n어디를 확인했고 왜 그 장소로 판단했는지도 함께 남겨야 합니다.',76,518,1110,92,27,false,C.gray);
 page(s);notes(s,'필요성은 이번 테스트의 입력 조건과 조사 과정에 근거한 문제 정의입니다. 조사 시간 절감이나 정확도 개선 효과는 아직 측정하지 않았습니다.',[REF,path.join(T,'intake/intake.md')]);manifest.push({slide:3,title:'위치를 모르는 사진의 조사'});
}
{
 const s=add('사진 위치 조사에서 필요한 기능','','기존 문제와 해결 방식',[REF,path.join(T,'report.md')]);
 text(s,'조사할 때의 어려움',64,185,500,40,25,true,C.gray);text(s,'geo-sleuth로 정리하는 방식',687,185,529,40,25,true,C.orange);
 const rows=[['GPS·표지판이 없는 사진','사진만으로 검색할 지명을 알기 어렵습니다.','건물·시설·지형에서 단서 추출','관찰을 가설로 기록하고 공개 자료와 대조합니다.'],['여러 지도를 오가는 반복 확인','후보 위치마다 다른 사진과 방향을 확인합니다.','후보 사진의 순위와 기하 비교','비교할 자료를 모으고 다음 확인 대상을 좁힙니다.'],['판단 이유가 남지 않는 결과','최종 좌표만 있으면 조사 과정을 검토하기 어렵습니다.','중간 파일과 근거를 함께 저장','후보·좌표·대조 이미지·미확정 사항을 남깁니다.']];
 rows.forEach((v,i)=>{const y=251+i*130;text(s,v[0],64,y,520,40,30,true);text(s,v[1],64,y+52,530,59,23,false,C.gray);text(s,v[2],687,y,529,40,30,true,C.orange);text(s,v[3],687,y+52,529,59,23,false,C.gray);});
}
{
 const s=add('geo-sleuth 소개','사진의 단서를 지도·공개 사진·기하 계산과 대조하는 위치 조사 스킬','사진 위치 조사 도구',[SKILL,GH]);
 const left=[['사용자가 주는 자료','사진 파일과 선택적인 지역·시각 힌트'],['AI 에이전트의 역할','단서 해석, 후보 설정, 도구 호출과 최종 판단'],['스킬이 제공하는 것','조사 지침과 Python 실행 도구 묶음']];
 left.forEach((v,i)=>{const y=230+i*112;text(s,v[0],64,y,470,38,28,true);text(s,v[1],64,y+46,475,60,24,false,C.gray);});
 doc(s,'실제 스킬에 포함된 실행 도구','intake.py      사진·EXIF·OCR 검사\nboard.py      후보와 근거 관리\nmatch.py      이미지 비교·순위화\ngsv.py          거리사진 조회\npose.py         위치·방향 일관성 검사\nevidence.py  증거 이미지 제작',591,226,625,356,25);
 foot(s,'AI 에이전트가 스킬의 지침을 읽고, 필요한 프로그램을 선택해 실행합니다');
}
{
 const s=add('요청부터 결과까지의 처리 구조','사진에서 시작해, 검토할 수 있는 위치와 근거 자료를 만듭니다','geo-sleuth의 입출력',[SKILL,path.join(T,'result.json')]);
 const data=[['사용자 입력','사진 1장\n선택적인 지역·촬영 힌트'],['조사와 검증','AI의 해석과 도구 호출\n공개 자료 비교·좌표 계산'],['사용자가 받는 결과','장소·좌표·방향·오차 범위\n비교 이미지·판단 근거']];
 data.forEach((v,i)=>{const x=64+i*399;rect(s,x,262,354,252,i===1?C.warm:C.soft);text(s,v[0],x+24,291,306,43,31,true);text(s,v[1],x+24,370,306,107,25,false,C.gray);});
 text(s,'01',64,218,100,35,23,true,C.orange);text(s,'02',463,218,100,35,23,true,C.orange);text(s,'03',862,218,100,35,23,true,C.orange);
 foot(s,'중간 산출물이 남으므로, 결과를 얻은 이유를 단계별로 확인할 수 있습니다');
}
{
 const s=add('AI와 프로그램의 역할','이번 테스트는 하나의 AI 에이전트가 도구들을 호출하며 진행했습니다','geo-sleuth를 실행하는 주체',[path.join(T,'report.md'),SKILL]);
 table(s,['대상','받는 정보','수행하는 일'],[
 ['AI 에이전트','원본·후보 이미지와 도구 결과','단서 해석, 검색 조건 설정\n코드 작성·실행 요청·최종 판단'],
 ['Python 프로그램','AI가 지정한 사진·좌표·조건','파일 처리, 자료 조회\n수치 계산과 결과 저장'],
 ['DINOv2·SIFT','사용자 사진과 비교 사진','전체 유사도와 특징점 비교\n먼저 확인할 사진의 순위 산출'],
 ['공개 데이터 서비스','검색어·좌표·파노라마 ID','지도·건물 좌표·고도\n참고사진과 거리사진 제공']
 ],{y:218,widths:[230,400,522],height:378,size:23});
 foot(s,'DINOv2의 유사도 점수만으로 장소를 확정하지 않고, AI가 실제 구조물을 대조합니다');
}

// 08–09: introduce the concrete test, then show its complete sequence.
{
 const s=add('테스트 소개','2026.10.28  사진 한 장의 촬영 위치와 방향 찾기','02  실제 테스트',[PHOTO,path.join(T,'intake/intake.md'),OLD]);
 await image(s,PHOTO,64,227,804,370,'실제 입력 사진: 벚꽃과 숲 너머 동탄의 고층 건물');
 label(s,'입력 조건',914,230,302);text(s,'1440 × 810px JPG\nGPS 정보 없음\n읽을 수 있는 글자 없음',914,275,302,123,25);
 label(s,'확인할 내용',914,435,302);text(s,'장소와 촬영 방향\n단계별 입출력\n각 판단의 수행 주체',914,481,302,116,25);
 foot(s,'정답 좌표는 사후 평가에 사용하고, 조사 근거와 별도로 확인합니다');
}
{
 const s=add('테스트 과정과 단계별 산출물','실제 수행한 24개 작업을 8단계로 묶었습니다','03  테스트 과정',[path.join(T,'board.json'),path.join(T,'report.md')]);
 const stage=[['01','초기 검사','EXIF·OCR·잘라낸 이미지'],['02','단서와 후보','건물 가설·참고사진 24개'],['03','사진 순위','유사도·특징점 비교 결과'],['04','지도와 기하','시설 좌표·촬영 후보 구역'],['05','거리사진 확보','파노라마 위치·비교 이미지'],['06','구조물 대조','일치 근거·유력 도로 구간'],['07','투영 검사','방향·화각·재투영 결과'],['08','결과 정리','좌표·증거 이미지·보고서']];
 stage.forEach((v,i)=>{const x=64+(i%4)*294,y=230+Math.floor(i/4)*190;text(s,v[0],x,y,70,38,26,true,C.orange);text(s,v[1],x,y+48,270,42,29,true);text(s,v[2],x,y+103,265,73,22,false,C.gray);});
 foot(s,'각 단계에서 얻은 산출물이 다음 단계의 입력으로 이어집니다');
}

// 10 Phase 01.
{
 const s=process(0,'사진 기본정보와 작은 단서 확인','GPS·글자·가장자리 정보를 확인해 조사 경로를 고릅니다','사용자 JPG의 파일 정보와 픽셀','intake.md, exif.json, ocr.json, edges/','intake.py·OCR / AI의 이미지 확인',[PHOTO,path.join(T,'intake/intake.md'),path.join(T,'intake/ocr.json')],'대응 작업 1–6. 사용자 요청으로 시작하고 이후 실행 명령은 AI가 내렸습니다. 외부 역검색은 의존성 다운로드 실패 후 업로드 실행이 자동 승인 검토에서 거부되어 사용하지 못했습니다. Baidu·Yandex에 사용자 사진을 업로드하지 않았습니다.');
 label(s,'사진 가장자리·모서리 8개를 분리해 확인',64,329,556);await image(s,path.join(T,'edges_sheet.jpg'),64,368,556,248,'초기 조사에서 실제로 생성한 가장자리 이미지 목록');
 doc(s,'실제 OCR 결과 발췌','size: [1440, 810]\nbackend: rapidocr\nitems: []\n\nGPS 메타데이터 없음',660,350,556,266,25);
 foot(s,'GPS·글자 단서를 얻지 못해, 건물과 시설의 시각적 특징을 사용했습니다');
}
// 11 Phase 02.
{
 const s=process(1,'건물군을 식별하고 공개 조망 사진 수집','네 타워의 높이 순서와 꼭대기 형태를 기준으로 후보를 찾았습니다','타워·망·아파트군의 형태와 배치','메타폴리스 가설, 참고사진 24개, refs.json','AI의 해석·검색 / public_refs.py',[skyline,path.join(T,'refs.json'),'https://taijung.tistory.com/159','https://ggc.ggcf.kr/p/654ad78777e5f81f54e4a703'],'대응 작업 7–9. 타워군은 처음에는 시각적 가설이었고 공개 사진과 지도에서 대조했습니다. 독산성과 양산봉 주변이 후보에 포함되었습니다. 공개 HTML의 관련 문구 주변에서 이미지 URL을 추출했습니다.');
 label(s,'원본의 도시 부분 확대',64,330,556);await image(s,skyline,64,379,556,202,'사용자 사진의 원거리 건물군 확대');
 label(s,'독산성 방문 글에 실린 공개 조망 사진',660,330,556);await image(s,path.join(T,'refs/14.jpg'),660,370,556,246,'독산성 공개 조망 사진');
 foot(s,'먼저 보이는 건물을 찾고, 그 건물이 같은 배치로 보이는 촬영 후보를 조사했습니다');
}
// 12 Phase 03.
{
 const s=process(2,'참고사진의 확인 순서 산출','DINOv2가 전체 유사도를 계산하고, SIFT가 세부 특징점을 비교합니다','원본의 도시 영역과 공개 참고사진 24개','matches.json, matches.jpg, 비교 우선순위','match.py의 DINOv2·SIFT / 로컬 CPU',[path.join(T,'matches.json'),path.join(T,'matches.jpg'),path.join(T,'public_refs.py')],'대응 작업 10–11. 쿼리 영역은 원본 좌표 450,490,1440,660입니다. DINOv2-small은 사전 학습 모델이며 이번 사진으로 학습시키지 않았습니다. CLS와 patch mean 특징을 정규화해 코사인 유사도로 비교했습니다. SIFT/RANSAC으로 강한 자동 대응은 확보하지 못했습니다.');
 label(s,'프로그램이 정렬한 상위 참고사진',64,330,775);await image(s,assets.refs,64,369,775,248,'DINOv2와 SIFT로 비교한 공개 참고사진 상위 목록');
 text(s,'입력 영역을 지정',890,364,326,38,26,true);text(s,'하늘과 꽃보다\n건물·시가지에 집중',890,411,326,69,24,false,C.gray);
 text(s,'순위의 사용 방법',890,505,326,36,26,true);text(s,'상위 사진부터 열어\n고정 구조물을 직접 확인',890,551,326,66,24,false,C.gray);
 foot(s,'유사도는 비교 순서입니다. 점수만으로 독산성이나 양산봉을 확정하지 않았습니다');
}
// 13 Phase 04 maps.
{
 const s=process(3,'사진의 물체를 지도상의 좌표와 연결','지도에 있는 동일 시설을 찾아 사진 속 배치와 비교할 기준점을 만듭니다','메타폴리스·망 시설의 식별 가설','metapolis.geojson, 위성영상, 시설 대표 좌표','OSM 조회·지도 프로그램 / AI의 시설 대조',[path.join(T,'metapolis.geojson'),path.join(T,'metapolis_map.jpg'),path.join(T,'sema_area.jpg')],'대응 작업 12–13. OSM 건물 외곽선 꼭짓점의 평균을 대표 좌표로 사용했으며 지붕 끝의 정밀 측량 좌표는 아닙니다. 초록색 망 시설의 대응은 AI의 해석을 포함합니다. Google 지도 타일을 내려받았고 확대 단계와 타일 원점을 기록해 픽셀을 WGS84 좌표로 바꾸었습니다.');
 label(s,'메타폴리스 일대 위성영상',64,330,556);await image(s,path.join(T,'metapolis_map.jpg'),64,368,556,248,'메타폴리스 일대 위성영상');
 label(s,'초록색 망 시설과 주변 아파트 배치',660,330,556);await image(s,assets.net,660,368,556,248,'비교 대상으로 해석한 골프연습장 망 시설 위성영상');
 foot(s,'사진 속 픽셀 위치는 AI가 판독했고, 실제 위치·높이는 지도 자료에서 가져왔습니다');
}
// 14 Phase 04 geometry.
{
 const s=process(3,'물체 사이의 각도로 촬영 구역 축소','가상의 촬영 지점마다 타워와 망 시설이 사진처럼 벌어져 보이는지 계산합니다','시설 좌표와 사진 속 가로 위치','horizontal_scan.json, 독산성 북동쪽 후보 구간','AI가 작성한 geometry_scan.py',[path.join(T,'geometry_scan.py'),path.join(T,'horizontal_scan.json'),path.join(T,'fixed_tower_results.json')],'대응 작업 14–15. 위도 37.179–37.192, 경도 127.016–127.029를 0.00025도 간격으로 비교했습니다. 가로 배치만으로 좋은 해가 여러 점에 걸쳐 이어져 단일 위치를 결정하지 못했습니다. 타워만 사용한 자유 위치 추정은 거의 일렬인 배치 때문에 불안정하여 채택하지 않았습니다.');
 label(s,'좁혀진 독산성 북동쪽 진입로 주변',64,330,670);await image(s,assets.map,64,369,670,247,'독산성 및 보적사 북동쪽 진입로 위성영상');
 table(s,['사진에서 읽은 대상','가로 위치 x'],[['타워 A / B','716.5 / 734.5'],['타워 C / D','762.0 / 781.0'],['초록색 망 중심','약 866']],{x:788,y:365,widths:[272,156],height:201,size:20,headerHeight:40});
 text(s,'비슷하게 맞는 점이 여러 개여서\n실제 거리사진으로 추가 확인',788,580,428,40,20,false,C.gray);
 foot(s,'타워만으로 푼 자유 위치 추정은 불안정해 채택하지 않았습니다');
}
// 15 Phase 05.
{
 const s=process(4,'후보 구역에서 비교할 거리사진 확보','위치·방향·화각을 지정해 원본과 같은 쪽을 바라보는 화면을 받습니다','후보 좌표, 방향 61°, 상향 8°, 화각 67°','road.index.json, 거리사진 20개 비교 항목','gsv.py / Google 거리사진 서비스',[path.join(T,'road.index.json'),path.join(T,'road_north.json'),path.join(T,'street_reverse.jpg')],'대응 작업 16–17. 20개 항목은 고유 파노라마 ID 19개이며 중복 항목 하나를 포함합니다. Google에는 좌표·ID·방향·화각을 전달했으며 원본 사진을 업로드하지 않았습니다. 이 좌표는 거리사진의 위치이며 사용자 사진의 GPS가 아닙니다. 날짜는 각 이웃 사진별로 검증하지 않아 확정 자료로 쓰지 않았습니다.');
 doc(s,'거리사진 조회의 실제 요청 조건','heading: 61°\npitch: 8°\nfov: 67°\n\n20개 항목 / 고유 파노라마 19개',64,352,556,264,26);
 label(s,'같은 후보 지점의 반대 방향 시야',660,330,556);await image(s,path.join(T,'street_reverse.jpg'),660,369,556,247,'상위 후보 지점에서 반대 방향을 본 실제 거리사진');
 foot(s,'거리사진 서비스는 좌표가 있는 비교 화면을 제공하고, 사용자 사진과의 일치는 따로 판단합니다');
}
// 16 Phase 06 ranking.
{
 const s=process(5,'거리사진의 상위 후보 확인','프로그램의 비교 점수와 실제 구조물의 대응 여부를 함께 확인합니다','사용자 사진의 도시 영역과 거리사진 목록','road_matches.json, 상위 거리사진 목록','DINOv2·SIFT / AI의 상위 이미지 검토',[path.join(T,'road_matches.json'),path.join(T,'road_matches.jpg')],'대응 작업 18. 최상위 유사도 0.5864, 초기 특징점 대응 4개, 인라이어 기록 0개입니다. 스크립트는 초기 대응이 8개보다 적으면 기하 검사를 실행하지 않고 인라이어 0을 반환합니다. 따라서 자동 대응 검증은 성립하지 않았습니다.');
 label(s,'비교 순위 상위 6개 항목',64,330,790);await image(s,assets.roads,64,369,790,247,'거리사진 후보를 유사도 순서로 정렬한 비교 이미지');
 text(s,'0.5864',900,365,316,68,47,true,C.orange);text(s,'최상위 전체 유사도',900,437,316,33,22,false,C.gray);
 text(s,'SIFT 인라이어 0개',900,499,316,39,26,true);text(s,'초기 대응점이 적어\n강한 자동 검증은 미확보',900,549,316,70,23,false,C.gray);
 foot(s,'가장 높은 점수를 받은 사진도, 장소를 확정하려면 실제 구조물 대조가 필요했습니다');
}
// 17 Phase 06 evidence.
{
 const s=process(5,'고정 구조물의 순서와 배치 대조','먼 도시 풍경과 가까운 지형이 함께 맞는 도로 구간을 확인했습니다','원본과 최상위 거리사진','타워·망·아파트군·작은 지붕의 대응 근거','AI 에이전트의 직접 이미지 비교',[path.join(T,'photo_annotated.jpg'),path.join(T,'street_annotated.jpg'),'https://www.google.com/maps/@?api=1&map_action=pano&pano=JLn8Mh9EZ02Qha_FQYGYdg&heading=61&pitch=8&fov=67'],'대응 작업 19–20. 작은 지붕은 낮은 해상도에서 위치와 형태가 대응한다고 판단했으며 창문 등 세부 특징을 정밀 일치시킨 것은 아닙니다. 수목·계절·촬영 위치 차이가 있어 같은 나무와 정확한 발 디딘 자리는 확정하지 못했습니다.');
 label(s,'사용자 사진',64,330,556);await image(s,path.join(T,'photo_annotated.jpg'),64,372,556,244,'사용자 사진에서 네 종류의 구조물에 번호를 표시');
 label(s,'북동쪽 진입로의 공개 거리사진',660,330,556);await image(s,path.join(T,'street_annotated.jpg'),660,372,556,244,'상위 거리사진의 대응 구조물에 같은 번호를 표시');
 foot(s,'① 타워  ② 초록색 망  ③ 아파트군  ④ 작은 지붕을 함께 확인했습니다');
}
// 18 Phase 07.
{
 const s=process(6,'대표 위치에서 건물의 화면 위치 재계산','후보 위치를 고정하고, 타워가 사진 속 지붕 위치에 나타날 수 있는지 점검했습니다','후보 좌표, 지표 124m, 눈높이 가정 1.6m','final_pose.json, pose_selfcheck.jpg','terrain.py·pose.py / AI가 작성한 보조 코드',[path.join(T,'final_pose.json'),path.join(T,'final_points.json'),path.join(T,'pose_selfcheck.jpg')],'대응 작업 21. 대표 위치는 고정했습니다. 지표 약124m에 가정한 눈높이1.6m를 더했습니다. 타워 높이는 지표 약65m와 OSM 기록 높이를 더했습니다. 카메라 방향·기울기·화각을 조정했으며 RMS0.81px은 재투영 일관성 검사입니다. pose.py 수평선 안내의 부호 불일치를 근거에서 제외하고 실제 project 출력을 확인했습니다.');
 label(s,'타워 지붕의 투영 위치 확대',64,330,556);await image(s,assets.pose,64,377,556,232,'기하 계산으로 예측한 타워 위치를 원본 위에 표시한 실제 출력 확대');
 table(s,['검사 항목','계산 결과'],[['방향 / 수평 화각','약 60.5° / 66.7°'],['상향 각도','약 8.1°'],['지붕 재투영 RMS','약 0.81px']],{x:660,y:365,widths:[286,270],height:251,size:23,headerHeight:45});
 foot(s,'0.81px은 선택한 위치와의 일관성입니다. 촬영점을 독립적으로 결정한 오차가 아닙니다');
}
// 19 Phase 08.
{
 const s=process(7,'좌표와 근거를 묶어 최종 결과 작성','후보 장부를 점검하고, 위성영상과 비교사진을 증거 자료로 정리했습니다','비교 근거, 대표 좌표, 남은 불확실성','result.json, evidence.jpg, report.md','board.py·evidence.py / AI의 최종 범위 판단',[path.join(T,'result.json'),path.join(T,'evidence.jpg'),path.join(T,'report.md')],'대응 작업 22–24. 대표점은 최상위 거리사진 주변의 점이며 후보의 중간점이 아닙니다. 약150m는 AI가 남은 불확실성을 고려해 제시한 대략적인 탐색 범위로, 통계적 신뢰구간이 아닙니다. 증거 이미지는 실제 지도와 사진을 조립한 것입니다.');
 label(s,'최종 증거 이미지의 지도 부분',64,330,556);await image(s,assets.evidenceMap,64,369,556,247,'최종 evidence.jpg에 표시한 대표 위치와 촬영 방향');
 text(s,'독산성·보적사 북동쪽 진입로 주변',660,359,556,42,29,true);
 text(s,'37.1843, 127.0223',660,422,556,53,34,true,C.orange);
 text(s,'촬영 방향  약 61°\n탐색 범위  약 반경 150m\n정확한 촬영 자리는 미확정',660,500,556,110,25,false,C.gray);
 foot(s,'지역의 확신과 정확한 촬영점의 확신을 구분해 보고했습니다');
}

// 20–24: outputs first, then evaluation and potential use.
{
 const s=add('테스트에서 남은 산출물','각 파일은 조사 단계와 판단 근거를 다음 처리에 전달합니다','04  산출물 정리',[path.join(T,'report.md'),path.join(T,'result.json')]);
 table(s,['단계','주요 파일','담긴 내용'],[
 ['사진 검사','intake.md, exif.json, ocr.json','기본정보·글자 검출 결과·실패 사유'],
 ['단서·참고사진','refs.json, matches.json','출처와 비교 순위'],
 ['지도·기하','metapolis.geojson\nhorizontal_scan.json','건물 좌표·가로 배치 비교 결과'],
 ['거리사진','road.index.json\nroad_matches.json','파노라마 위치·방향·비교 점수'],
 ['투영 검사','final_pose.json\npose_selfcheck.jpg','가정한 카메라 조건·예측 화면 위치'],
 ['최종 결과','result.json, evidence.jpg\nreport.md, board.json','좌표·범위·근거·대안·조사 기록']
 ],{y:211,widths:[190,430,532],height:400,size:21,headerHeight:43});
 foot(s,'이미지로 비교하고, JSON으로 값을 전달하며, 보고서로 판단 이유를 설명합니다');
}
{
 const s=add('대표 좌표와 제공된 정답의 사후 비교','기존 자료에 제시된 실제 좌표를 사용해 두 점 사이의 직선거리를 계산했습니다','05  테스트 평가',[OLD,path.join(ROOT,'ppt_build_20261029/test_metrics.json'),path.join(T,'result.json')],'제공된 정답 좌표 37.18428,127.02244는 기존 PPT와 test_metrics.json의 값입니다. 해당 좌표의 현장 측량 여부를 새로 검증하지 않았습니다. Haversine식과 지구 반지름6371008.8m를 사용한 사후 비교입니다.');
 text(s,'12.6',64,267,425,126,90,true,C.orange);text(s,'m',272,325,90,55,36,true,C.orange);
 text(s,'이번 대표점과 제공 정답점의 거리',67,414,500,77,29,true);
 table(s,['구분','위도','경도'],[['제공된 정답','37.18428','127.02244'],['보고 대표점','37.18430','127.02230']],{x:600,y:263,widths:[190,213,213],height:216,size:25,headerHeight:50});
 text(s,'보고한 탐색 범위는 약 반경 150m\n정답과의 거리는 결과를 얻은 뒤 사후 계산',600,520,616,81,24,false,C.gray);
 foot(s,'한 장의 사후 결과입니다. 평균 정확도나 12.6m의 보장 범위를 의미하지 않습니다');
}
{
 const s=add('확인한 범위와 남은 한계','장소를 좁힌 근거와, 정확한 촬영점을 확정하기 어려운 이유를 함께 봅니다','테스트에서 확인한 점',[path.join(T,'report.md'),path.join(T,'final_pose.json')]);
 label(s,'확인한 범위',64,220,530);text(s,'독산성·보적사 주변',64,269,530,43,31,true);text(s,'건물군과 시설, 근거리 지형이\n공개 사진·거리사진과 함께 대응',64,326,530,91,26,false,C.gray);text(s,'북동쪽 진입로 구간',64,456,530,43,31,true);text(s,'상위 거리사진의 위치와 배치를 확인\n정확한 촬영 자리는 추가 검증 필요',64,513,530,94,26,false,C.gray);
 label(s,'남은 제약',687,220,529);text(s,'자동 특징점 일치 부족',687,269,529,43,31,true);text(s,'최상위 거리사진의 인라이어는 0개\n구조물을 직접 비교해 판단',687,326,529,91,26,false,C.gray);text(s,'위치 계산의 불안정성',687,456,529,43,31,true);text(s,'먼 타워들이 거의 일렬로 배열\n가깝고 방향이 다른 기준점이 필요',687,513,529,94,26,false,C.gray);
 foot(s,'단일 사진의 결과를 일반적인 정확도로 확대 해석하지 않습니다');
}
{
 const s=add('사진의 위치를 검토하는 업무에 활용','이번 테스트가 보여 준 기능을 바탕으로 한 활용 제안입니다','06  활용 가능성',[OLD,path.join(T,'report.md')],'이 슬라이드는 활용 제안입니다. 해당 업무에 적용한 실증 결과, 시간 절감 효과, 서비스 수준의 정확도는 측정하지 않았습니다.');
 table(s,['활용 장면','주요 입력','활용할 산출물'],[
 ['사진 정리와 위치 태깅','위치 정보가 없는 사진\n대상 지역·시설 목록','후보 장소·좌표·근거 이미지\n태그를 붙일지 검토'],
 ['현장·시설 사진 확인','제출 사진과 신고 장소\n시설 지도·과거 사진','일치·불일치 구조물\n추가 사진 필요 여부'],
 ['공개 사진의 장소 검증','이용 가능한 사진\n기사·시설명·지역 정보','대조 기록과 자료 출처\n공개 전 확인할 미확정 사항']
 ],{y:227,widths:[280,418,454],height:351,size:25,headerHeight:50});
 foot(s,'위치 후보와 증거를 제공하고, 이용자가 검토하는 사용 방식부터 적용할 수 있습니다');
}
{
 const s=add('다음 테스트와 개선 방향','실제 실패 지점과 남은 불확실성을 후속 개발의 입력으로 사용합니다','활용 전 확인할 과제',[OLD,path.join(T,'report.md')],'모든 항목은 후속 제안입니다. 현재 구현 완료나 성능 개선을 주장하지 않습니다.');
 table(s,['확인한 제약','개선할 처리','다음 평가에서 확인할 결과'],[
 ['가까운 기준점 부족','다른 각도의 추가 사진 확보\n고정 구조물 좌표 연결','촬영점의 안정적인 위치 추정'],
 ['자동 특징점 대응 부족','주목 영역과 촬영 계절 비교\n구조물별 확인 이유 저장','일치 근거를 다시 검토할 수 있음'],
 ['외부 서비스·전송 제약','사용 가능한 자료와 전송 범위 설정\n실패 시 다른 경로로 재개','실행 경로·미실행 사유 확인'],
 ['단일 사례의 사후 평가','정답을 가린 새 사진으로 평가\n지역·지형별 결과 집계','오차 분포·실패율·시간·비용']
 ],{y:218,widths:[255,458,439],height:381,size:23,headerHeight:48});
 foot(s,'입출력과 실행 이력을 고정하고, 새로운 사진의 평가 결과를 보고 적용 범위를 넓힙니다');
}

// 25–28: retain all 24 operations and the requested six-column mapping.
const ops=[
 ['1  위치 조사 요청','사용자 사진·스킬 지정','조사 시작','AI 에이전트','사용자','별도 하위 AI 없음'],
 ['2  절차 확인','스킬 지침·도구','조사 기준·경로','AI 에이전트','AI','스킬은 지침·코드'],
 ['3  파일 정보 검사','JPG 내부 정보','활용할 GPS 없음','intake.py','AI','파일명 날짜 미확정'],
 ['4  글자 읽기','사진 픽셀','글자 검출 없음','OCR 프로그램','AI','주소·간판 확인'],
 ['5  확대·분할 확인','원본·가장자리','타워·망 등 단서','프로그램 + AI','AI','기존 픽셀 확대'],
 ['6  역검색 시도','사용자 사진','실패·차단 기록','프로그램·승인 시스템','AI','외부 업로드 안 함'],
 ['7  건물 가설','타워 모양·높이 순서','메타폴리스 가설','AI 에이전트','AI','공개 자료로 후속 대조'],
 ['8  공개 자료 검색','웹 글·조망 사진','독산성·양산봉 후보','검색 도구 + AI','AI','대상과 촬영점 구분'],
 ['9  참고사진 수집','공개 HTML·사진 URL','사진 24개·refs.json','public_refs.py','AI','관련 문구 주변 추출'],
 ['10  전체 유사도','도시 영역·참고사진','비교 순위','DINOv2 / match.py','AI','로컬 CPU 실행'],
 ['11  세부 점 비교','원본·후보 사진','특징점·인라이어','SIFT·RANSAC','AI','강한 자동 일치 없음'],
 ['12  지도 좌표 확보','위성영상·OSM','시설 대표 좌표','프로그램 + AI','AI','시설 대응에 해석 포함'],
 ['13  픽셀 위치 입력','사진의 타워·망','화면 좌표 (x,y)','AI 에이전트','AI','시각 판독의 근사값'],
 ['14  촬영 구역 계산','시설·픽셀 좌표','북동쪽 후보 구간','geometry_scan.py','AI','가상의 격자점 비교'],
 ['15  자유 위치 추정','타워 위치·높이','불안정해 미채택','pose.py','AI','거의 일렬인 기준점'],
 ['16  거리사진 조회','후보 좌표·반경','ID·위치 목록','gsv.py / Google','AI','20항목·고유 ID19개'],
 ['17  방향 화면 확보','ID·방향·화각','비교용 JPEG','gsv.py / Google','AI','좌표·방향만 요청'],
 ['18  거리사진 순위','원본·거리사진','road_matches.json','DINOv2·SIFT','AI','순위 뒤 직접 검토'],
 ['19  구조물 대조','상위 사진·원본','4종 구조물 대응','AI 에이전트','AI','핵심 장소 판단'],
 ['20  뒤쪽 시야 확인','반대 방향 화면','주변 지형 확인','gsv.py + AI','AI','촬영 상황 점검'],
 ['21  투영 재검증','고도·기준점·후보','방향·화각·0.81px','terrain.py·pose.py','AI','고정 위치 일관성'],
 ['22  후보·근거 점검','후보 장부·근거','순위·누락 확인','board.py + AI','AI','점수는 정답 확률 아님'],
 ['23  범위 판단','비교 결과·불확실성','대표점·약150m','AI 에이전트','AI','통계적 신뢰구간 아님'],
 ['24  결과물 작성','지도·사진·기록','증거 이미지·보고서','프로그램 + AI','AI','실제 자료를 조립']
];
for(let k=0;k<4;k++){
 const s=add(`세부 작업과 수행 주체 ${k+1} / 4`,`실제 작업 ${k*6+1}–${k*6+6}. 명령의 ‘AI’는 이 대화의 AI 에이전트입니다`,'부록',[path.join(T,'report.md'),path.join(T,'board.json')]);
 table(s,['작업','소스','결과','수행 대상','명령','기타'],ops.slice(k*6,k*6+6),{y:217,widths:[190,224,214,199,80,245],height:389,size:18.5,headSize:19,headerHeight:45});
 foot(s,k===0?'사용자가 조사 목적을 요청하고, AI가 각 프로그램의 실행 조건과 다음 행동을 정했습니다':'실행 주체와 판단 주체를 함께 기록하면, 어떤 데이터로 결론을 냈는지 추적할 수 있습니다');
}

await fs.writeFile(path.join(B,'manifest.json'),JSON.stringify({title:TITLE,slideCount:P.slides.items.length,slides:manifest},null,2));
await (await PresentationFile.exportPptx(P)).save(path.join(B,'candidate.pptx'));
console.log(JSON.stringify({slideCount:P.slides.items.length,draft:path.join(B,'candidate.pptx')},null,2));
