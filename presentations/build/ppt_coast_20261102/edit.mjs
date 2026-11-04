import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import {FileBlob,PresentationFile} from '@oai/artifact-tool';

const ROOT='C:/Users/admin/img2place_project';
const B=path.join(ROOT,'ppt_coast_20261102');
const T=path.join(ROOT,'geo_work_20261102_coast');
const SRC=path.join(ROOT,'output/geo-slueth_소개_절차설명_보완본.pptx');
const backup=path.join(B,'source.pptx');
try { await fs.access(backup); } catch { await fs.copyFile(SRC,backup); }
const p=await PresentationFile.importPptx(await FileBlob.load(backup));
const inv=JSON.parse(await fs.readFile(path.join(B,'inventory.json'),'utf8'));
const assets=path.join(B,'assets'); await fs.mkdir(assets,{recursive:true});
async function crop(file,name,left,top,width,height) {
 const dest=path.join(assets,name+'.jpg');
 await sharp(path.join(T,file)).extract({left,top,width,height}).jpeg({quality:95}).toFile(dest);
 return dest;
}
const A={
 obs:await crop('query.jpg','observatory_night',0,205,820,165),
 tetra:await crop('query.jpg','tetrapods_night',0,270,460,85),
 projection:await crop('projection.jpg','projection_diagnostic',260,205,540,240),
 map:await crop('evidence.jpg','result_map',0,0,1280,1065),
 coast:await crop('map.jpg','coast_satellite',0,0,1200,1000),
 panels:await crop('evidence.jpg','evidence_panels',0,1065,1280,427),
};
function boxes(n){return inv[n-1].elements.filter(e=>e.kind==='textbox');}
function text(n,k,v){
 const q=p.resolve(boxes(n)[k].id);
 // Rich-text content edits retain the imported shape's typography and placement.
 q.text=v;
 q.name=String(v).replace(/\n/g,' ').slice(0,60);
}
function texts(n,changes){for(const [k,v]of Object.entries(changes))text(n,+k,v);}
async function pic(n,k,file,alt,frame){
 const def=inv[n-1].elements.filter(e=>e.kind==='image')[k];
 const q=p.resolve(def.id);
 const oldFrame=q.frame;
 q.replace({blob:new Uint8Array(await fs.readFile(file)),contentType:'image/jpeg',alt,fit:'contain'});
 const box=frame??oldFrame;
 const meta=await sharp(file).metadata();
 const scale=Math.min(box.width/meta.width,box.height/meta.height);
 const width=meta.width*scale,height=meta.height*scale;
 q.frame={left:box.left+(box.width-width)/2,top:box.top+(box.height-height)/2,width,height};
 q.crop={left:0,top:0,right:0,bottom:0};q.fit='contain';
}
function table(n,values){
 const t=p.resolve(inv[n-1].elements.find(e=>e.kind==='table').id);
 for(let r=0;r<values.length;r++)for(let c=0;c<values[r].length;c++)t.cells.set(r,c,values[r][c]);
}
const left={left:64,top:378,width:556,height:238};
const right={left:660,top:378,width:556,height:238};
const leftWide={left:64,top:378,width:680,height:238};
const f=(s)=>path.join(T,s);

texts(1,{3:'조사 2026.11.02    정리 2026.11.02'});
texts(2,{12:'사진 한 장으로 시작한 사근진 해안 위치 조사'});
texts(6,{9:'장소·대표 좌표·보고 범위\n비교 이미지·판단 근거'});
texts(7,{2:'위치 조사를 수행한 AI 에이전트가 필요한 도구들을 호출했습니다'});
texts(8,{
 2:'2026.11.02  야간 해안 사진 한 장의 촬영 구역과 방향 찾기',
 5:'1440 × 810px JPG\nGPS 정보 없음\n유효한 지명 없음',
 8:'역 이미지 검색을 끄고, 공개 사진과 지도로 장소와 촬영 구역을 대조했습니다',
});
texts(9,{9:'전망대 가설·공개 사진 5장',14:'지도 대조',15:'전망대·방파제·곡선 해안',17:'거리사진 조회',18:'반경 100m 조회·자료 미확보',21:'전망대 구조·테트라포드',24:'가정 조건·정밀 검증의 한계'});
for(let n=10;n<=23;n++)texts(n,{3:'04 지도 대조',4:'05 거리 조회'});
texts(10,{
 13:'GPS 없음·유효한 지명 없음\nintake.md / exif.json / ocr.json',
 14:'조사 AI가 검사를 지시. intake.py와 OCR이 파일·문자를 읽고, AI가 검사 결과를 해석.',
 18:'size: [1440, 810]\nEXIF: GPS 없음\nOCR: mihl, 신뢰도 0.58\n\n지명으로 쓸 수 없는 잡음으로 판단',
 19:'다음 입력  GPS·지명으로 좁히기 어려워, 흰 구조물과 해안 시설의 형태를 관찰합니다',
});
texts(11,{
 13:'흰 지지대·가로 판재·색 테트라포드\n사근진해중공원 전망대라는 가설',
 14:'조사 AI가 사진을 확대해 관찰하고 시설 가설을 제안. 프로그램은 확대·분할 자료를 제공.',
 16:'흰 구조물과 주변 해안의 실제 확대 사진',
 17:'후속 대조에 사용한 파스텔색 테트라포드',
 19:'비스듬한 지지대와 가로 판재\n상부 난간·계단·색 테트라포드',
 21:'사근진해중공원 전망대인가?\n곡선 해안의 어느 쪽에서 봤는가?',
 22:'다음 입력  전망대의 형태와 테트라포드 색을 공개 자료 검색의 단서로 사용합니다',
});
texts(12,{
 9:'특징적인 전망대를 실제 시설과 연결하고, 구조를 대조할 공개 사진을 모읍니다',
 11:'AI가 만든 시설·형태 관련 검색어\n공개 웹페이지와 이미지 주소',
 13:'사근진해중공원 전망대 가설\n공개 참고사진 5장과 refs.json',
 14:'조사 AI가 검색어와 자료를 선택. 검색 도구가 결과를 반환하고 get_refs.py가 사진 5장을 저장.',
 16:'검색으로 찾은 사근진해중공원 전망대 사진',
 18:'텍스트 검색  시설·형태 관련 검색어\n사진 수집     공개 이미지 URL 5개\n\n사용자 사진의 외부 역검색은 미사용',
 19:'다음 입력  저장한 공개 사진 5장을 원본과 비교할 후보 이미지로 넘깁니다',
});
texts(13,{
 11:'사용자 사진과 공개 참고사진 5장',
 13:'유사도·순위·파일의 대응 목록\nmatch.json / match.jpg',
 14:'조사 AI가 비교 실행을 지시. match.py의 DINOv2가 이미지 특징을 만들고 유사도를 계산.',
 16:'실제 프로그램이 정렬한 공개 사진 5장',
 18:'사진을 숫자 특징으로 변환\n원본과 참고사진의 특징을 비교\n유사도가 높은 사진부터 확인',
});
texts(14,{
 13:'초기 대응 후보와 기하 검사 통과 수\nmatch.json의 matches / inliers',
 16:'전체 유사도 1위의 실제 공개 참고사진',
 17:'다음 입력  모든 사진의 인라이어가 6개 이하이므로, 지도와 구조물 형태를 추가로 대조합니다',
});
table(14,[['검사 항목','이번 사진의 결과'],['1위 전체 유사도','0.5465'],['1위 초기 대응 / 인라이어','11개 / 0개'],['강한 자동 일치 기준','인라이어 15개 이상']]);
texts(15,{
 9:'전망대 가설을 지도에서 확인하고, 주변 해안과 방파제의 배치를 연결합니다',
 11:'사근진해중공원 전망대 가설\nGoogle 위성영상과 시설 배치',
 13:'전망대의 지도상 위치·해안 배치\nmap.jpg / map.json',
 14:'조사 AI가 지도에서 시설을 대조. 지도 도구가 확대 위성영상과 지리 기준 정보를 제공.',
 16:'전망대와 해안의 확대 위성영상',
 17:'전망대·방파제·곡선 해안의 상대 배치',
 18:'다음 입력  지도에서 확인한 전망대 위치를 기준으로, 사진이 보일 수 있는 해안 쪽을 비교합니다',
});
texts(16,{
 8:'전망대와 곡선 해안의 상대 배치 비교',
 9:'전망대가 사진의 왼쪽에 보이는 배치와 곡선 해안의 방향이 맞는지 확인합니다',
 11:'확대 위성영상과 사용자 사진\n전망대·방파제·해안선의 상대 위치',
 13:'전망대 북서쪽 해안이라는 가설\n정확한 돌 경사면 위치는 미확정',
 14:'조사 AI가 위성영상과 사진을 직접 대조. 지도 도구는 지리 좌표가 있는 영상을 제공.',
 16:'후보가 되는 전망대 주변의 해안 배치',
 17:'북서쪽 해안이 유력하지만\n정확한 촬영 지점은 추가 확인 필요',
 18:'다음 입력  전망대 북서쪽의 후보 지점과 반경을 거리사진 조회 조건으로 사용합니다',
});
table(16,[['확인 대상','지도 대조 결과'],['전망대 위치','시설 배치 대응'],['북서쪽 곡선 해안','촬영 구역 가설'],['사진 속 돌 경사면','지점 미확정']]);
texts(17,{
 8:'후보 지점의 거리사진 조회와 대체 자료',
 9:'좌표와 연결된 거리사진으로 촬영 지점을 좁힐 수 있는지 확인했습니다',
 11:'전망대 북서쪽 후보 좌표\nGoogle 거리사진 조회 반경 100m',
 13:'반경 안에서 파노라마 미확보\npano.json에 조회 결과 기록',
 14:'조사 AI가 조회 좌표와 반경을 지정. gsv.py가 서비스에 조회했으나 비교 화면을 얻지 못함.',
 16:'실제 조회 결과와 다음 판단',
 17:'조회 반경   후보 좌표 주변 100m\n결과           파노라마를 찾지 못함\n\n거리사진 비교 자료가 없어\n이미 확보한 공개 사진으로 형태 대조',
 18:'대체 대조에 사용한 실제 공개 참고사진',
 19:'다음 입력  거리사진을 확보하지 못한 제약을 남기고, 공개 사진 5장과 위성영상을 사용합니다',
});
texts(18,{
 8:'공개 사진의 비교 순위와 한계 해석',
 9:'낮과 밤의 차이가 있는 자료에서, 자동 점수와 실제 구조를 함께 확인합니다',
 11:'사용자 야간 사진과 공개 사진 5장\nmatch.json의 순위·특징점 결과',
 13:'1위 유사도 0.5465·인라이어 0개\n5장 전체의 구조를 AI가 확인',
 14:'DINOv2·SIFT가 수치를 계산. 조사 AI는 공개 사진 5장을 열어 형태와 촬영 방향 차이를 확인.',
 16:'거리사진 대신 대조한 공개 사진 5장',
 17:'0.5465',
 19:'1위 초기 대응 11개',
 20:'1위의 기하 일치점은 0개\n5장 중 최대 인라이어도 6개',
 21:'다음 입력  자동 점수는 확인 순서에 사용하고, 전망대의 고정 구조를 직접 대조합니다',
});
texts(19,{
 11:'사용자 사진·공개 참고사진 5장\n확대 위성영상',
 13:'지지대·판재·난간·계단 형태 대응\n파스텔색 테트라포드도 함께 대응',
 14:'조사 AI가 고정 구조물의 형태와 주변 시설을 비교. 프로그램은 참고사진과 확대 화면을 제공.',
 16:'사용자 야간 사진의 전망대·테트라포드',
 17:'공개 주간 사진의 같은 시설 형태',
 18:'다음 입력  전망대 주변 해안을 유력 구역으로 두고, 투영 계산으로 정밀 검증할 수 있는지 점검합니다',
});
texts(20,{
 8:'가정한 카메라 조건의 투영 한계 점검',
 9:'가정값을 넣어 표시했지만, 실제 픽셀 대응이 없어 정확도를 검증하지 못했습니다',
 11:'대표 좌표·전망대 기준 좌표\n높이 5m·방향 115°·화각 85° 가정',
 13:'진단용 기준점 표시와 한계 기록\nprojection.jpg / pose_limits.txt',
 14:'조사 AI가 카메라 조건을 가정. pose.py가 전망대 기준점을 투영했으며 정밀 위치를 풀지는 못함.',
 16:'가정 조건으로 투영한 기준점의 실제 표시',
 17:'다음 입력  실측 대응점과 수평선이 없어 정밀 검증이 성립하지 않았다는 제약을 결론에 반영합니다',
});
table(20,[['항목','값과 해석'],['카메라 높이 5m','해발 높이의 가정'],['상하각 −8° / 화각 85°','측정 없이 넣은 가정'],['사진 속 대응 픽셀','미지정·정밀 검증 불가']]);
texts(21,{
 11:'전망대 주변 해안·해안 구간 가설\n공개 사진·지도·제약 기록',
 13:'지역 수준의 근거·미확정 구간 기록\nboard.json / board_area.json',
 14:'조사 AI가 후보·근거·가중치를 입력. board.py가 상대 순위를 계산하며, 세부 해안 구간은 미확정.',
 17:'candidates   강릉·전망대 해안·세부 구간\nclues          K1–K3 관찰과 추론\nevidence     공개 사진·지도 근거\narea 장부   미확정 세부 구간은 보고 제외',
 18:'장부에 연결한 전망대 구조 비교 근거',
 19:'다음 입력  장소 수준의 근거와 미확정 촬영 지점을 구분해, 보고할 위치와 범위를 결정합니다',
});
texts(22,{
 11:'공개 사진·지도와 구조물 대응\n거리사진·정밀 투영 검증의 제약',
 13:'강릉 사근진해중공원 전망대 옆 해안\n37.81425, 128.89760 / 반경 약 150m',
 14:'조사 AI가 해안 구역을 표시할 대표점과 범위를 판단. result.json이 결론과 남은 제약을 저장.',
 16:'전망대 북서쪽 해안의 대표 좌표 표시',
 17:'다음 입력  대표점·추정 방향·보고 범위를 표시 설정에 전달하며, 정확한 촬영점 미확정을 명시합니다',
});
table(22,[['보고 항목','의미'],['동쪽~동남동쪽 조망','북서쪽 해안에서 추정'],['대표점 주변 약 150m','촬영 구역을 표시한 범위'],['해안 높음 / 촬영점 낮음','위치 확신도를 구분']]);
texts(23,{
 11:'실제 위성영상·원본·공개 사진\nAI가 정한 대표점·방향 표시 설정',
 13:'evidence.jpg / evidence_spec.json\nresult.json / conclusion.md',
 14:'조사 AI가 대표점·방향·비교 영역을 지정. evidence.py가 지도와 사진을 배치하고 결론을 문서화.',
 16:'실제 증거 이미지의 사용자·공개 사진 비교',
 17:'완료 산출물  비교 이미지·결론 문서·구조화된 JSON에 판단 근거와 미확정 사항을 함께 저장합니다',
});
table(23,[['그림 표시','지정한 주체와 의미'],['지도 대표점','AI가 해안 구역 표시용 지정'],['방향 부채꼴','115°·85°·길이 150m 가정'],['부채꼴의 의미','조망 예시·오차 원 아님']]);
table(24,[
 ['단계','주요 파일','담긴 내용'],
 ['초기 검사','intake.md, exif.json, ocr.json','GPS 없음·유효한 지명 없음'],
 ['단서·사진 순위','refs.json, match.json, match.jpg','공개 사진 5장·비교 수치와 순위'],
 ['지도 대조','map.jpg, map.json','위성영상·지도 기준과 해안 배치'],
 ['거리사진 조회','pano.json','반경 100m 조회·파노라마 미확보'],
 ['투영 검사','pose_assumed.json, projection.jpg\npose_limits.txt','가정 조건·기준점 표시·검증 한계'],
 ['최종 결과','result.json, evidence.jpg\nconclusion.md, board.json','대표점·범위·근거·미확정 사항'],
]);
texts(25,{
 1:'대표 좌표와 촬영 구역의 보고 범위',
 2:'정답 좌표가 없어 오차를 평가하지 못했으며, 장소와 촬영 지점의 확신을 나눠 보고했습니다',
 4:'150',6:'대표 좌표 주변의 촬영 구역 보고 범위',
 7:'대표점  37.81425, 128.89760\n정확한 촬영 위치를 계산한 좌표는 아님',
 8:'시설 주소  강릉시 해안로604번길 16  /  보고 범위 150m는 정답과의 거리 오차가 아닙니다',
});
table(25,[['평가 구분','확신도','확인 상태'],['전망대 주변 해안','높음','공개 사진·지도 대응'],['정확한 촬영 지점','낮음','돌 경사면 미확정']]);
texts(26,{
 5:'사근진 전망대 주변 해안',
 6:'비스듬한 지지대·가로 판재·난간과 계단\n색 테트라포드가 공개 사진과 함께 대응',
 7:'북서쪽 해안에서의 조망 추정',
 8:'동쪽~동남동쪽 방향이 유력\n돌 경사면의 정확한 위치는 미확정',
 10:'약한 자동 특징점 대응',
 11:'1위 인라이어 0개·전체 최대 6개\n낮과 밤의 차이를 고려해 형태를 대조',
 12:'거리사진·투영 검증 자료 부족',
 13:'반경 100m 거리사진 미확보\n수평선·실측 픽셀 대응 없이 가정값 사용',
 14:'전망대 주변 해안은 높게 판단했으나, 촬영 지점의 정밀도와 일반 성능은 평가하지 못했습니다',
});
table(28,[
 ['확인한 문제','개선할 처리','다음 평가에서 확인할 결과'],
 ['정확한 촬영 지점 미확정','돌 경사면의 현장·추가 사진 확인\n별도 확보한 정답 좌표와 대조','구역 판단과 촬영점 오차를 분리'],
 ['낮·밤의 자동 대응 부족','시점·조명이 가까운 참고사진 확보\n직접 대조한 구조와 근거 기록','자동 대응과 육안 근거의 재현성'],
 ['거리사진 자료 미확보','대체 공개 사진·현장 자료 활용\n조회 조건과 확보 실패를 저장','대체 경로로 근거를 보완하는지'],
 ['가정값만 사용한 투영','실측 픽셀 대응·수평선 확보\n조건이 부족하면 정밀 판단 유보','새 사진에서 검증 가능한 정밀도'],
]);
const tasks=[
 ['1  위치 조사 요청','사용자 사진·요청','조사 범위','조사 AI','사용자','야간 해안 사진'],
 ['2  초기 검사 설정','스킬·실행 옵션','역검색 끔','조사 AI','AI','--no-rev'],
 ['3  메타데이터 검사','JPG 파일','GPS 없음','intake.py','AI','날짜도 미확정'],
 ['4  문자 검사','사진 픽셀','mihl 잡음','OCR + AI','AI','유효 지명 없음'],
 ['5  분할 자료 생성','원본 사진','타일 8개 등','intake.py','AI','확대 관찰용'],
 ['6  시설 형태 관찰','원본·확대 사진','흰 구조물·색 블록','조사 AI','AI','관찰과 가설 구분'],
 ['7  장소 가설 설정','구조물·테트라포드','사근진 전망대 가설','조사 AI','AI','단계적 가설'],
 ['8  키워드 검색','시설·형태 검색어','공개 사진 URL','검색 도구 + AI','AI','역검색 미사용'],
 ['9  참고사진 수집','공개 URL 5개','refs.json·사진 5장','get_refs.py','AI','웹 공개 사진'],
 ['10  전체 유사도 비교','원본·참고사진 5장','1위 0.5465','DINOv2','AI','정답 확률 아님'],
 ['11  특징점 검사','같은 비교 사진','최대 인라이어 6개','SIFT·RANSAC','AI','강한 일치 없음'],
 ['12  공개 사진 확인','순위·사진 5장','시설 형태 대응','조사 AI','AI','낮·밤 차이 고려'],
 ['13  위성영상 확보','사근진 좌표·줌','map.jpg·기준 정보','지도 도구','AI','확대 영상 사용'],
 ['14  전망대 지도 대조','위성영상·공개 사진','지도상 시설 위치','조사 AI','AI','촬영점과 구분'],
 ['15  촬영 해안 추정','시설·곡선 해안 배치','북서쪽 해안 유력','조사 AI','AI','돌 경사면 미확정'],
 ['16  거리사진 조회','후보 좌표·반경 100m','파노라마 미확보','gsv.py','AI','pano.json 기록'],
 ['17  대체 자료 선택','공개 참고사진 5장','직접 대조 자료','조사 AI','AI','거리사진 아님'],
 ['18  고정 구조 대조','지지대·판재·난간 등','전망대 형태 대응','조사 AI','AI','색 블록도 대응'],
 ['19  해안 배치 검토','지도·원본 사진','방향 추정·지점 유보','조사 AI','AI','동쪽~동남동쪽'],
 ['20  카메라 조건 가정','대표점·투영 조건','5m·−8°·85° 등','조사 AI','AI','측정값 아님'],
 ['21  진단용 투영','가정값·전망대 좌표','표시·정밀 검증 불가','pose.py + AI','AI','대응 픽셀 없음'],
 ['22  후보 장부 정리','K1–K3·자료·제약','지역·세부 가설 분리','board.py + AI','AI','세부 구간 미확정'],
 ['23  보고 구역 결정','사진·지도·남은 제약','대표점·약 150m','조사 AI','AI','오차 측정 아님'],
 ['24  근거·결론 제작','대표점·그림 설정','evidence·결론 문서','프로그램 + AI','AI','정확한 촬영점 유보'],
];
for(let n=29;n<=32;n++){
 texts(n,{2:`실제 작업 ${(n-29)*6+1}–${(n-28)*6}. ‘AI’는 위치 조사를 수행한 에이전트입니다`});
 table(n,[['작업','소스','결과','수행 대상','명령','기타'],...tasks.slice((n-29)*6,(n-28)*6)]);
}

await pic(8,0,f('query.jpg'),'이번 사례의 사용자 제공 야간 해안 사진',{left:64,top:227,width:804,height:370});
await pic(10,0,f('edges.jpg'),'초기 검사가 만든 실제 분할·가장자리 관찰 자료',left);
await pic(11,0,A.obs,'사용자 사진에서 자른 전망대 주변', {left:64,top:378,width:680,height:142});
await pic(11,1,A.tetra,'사용자 사진에서 자른 파스텔색 테트라포드',{left:64,top:559,width:438,height:57});
await pic(12,0,f('refs/0.jpg'),'공개 참고사진 0, 사근진해중공원 전망대',{left:64,top:378,width:680,height:238});
await pic(13,0,f('match.jpg'),'DINOv2·SIFT 실제 비교 결과표',leftWide);
await pic(14,0,f('refs/1.jpg'),'전체 유사도 1위 공개 참고사진',left);
await pic(15,0,f('map_grid.jpg'),'사근진 전망대 주변 실제 위성영상',left);
await pic(15,1,A.coast,'지도에서 확인한 전망대와 방파제·곡선 해안의 배치',right);
await pic(16,0,f('map_grid.jpg'),'촬영 후보 해안의 실제 위성영상',leftWide);
await pic(17,0,f('refs/3.jpg'),'거리사진 미확보 후 활용한 공개 참고사진',right);
await pic(18,0,f('match.jpg'),'공개 사진 5장 비교표, 거리사진 아님',leftWide);
await pic(19,0,f('anchor_crop.jpg'),'사용자 야간 사진의 흰 구조물과 테트라포드',left);
await pic(19,1,f('refs/0.jpg'),'공개 주간 사진의 전망대와 테트라포드',right);
await pic(20,0,A.projection,'가정 조건으로 투영한 전망대 기준점의 진단용 표시',left);
await pic(21,0,f('refs/4.jpg'),'장부에 연결한 공개 전망대 참고사진',right);
await pic(22,0,A.map,'대표점과 가정 방향을 지도 위에 표시',left);
await pic(23,0,A.panels,'실제 근거 이미지에서 자른 사용자·공개 사진 비교 부분',left);

const kto='https://korean.visitkorea.or.kr/detail/ms_detail.do?cotid=18985b56-92b8-41db-ac6d-c71b62449f99';
const refs=JSON.parse(await fs.readFile(f('refs.json'),'utf8'));
const shared=[f('conclusion.md'),f('result.json'),kto];
const per={
 3:['intake/intake.md'],7:['conclusion.md'],8:['query.jpg','intake/intake.md'],9:['conclusion.md'],
 10:['intake/intake.md','intake/exif.json','intake/ocr.json','edges.jpg'],
 11:['query.jpg','anchor_crop.jpg','board.json'],12:['get_refs.py','refs.json','refs/0.jpg'],13:['match.json','match.jpg'],14:['match.json','refs/1.jpg'],
 15:['map.jpg','map.json','map_grid.jpg'],16:['board.json','map.jpg'],17:['pano.json','refs/3.jpg'],18:['match.json','match.jpg'],19:['anchor_crop.jpg','refs/0.jpg'],
 20:['pose_assumed.json','pose_limits.txt','projection_points.json','projection.jpg'],21:['board.json','board_area.json','refs/4.jpg'],22:['result.json','evidence_spec.json','evidence.jpg'],
 23:['evidence_spec.json','evidence.jpg','conclusion.md'],24:['intake/intake.md','refs.json','match.json','map.json','pano.json','pose_limits.txt','result.json'],
 25:['result.json','conclusion.md'],26:['match.json','pano.json','pose_limits.txt','conclusion.md'],27:['conclusion.md'],28:['conclusion.md','match.json','pano.json','pose_limits.txt'],
 29:['intake/intake.md','intake/ocr.json','query.jpg'],30:['refs.json','get_refs.py','match.json'],31:['map.json','pano.json','refs.json','board.json'],32:['pose_assumed.json','pose_limits.txt','board.json','result.json','evidence_spec.json','conclusion.md'],
};
const notes={
 1:'기존 32장 구성과 디자인을 유지하고 테스트 사례를 사근진해중공원 전망대 주변 해안으로 교체했다. 제목의 geo-slueth는 사용자 요청 표기이며 스킬 정식 표기는 geo-sleuth이다.',
 7:'조사 AI는 제공된 위치 조사 기록에서 사진을 해석하고 도구를 호출한 에이전트를 뜻한다. 이 PPT 편집에서는 기존 조사 산출물을 읽어 수치와 설명을 반영했다.',
 8:'입력은 야간 해안 사진 한 장이다. GPS가 없고 OCR의 mihl은 지명으로 사용할 수 없는 잡음이었다. 역 이미지 검색은 --no-rev로 사용하지 않았다. 제공된 정답 촬영 좌표는 없다.',
 10:'OCR 결과를 문자 0개로 표현하지 않는다. 실제 검출은 mihl, confidence 0.58이며 장소를 식별할 유효한 글자가 없다는 의미이다.',
 14:'1위(id 1)는 score_global 0.5465, matches 11, inliers 0이다. 다른 4장의 inliers는 5,0,5,6이다. 초기 대응 11개가 있었다고 해서 기하 검사를 생략한 것은 아니다. 강한 일치 기준 15개를 충족하지 않았다. 유사도는 정답 확률이 아니다.',
 15:'지도 기준은 Google z19 위성영상으로 map.json에 origin_tile·중심·픽셀 크기가 기록되어 있다. 지도에서 확인한 전망대 위치는 약 37.81419,128.89829이며 촬영 구역 대표점 37.81425,128.89760과 구분해야 한다. OSM 건물·높이·GeoJSON을 이용한 사례로 설명하지 않는다.',
 16:'지도와 사진의 상대 배치를 사람이 읽듯 AI가 대조한 단계이다. 수평 격자 탐색이나 실제 픽셀 x좌표에 의한 정밀 삼각측량을 수행했다고 주장하지 않는다. 북서쪽 곡선 해안이 유력하나 돌 경사면의 위치는 미확정이다.',
 17:'pano.json은 JSON 객체가 아니라 no Google Street View panorama within 100 m라는 텍스트 조회 결과이다. 따라서 거리사진 20장 또는 파노라마 ID 목록이 생성된 것으로 표현하면 안 된다. 그림은 대체 공개 참고사진이며 거리사진 화면이 아니다.',
 18:'이 슬라이드는 13–14장의 동일한 공개 사진 비교 결과를 구조물 검토 관점에서 다시 해석한다. 새로운 거리사진 비교 실행이나 별도의 점수를 뜻하지 않는다. 공개 사진 5장을 모두 시각적으로 확인한 기록을 반영했다.',
 19:'지지대, 가로 판재, 상부 난간, 계단, 파스텔색 테트라포드의 형태가 공개 사진과 대응했다. 주간·야간 및 보는 각도 차이가 커 자동 특징점은 약했다. 이는 전망대 주변 해안을 지지하지만 정확한 촬영점 확정 근거는 부족하다.',
 20:'pose_assumed.json의 대표 위치에 높이 5m ASL, yaw 115°, pitch -8°, roll 0°, HFOV 85°를 가정했다. 전망대 기준 위치 37.81419,128.89829와 높이 1m를 투영했다. 실제 사진의 대응 픽셀을 지정하지 않았고 수평선도 측정할 수 없어 재투영 오차나 카메라 위치 정확도를 검증하지 못했다. 빨간 표식은 정답 대응점이 아니다.',
 21:'board.json은 도시·지역·세부 해안 구간 후보와 K1–K3 근거를 보관한다. board_area.json은 세부 구간을 미확정으로 남기고 지역 수준만 보고하기 위한 사본이다. 장부의 규칙상 상대 점수를 실제 확률로 해석하지 않는다. 세부 후보에 대한 완전한 검증 통과를 주장하지 않는다.',
 22:'결론은 강원특별자치도 강릉시 안현동 사근진해중공원 전망대 옆 해안이다. 시설 주소는 강릉시 해안로604번길16이다. 대표 좌표는 37.81425,128.89760, 보고 범위는 주변 반경 약150m이다. 좌표는 촬영 구역 표시용이며 정밀 계산한 촬영점이 아니다. 주변 해안은 확신 높음, 정확한 촬영 지점은 낮음. 동쪽~동남동쪽 조망을 추정했다.',
 23:'evidence_spec.json의 부채꼴은 heading115°, HFOV85°, range150m라는 표시 가정이다. 부채꼴 자체가 150m 오차 원을 표현하지 않는다. evidence.jpg는 실제 위성영상과 원본·공개 사진을 배치한 검토 자료이다. conclusion.md에 미확정 사항을 설명했다.',
 25:'150m는 AI가 해안 구역을 보고하기 위해 정한 보수적인 범위이다. 정답과의 거리, 통계적 오차, 평균 정확도, 보장 정밀도를 의미하지 않는다. 이 사례에는 정답 촬영 좌표가 없어 실제 오차를 산출하지 않았다.',
 27:'활용 항목은 이번 한 건의 기능에 근거한 제안이다. 실제 업무 효과나 범용 정확도 향상을 검증한 결과로 표현하지 않는다.',
};
for(let i=0;i<32;i++){
 const n=i+1;
 const srcs=[...shared,...(per[n]??[]).map(s=>f(s))];
 if(n===5)srcs.push('C:/Users/admin/.codex/skills/geo-sleuth/SKILL.md');
 if(n>=12&&n<=19 || n===21 || n===23 || n===30 || n===31)srcs.push(...refs.map(x=>x.url));
 const detail=notes[n]??'제공된 사근진 전망대 주변 해안 조사 기록을 바탕으로 단계의 입력·결과·수행 주체를 설명한다. 확인되지 않은 정밀 촬영 위치나 정답 오차를 주장하지 않는다.';
 p.slides.items[i].speakerNotes.text=detail+'\n\n출처 및 원본\n'+[...new Set(srcs)].map(s=>'- '+s).join('\n');
}
await (await PresentationFile.exportPptx(p)).save(path.join(B,'candidate.pptx'));
console.log(JSON.stringify({slides:p.slides.items.length,output:path.join(B,'candidate.pptx')}));
