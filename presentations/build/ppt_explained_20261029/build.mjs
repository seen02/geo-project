import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import {Presentation,PresentationFile} from '@oai/artifact-tool';

const ROOT='C:/Users/admin/img2place_project';
const B=path.join(ROOT,'ppt_explained_20261029');
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
 text(s,who,64,263,1152,49,21,false,C.gray);rule(s,319);
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
 const agenda=[['01','필요한 이유','위치를 모르는 사진을 조사할 때 생기는 문제','03–04'],['02','geo-sleuth 소개','스킬의 역할과 AI·프로그램·데이터의 관계','05–07'],['03','테스트 소개','사진 한 장으로 시작한 독산성 위치 조사','08–09'],['04','테스트 과정과 산출물','8단계의 실제 자료와 활용 가능성','10–28']];
 agenda.forEach((v,i)=>{const y=205+i*98;text(s,v[0],490,y,65,40,27,true,C.orange);text(s,v[1],568,y,520,41,29,true);text(s,v[2],568,y+46,590,36,22,false,C.gray);text(s,v[3],1110,y+5,106,27,18,false,C.gray,'right');});
 text(s,'부록  29–32   작업·소스·결과·수행 대상·명령 대상·기타',64,657,1100,30,20,false,C.gray);
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

// Process explanation: inputs, instructions, execution, purpose, outputs and the next input.
{
 const s=process(0,'파일 정보와 사진 속 글자 확인','GPS나 글자로 장소를 바로 좁힐 수 있는지 먼저 확인하기 위한 단계입니다','동일한 1440 × 810px JPG','GPS 없음·문자 검출 없음이라는 결과\nintake.md / exif.json / ocr.json','AI가 검사를 지시. intake.py와 OCR이 파일·문자를 읽고, AI가 분할 이미지를 확인. ',[PHOTO,path.join(T,'intake/intake.md'),path.join(T,'intake/ocr.json')],'분석 파일은 최초 기록의 KakaoTalk_20261028_142436521_01.jpg이며 현재 작업 폴더에서는 test_astra_1.jpg로 같은 사진을 확인했습니다. 새 파일로 사본을 만든 작업은 최초 조사에서 기록되지 않았으므로 그 단계가 있었다고 주장하지 않습니다. EXIF와 OCR 결과는 활용할 GPS 없음과 items 빈 배열입니다. 역검색은 의존성 오류 후 외부 업로드 요청이 자동 승인 검토에서 거부되어 사용하지 못했습니다.');
 label(s,'실제 가장자리·모서리 확인 자료',64,337,556);await image(s,path.join(T,'edges_sheet.jpg'),64,377,556,239,'초기 조사에서 실제로 생성한 사진 가장자리와 모서리 이미지');
 doc(s,'실제 검사 결과와 해석','size: [1440, 810]\nbackend: rapidocr\nitems: []\n\n빈 배열 []는 읽어낸 글자가 없다는 뜻',660,360,556,256,24);
 foot(s,'다음 입력  GPS·글자가 없는 상태이므로, 사진의 건물과 시설 형태를 관찰합니다');
}
{
 const s=process(1,'AI가 관찰과 장소 가설을 구분','어떤 특징을 검색하고, 어떤 물체를 지도와 연결할지 정하기 위한 단계입니다','원본과 확대·분할 이미지','타워·망·아파트·지붕이라는 관찰\n메타폴리스·골프연습장이라는 가설','AI가 이미지를 열어 관찰하고 가설을 제안. 프로그램은 확대·분할 이미지를 제공. ',[PHOTO,skyline,path.join(T,'board.json')],'직접 본 사실과 시설명 추정을 구분했습니다. 네 타워가 메타폴리스라는 해석은 공개 사진과 지도 대조로 검증할 가설입니다. 골프연습장이라는 시설 해석도 최초에는 확정이 아닙니다. 후보를 세계 전체에 대해 빠짐없이 열거한 조사가 아닙니다.');
 label(s,'형태를 비교한 원거리 건물군',64,337,680);await image(s,skyline,64,384,680,129,'원본 사진의 네 타워와 주변 시가지 확대');
 label(s,'후속 대조에 사용한 가까운 지붕',64,535,680);await image(s,assets.roof,64,572,438,44,'원본의 오른쪽 아래 작은 지붕 부분');
 text(s,'관찰',813,371,403,35,27,true);text(s,'네 타워의 높이·꼭대기 모양\n초록색 망과 아파트군의 순서',813,417,403,70,23,false,C.gray);
 text(s,'추가 확인이 필요한 가설',813,512,403,36,26,true);text(s,'메타폴리스인가?\n망 시설이 골프연습장인가?',813,558,403,65,23,false,C.gray);
 foot(s,'다음 입력  건물·시설 이름과 배치 가설을 공개 검색의 조건으로 사용합니다');
}
{
 const s=process(1,'검색어로 공개 자료를 찾고 사진 수집','사진 속 건물을 실제 시설과 연결하고, 같은 조망을 가진 후보 장소를 찾습니다','AI가 만든 지명·시설 관련 검색어\n공개 웹페이지와 이미지 주소','독산성·양산봉 주변 후보\n공개 참고사진 24개와 refs.json','AI가 검색어와 확인할 자료를 선택. 검색 도구가 결과를 반환하고 public_refs.py가 사진을 저장.',['https://taijung.tistory.com/159','https://ggc.ggcf.kr/p/654ad78777e5f81f54e4a703',path.join(T,'refs.json'),path.join(T,'public_refs.py')],'원래 검색 질의 전체는 산출물만으로 복원할 수 없으므로 재구성한 검색어를 당시 실행 문자열이라고 제시하지 않습니다. 공개 HTML에서 메타폴리스·동탄 조망·양산봉 관련 문구 주변의 이미지 주소를 추출했습니다. 역이미지 검색 경로는 의존성 오류 후 업로드 자동 승인 검토에서 거부되어 사용하지 않았습니다. 사용자 사진을 Baidu·Yandex에 보내지 않았습니다.');
 label(s,'독산성 방문 글의 공개 조망 사진',64,337,660);await image(s,path.join(T,'refs/14.jpg'),64,378,660,238,'독산성 관련 공개 글에 실린 메타폴리스 방향 조망');
 doc(s,'외부에 보낸 정보','텍스트 검색  지명·시설 관련 검색어\n사진 수집     공개 이미지의 URL\n\n사용자 사진의 외부 역검색은 미사용',789,360,427,256,22);
 foot(s,'다음 입력  저장한 참고사진 24개를 원본과 비교할 후보 이미지로 넘깁니다');
}
{
 const s=process(2,'DINOv2가 사진의 전체 유사도 계산','수집한 사진 중 무엇부터 확인할지 순서를 정하기 위해 사용했습니다','원본의 도시 부분과 참고사진 24개','유사도·순위·파일의 대응 목록\nmatches.json / matches.jpg','AI가 비교 영역을 지정하고 실행을 지시. match.py가 DINOv2-small을 로컬 CPU에서 실행. ',[path.join(T,'matches.json'),path.join(T,'matches.jpg'),'C:/Users/admin/.codex/skills/geo-sleuth/scripts/match.py'],'원본 좌표450,490,1440,660 영역을 사용했습니다. match.py는 잘라낸 원본의 전체·중앙·좌·우 보기를 만들고 각 보기를224×224로 변환합니다. 후보는 같은 모델로 벡터화하고 원본 여러 보기 중 가장 높은 코사인 유사도를 채택합니다. 모델은 장소명이나 좌표를 출력하지 않습니다. 공개 참고사진1위는0.6813입니다.');
 label(s,'실제 프로그램이 정렬한 상위 참고사진',64,337,775);await image(s,assets.refs,64,378,775,238,'실제 DINOv2 비교 순위의 상위 참고사진 목록');
 text(s,'사진을 숫자 특징으로 변환',894,371,322,72,26,true);text(s,'224 × 224px 입력\n전체·중앙·좌·우 보기 비교\n비슷한 특징의 사진을 위로 정렬',894,462,322,111,23,false,C.gray);
 foot(s,'다음 입력  상위 참고사진을 특징점 검사와 지도 대조의 우선 대상으로 사용합니다');
}
{
 const s=process(2,'SIFT와 RANSAC이 세부 대응 검사','전체 분위기가 비슷한 사진에서 실제 모서리·질감도 대응하는지 확인합니다','사용자 사진과 각 공개 참고사진','초기 대응 후보와 기하 검사 통과 수\nmatches.json의 matches / inliers','AI가 비교를 지시. OpenCV의 SIFT가 특징점을 찾고 RANSAC이 기하 관계를 검사. ',[path.join(T,'matches.json'),path.join(T,'refs/00.jpg'),'C:/Users/admin/.codex/skills/geo-sleuth/scripts/match.py'],'공개 참고사진의 최상위 항목은 score_global0.6813, 초기 대응9개, 인라이어4개입니다. 코드의 강한 자동 일치 기준은 인라이어15개 이상입니다. 거리사진 최상위0.5864와 인라이어0은 별도의 비교 결과이므로 혼동하지 않습니다. 인라이어는 물체 수나 정답 확률이 아닙니다.');
 label(s,'공개 참고사진의 최상위 항목',64,337,556);await image(s,path.join(T,'refs/00.jpg'),64,378,556,238,'유사도1위였던 양산봉 방향 공개 조망 사진');
 table(s,['검사 항목','이 사진의 결과'],[['전체 유사도','0.6813'],['초기 대응 / 인라이어','9개 / 4개'],['도구의 강한 일치 기준','인라이어 15개 이상']],{x:660,y:365,widths:[302,254],height:251,size:22,headerHeight:44});
 foot(s,'다음 입력  강한 자동 일치가 없어, 지도 배치와 고정 구조물을 추가로 대조합니다');
}
{
 const s=process(3,'지도 자료로 물체의 실제 위치 확보','닮은 건물을 찾은 결과를 실제 위도·경도와 연결하기 위한 단계입니다','메타폴리스와 망 시설이라는 가설\nGoogle 위성영상·OSM 건물 자료','건물 대표 좌표·기록된 높이\nmetapolis.geojson과 지도 기준 JSON','AI가 지도에서 시설을 대조. 조회 코드가 건물 자료와 지도 타일을 받고 대표 좌표를 계산. ',[path.join(T,'metapolis.geojson'),path.join(T,'metapolis_map.jpg'),path.join(T,'sema_area.jpg'),path.join(T,'doksan_detail.json')],'OSM 외곽선 꼭짓점 평균을 타워의 대표 위치로 사용했습니다. 건축 측량점이나 정확한 지붕 끝 좌표는 아닙니다. 초록색 망 시설은 지도와 사진을 대조한 AI의 해석을 포함합니다. 지도 기준 JSON에는 확대 단계·타일 원점·이미지 크기가 있어 픽셀을 좌표로 변환할 수 있습니다. z18 지도 축척약0.476m/px은 위치 추정 정확도를 의미하지 않습니다.');
 label(s,'메타폴리스 일대 위성영상',64,337,556);await image(s,path.join(T,'metapolis_map.jpg'),64,378,556,238,'메타폴리스 건물들의 실제 지도 배치');
 label(s,'초록색 망 시설과 주변 아파트 배치',660,337,556);await image(s,assets.net,660,378,556,238,'초록색 망 시설로 해석한 위성영상 영역');
 foot(s,'다음 입력  지도상의 좌표와 사진에서 AI가 읽은 픽셀 위치를 짝지어 계산합니다');
}
{
 const s=process(3,'물체의 좌우 간격으로 촬영 구역 비교','후보 위치마다 타워와 망 시설이 사진과 같은 간격으로 보이는지 계산합니다','지도상의 시설 좌표\nAI가 판독한 타워·망의 x좌표','수평 배치가 맞는 여러 후보 위치\nhorizontal_scan.json','AI가 픽셀 위치와 탐색 범위를 지정. 작성한 geometry_scan.py가 격자점별 배치를 계산. ',[path.join(T,'geometry_scan.py'),path.join(T,'horizontal_scan.json'),path.join(T,'fixed_tower_results.json')],'가로 배치만 비교했습니다. 위도37.179–37.192, 경도127.016–127.029를0.00025도 간격으로 검색했습니다. 좋은 해가 여러 점에 걸쳐 이어져 점 하나가 유일하게 결정되지는 않았습니다. 양산봉보다 북동쪽독산성 구간이 유력해졌습니다. 타워만 사용한 자유 위치 추정은 불안정해 채택하지 않았습니다.');
 label(s,'실제 거리사진을 확인할 독산성 주변',64,337,670);await image(s,assets.map,64,378,670,238,'계산 뒤 확인 범위를 좁힌 독산성 북동쪽 지도');
 table(s,['사진에서 AI가 판독','가로 위치 x'],[['타워 A / B','716.5 / 734.5'],['타워 C / D','762.0 / 781.0'],['초록색 망 중심','약 866']],{x:788,y:365,widths:[272,156],height:211,size:20,headerHeight:40});
 text(s,'단일 점을 풀지 못했으므로\n후보 구간의 거리사진으로 확인',788,584,428,41,20,false,C.gray);
 foot(s,'다음 입력  독산성 북동쪽 후보 구간을 거리사진 조회의 좌표 범위로 사용합니다');
}
{
 const s=process(4,'후보 좌표로 거리사진 화면 확보','사진과 비슷한 방향의 실제 장면을 확보해, 닮은 풍경을 지리 위치에 연결합니다','후보 좌표·반경·파노라마 ID\n방향 61° / 상향 8° / 화각 67°','비교 화면 20개 항목·고유 ID 19개\nroad.index.json과 거리사진 JPEG','AI가 위치와 볼 방향을 지정. gsv.py와 Google 서비스가 좌표가 있는 비교 화면을 제공. ',[path.join(T,'road.index.json'),path.join(T,'road_north.json'),path.join(T,'street_reverse.jpg')],'20개항목은 고유ID19개이고 중복이 포함됩니다. Google에 전달한 입력은 좌표·ID·방향·화각입니다. 사용자 사진에서 읽은 GPS가 아닙니다. 거리사진 요청 설정은 비교 장면을 만들기 위한 값이며 원본 카메라의 실측값이 아닙니다. 각 이웃 사진 날짜는 검증하지 않아 촬영 날짜를 확정하지 않았습니다.');
 doc(s,'프로그램에 넘긴 조건의 의미','좌표   거리사진 촬영 지점\n61°    바라볼 방향\n8°      올려다볼 각도\n67°    한 화면에 담을 좌우 폭',64,360,556,256,25);
 label(s,'후보 지점에서 반대쪽도 확인',660,337,556);await image(s,path.join(T,'street_reverse.jpg'),660,378,556,238,'후보 지점의 반대 방향 지형을 확인한 거리사진');
 foot(s,'다음 입력  좌표·방향이 연결된 거리사진 목록을 원본과의 비교 프로그램에 전달합니다');
}
{
 const s=process(5,'거리사진의 비교 순위와 대응점 확인','지리 위치가 있는 후보들 중 AI가 먼저 열어 볼 화면을 정합니다','원본의 도시 부분\nroad.index.json의 거리사진 목록','1위 유사도 0.5864·인라이어 0개\nroad_matches.json과 비교 이미지','AI가 비교를 지시. DINOv2·SIFT가 수치를 계산하고, AI가 상위 화면들을 열어 확인. ',[path.join(T,'road_matches.json'),path.join(T,'road_matches.jpg')],'거리사진의 최상위 초기 대응은4개입니다. 코드는 초기 대응이8개보다 적으면 RANSAC 검사를 실행하지 않고 인라이어0을 반환합니다. 따라서 인라이어0은 강한 자동 대응을 확보하지 못했다는 뜻입니다. 유사도0.5864는 정답 확률58.64%가 아닙니다.');
 label(s,'실제 거리사진 비교 순위 상위 6개',64,337,790);await image(s,assets.roads,64,378,790,238,'실제 거리사진 유사도 순위 상위 화면');
 text(s,'0.5864',900,368,316,62,44,true,C.orange);text(s,'1위 전체 유사도',900,437,316,32,22,false,C.gray);
 text(s,'초기 대응 4개',900,493,316,36,26,true);text(s,'기하 검사를 진행할 점이 부족\n인라이어 기록은 0개',900,543,316,73,23,false,C.gray);
 foot(s,'다음 입력  자동 확정 대신, AI가 상위 거리사진의 고정 구조물을 직접 대조합니다');
}
{
 const s=process(5,'AI가 같은 장소인지 구조물을 대조','여러 고정 요소의 형태와 좌우 순서가 함께 맞는지 확인하기 위한 단계입니다','원본·상위 거리사진·위성영상','타워·망·아파트·지붕의 대응\n독산성 북동쪽 진입로라는 판단','AI가 네 종류의 구조물과 지형을 직접 비교. 프로그램은 상위 사진과 확대 화면을 제공. ',[path.join(T,'photo_annotated.jpg'),path.join(T,'street_annotated.jpg'),'https://www.google.com/maps/@?api=1&map_action=pano&pano=JLn8Mh9EZ02Qha_FQYGYdg&heading=61&pitch=8&fov=67'],'표시된 사각형은 AI가 물체의 위치를 지정해 보조 코드로 그린 설명용 표시입니다. SIFT 대응점을 자동 표시한 그림이 아닙니다. 작은 지붕은 위치·형태의 대응이며 창문까지 정밀 검증한 것은 아닙니다. 수목과 계절 차이 때문에 정확한 발 디딘 자리는 미확정입니다.');
 label(s,'사용자 사진에 AI가 지정한 구조물',64,337,556);await image(s,path.join(T,'photo_annotated.jpg'),64,378,556,238,'AI가 선택한 구조물의 위치를 코드가 번호와 사각형으로 표시');
 label(s,'공개 거리사진의 대응 구조물',660,337,556);await image(s,path.join(T,'street_annotated.jpg'),660,378,556,238,'거리사진의 같은 종류 구조물에 번호를 붙인 비교 자료');
 foot(s,'다음 입력  유력 도로 구간과 대표 후보 좌표를 고도·투영 일관성 검사의 입력으로 사용합니다');
}
{
 const s=process(6,'후보 위치의 카메라 조건으로 재투영','선택한 위치에서 건물 지붕이 사진의 같은 픽셀에 나타날 수 있는지 점검합니다','고정 후보 좌표·타워 좌표·높이\n지표 124m + 눈높이 가정 1.6m','방향 약 60.5°·화각 약 66.7°\n지붕 재투영 RMS 약 0.81px','AI가 기준점과 가정을 지정. terrain.py가 고도를 조회하고 pose.py·보조 코드가 투영을 계산. ',[path.join(T,'final_pose.json'),path.join(T,'final_points.json'),path.join(T,'pose_selfcheck.jpg')],'카메라 위치는37.1843,127.0223에 고정했습니다. 카메라 높이125.6m는 지표자료124m와 가정한 눈높이1.6m의 합입니다. 타워 꼭대기 높이는 지표약65m와OSM기록 높이의 합입니다. 방향·상하·좌우 기울기·초점거리를 조정했으므로0.81px은 선택한 위치에서의 일관성입니다. 독립적으로 위치를 풀거나 위치 오차를 측정한 값이 아닙니다. 수평선 안내 수식의 부호 불일치는 실제 project 출력과 구분해 기록했습니다.');
 label(s,'계산한 지붕 위치를 원본에 표시',64,337,556);await image(s,assets.pose,64,380,556,230,'고정한 후보 위치에서 계산한 네 타워 지붕 위치');
 table(s,['항목','값의 출처'],[['지표 약 124m','공개 고도 자료'],['눈높이 1.6m','AI가 둔 가정'],['위치 고정 후 0.81px','화면 위치의 계산 오차']],{x:660,y:365,widths:[278,278],height:251,size:22,headerHeight:44});
 foot(s,'다음 입력  후보와 모순되지 않는 결과와 계산 한계를 함께 최종 판단에 전달합니다');
}
{
 const s=process(7,'후보 장부에 근거를 연결하고 점검','어떤 후보를 왜 지지했는지 남기고, 근거 파일과 미확인 사항의 누락을 확인합니다','AI가 정리한 후보·단서·가중치\n관찰 이미지와 계산 결과 파일','후보의 상대 순위와 기록 점검\nboard.json / result.json','AI가 후보·근거의 의미와 가중치를 입력. board.py가 규칙에 따라 정렬하고 기록을 검사. ',[path.join(T,'board.json'),path.join(T,'result.json')],'후보 장부는 장소를 독립적으로 발견하지 않습니다. 현재 등록한 후보 안의 상대 비중이며 실제 정답 확률이 아닙니다. check 통과는 파일·계층·근거 연결 등 기록 구조 검사입니다. K1이 후속 계산과 연결되어 있지만 used=false여서 미사용 단서 경고가 남아 있습니다. 양산봉과 다른 후보는 가능성을 낮췄으나 공식적인 완전 제외는 하지 않았습니다.');
 doc(s,'실제 장부에 기록한 종류','candidates   독산성·양산봉·도로 구간\nclues          K1–K5 단서와 상태\nevidence     지지·반박·근거 파일\ncheck         누락·미사용 단서 점검',64,360,556,256,23);
 label(s,'장부가 연결하는 거리사진 비교 근거',660,337,556);await image(s,assets.roads,660,378,556,238,'후보의 근거 파일로 연결한 실제 거리사진 비교 자료');
 foot(s,'다음 입력  기록된 근거와 남은 불확실성을 보고할 위치·범위 판단에 사용합니다');
}
{
 const s=process(7,'AI가 대표 좌표와 보고 범위를 결정','장소 수준의 확신과 정확한 촬영점의 확신을 구분해 전달하기 위한 단계입니다','공개 사진·거리사진·지도·계산 결과\n정밀 위치를 확정하지 못한 제약','독산성·보적사 북동쪽 진입로 주변\n37.1843, 127.0223 / 약 반경 150m','AI가 대표 지점과 불확실성 범위를 판단. result.json은 그 결론을 구조화해 저장. ',[path.join(T,'result.json'),path.join(T,'report.md')],'약150m는 통계 프로그램이 산출한 신뢰구간이 아니라 남은 불확실성을 고려해 AI가 정한 대략적인 보고 범위입니다. 대표 좌표는 최상위 거리사진 주변의 대표점이며 서로 다른 후보의 평균점이 아닙니다. 지역 신뢰도 높음, 도로 중간, 정확한 점 낮음으로 구분했습니다.');
 label(s,'가장 잘 맞는 도로 구간의 대표점',64,337,556);await image(s,assets.evidenceMap,64,378,556,238,'최종 결과 지도에 표시한 대표점과 대략적 촬영 방향');
 table(s,['보고 항목','의미'],[['좌표·방향 약 61°','유력 구간의 대표값'],['약 반경 150m','AI가 정한 탐색 범위'],['정확한 촬영 자리','추가 검증 필요']],{x:660,y:365,widths:[278,278],height:251,size:22,headerHeight:44});
 foot(s,'다음 입력  AI가 정한 좌표·방향·범위와 비교할 사진 영역을 그림 제작 코드에 전달합니다');
}
{
 const s=process(7,'설정값으로 증거 그림과 보고서 제작','결론을 얻은 이유와 표시의 의미를 다른 사람이 다시 검토할 수 있게 만듭니다','실제 지도·원본·공개 거리사진\nAI가 정한 좌표·주석·표시 설정','evidence.jpg / evidence_spec.json\nresult.json / report.md','AI가 표시할 위치·영역·문구를 지정. 보조 코드와 evidence.py가 자르기·주석·배치를 실행. ',[path.join(T,'evidence_spec.json'),path.join(T,'finalize_geometry.py'),path.join(T,'finish_outputs.py'),path.join(T,'evidence.jpg'),path.join(T,'report.md')],'그림의 번호와 사각형 위치는 AI가 지정했습니다. SIFT가 검출한 점을 자동 시각화한 것이 아닙니다. 부채꼴은 방향61도, 폭67도, 표시 길이200m입니다. 방향·폭은 추정값의 표시이며 길이는 도면 설정값입니다. 반경150m 오차 원이 아닙니다. 새로운 현장 풍경을 생성한 이미지가 아니라 실제 지도·사진의 편집과 합성입니다.');
 label(s,'실제 사진에 붙인 설명용 번호·사각형',64,337,556);await image(s,path.join(T,'photo_annotated.jpg'),64,378,556,238,'보조 코드로 주석을 붙인 실제 사용자 사진');
 table(s,['그림 요소','설정한 주체와 의미'],[['번호·사각형','AI가 위치 지정 / 코드가 표시'],['지도 부채꼴','61°·67°·길이 200m 설정'],['부채꼴의 의미','방향 설명 / 150m 오차 원 아님']],{x:660,y:365,widths:[220,336],height:251,size:21,headerHeight:44});
 foot(s,'완료 산출물  검토용 이미지·설명 보고서·다음 프로그램이 읽을 수 있는 JSON을 함께 저장합니다');
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
