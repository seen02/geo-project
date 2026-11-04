import fs from 'node:fs/promises';
import path from 'node:path';
import {FileBlob,PresentationFile} from '@oai/artifact-tool';

const root='C:/Users/admin/img2place_project';
const build=path.join(root,'ppt_coast_20261102');
const original=path.join(root,'output/geo-slueth_소개_사근진해중공원_사례반영_최종.pptx');
const backup=path.join(build,'source_coords.pptx');
try{await fs.access(backup);}catch{await fs.copyFile(original,backup);}
const p=await PresentationFile.importPptx(await FileBlob.load(backup));
const inspected=await p.inspect({select:'$.slides[*]',include:['id','index','elements.id','elements.kind','elements.text','elements.position']});
const inv=inspected.records;
await fs.writeFile(path.join(build,'inventory_coords.json'),JSON.stringify(inv,null,2));

// WGS84 inverse geodesic, Vincenty's ellipsoidal solution.
// Input order is latitude, longitude in decimal degrees. Output is surface distance.
function inverse(lat1,lon1,lat2,lon2){
 const rad=Math.PI/180,a=6378137,f=1/298.257223563,b=(1-f)*a;
 if(lat1===lat2&&lon1===lon2)return{distance_m:0,bearing_deg:null,iterations:0};
 const U1=Math.atan((1-f)*Math.tan(lat1*rad)),U2=Math.atan((1-f)*Math.tan(lat2*rad));
 const su1=Math.sin(U1),cu1=Math.cos(U1),su2=Math.sin(U2),cu2=Math.cos(U2),L=(lon2-lon1)*rad;
 let lambda=L,sigma,sinSigma,cosSigma,sinAlpha,cosSqAlpha,cos2SigmaM,delta=Infinity,iterations=0;
 while(delta>1e-13&&iterations++<200){
  const sl=Math.sin(lambda),cl=Math.cos(lambda);
  sinSigma=Math.hypot(cu2*sl,cu1*su2-su1*cu2*cl);
  cosSigma=su1*su2+cu1*cu2*cl;sigma=Math.atan2(sinSigma,cosSigma);
  sinAlpha=cu1*cu2*sl/sinSigma;cosSqAlpha=1-sinAlpha*sinAlpha;
  cos2SigmaM=cosSqAlpha?cosSigma-2*su1*su2/cosSqAlpha:0;
  const C=f/16*cosSqAlpha*(4+f*(4-3*cosSqAlpha)),old=lambda;
  lambda=L+(1-C)*f*sinAlpha*(sigma+C*sinSigma*(cos2SigmaM+C*cosSigma*(-1+2*cos2SigmaM*cos2SigmaM)));
  delta=Math.abs(lambda-old);
 }
 if(iterations>=200||!Number.isFinite(sigma))throw Error('Geodesic did not converge');
 const uSq=cosSqAlpha*(a*a-b*b)/(b*b);
 const A=1+uSq/16384*(4096+uSq*(-768+uSq*(320-175*uSq)));
 const B=uSq/1024*(256+uSq*(-128+uSq*(74-47*uSq)));
 const ds=B*sinSigma*(cos2SigmaM+B/4*(cosSigma*(-1+2*cos2SigmaM*cos2SigmaM)-B/6*cos2SigmaM*(-3+4*sinSigma*sinSigma)*(-3+4*cos2SigmaM*cos2SigmaM)));
 return{distance_m:b*A*(sigma-ds),bearing_deg:(Math.atan2(cu2*Math.sin(lambda),cu1*su2-su1*cu2*Math.cos(lambda))/rad+360)%360,iterations};
}
const estimated={latitude:37.81425,longitude:128.89760};
const actual={latitude:37.81438,longitude:128.89691};
const geodesic=inverse(estimated.latitude,estimated.longitude,actual.latitude,actual.longitude);
const distance=geodesic.distance_m.toFixed(1);
// Independent spherical check prevents degree/radian or coordinate-order mistakes.
const rad=Math.PI/180;
const h=Math.sin((actual.latitude-estimated.latitude)*rad/2)**2+Math.cos(estimated.latitude*rad)*Math.cos(actual.latitude*rad)*Math.sin((actual.longitude-estimated.longitude)*rad/2)**2;
const spherical=2*6371008.8*Math.atan2(Math.sqrt(h),Math.sqrt(1-h));
if(Math.abs(spherical-geodesic.distance_m)>0.5)throw Error('Distance cross-check failed');
const comparison={
 actual,actual_source:'사용자가 조사 후 제공하고 북위 37.81438°로 확인한 좌표',
 estimated,estimated_source:'앞선 위치 조사에서 보고한 촬영 구역 대표점',
 coordinate_system_assumption:'양쪽 좌표를 WGS84 십진 도 단위로 해석',
 method:'WGS84 ellipsoid inverse geodesic (Vincenty)',
 ...geodesic,display_distance_m:distance,independent_spherical_check_m:spherical,
 latitude_delta_actual_minus_estimated:0.00013,longitude_delta_actual_minus_estimated:-0.00069,
 original_report_radius_m:150,within_report_radius:geodesic.distance_m<=150,
 interpretation:'사용자 제공 실제점과 기존 추정 대표점 사이의 사후 거리. 도로 이동 거리·고도 포함 3D 거리·평균 정확도를 의미하지 않음',
 performed_by:'사용자 요청에 따라 PPT 편집 AI가 작성하고 실행한 Node.js 거리 계산 코드',
};
const comparisonPath=path.join(build,'coordinate_comparison.json');
await fs.writeFile(comparisonPath,JSON.stringify(comparison,null,2));

function text(n,k,value){
 const q=p.resolve(inv[n-1].elements.filter(x=>x.kind==='textbox')[k].id);
 q.text=value;q.name=value.replace(/\n/g,' ').slice(0,60);
}
function texts(n,data){for(const[k,v]of Object.entries(data))text(n,+k,v);}
function table(n,data){
 const t=p.resolve(inv[n-1].elements.find(x=>x.kind==='table').id);
 for(let r=0;r<data.length;r++)for(let c=0;c<data[r].length;c++)t.cells.set(r,c,data[r][c]);
}
texts(8,{8:'조사에는 역 이미지 검색을 쓰지 않았으며, 실제 좌표는 조사 후 사후 평가에만 사용했습니다'});
texts(25,{
 1:'실제 좌표와 추정 좌표의 사후 비교',
 2:'조사 후 사용자가 제공한 실제 촬영점과 기존 추정 대표점 사이의 지표면 거리를 계산했습니다',
 4:distance,
 6:'실제 촬영점과 추정 대표점 사이의 거리',
 7:'실제점은 추정점의 서북서쪽에 위치\n기존 보고 반경 150m 안에 포함',
 8:'한 장의 사후 비교 결과입니다. 평균 정확도나 62.4m의 보장 범위를 의미하지 않습니다',
});
table(25,[['구분','북위 (°)','동경 (°)'],['실제 촬영점','37.81438','128.89691'],['추정 대표점','37.81425','128.89760']]);
texts(26,{
 7:'실제 좌표와 약 62.4m 차이',
 8:'실제점은 추정점에서 서북서쪽\n기존 보고 반경 150m 안에 포함',
 14:'한 장의 사후 오차는 확인했으며, 다른 사진의 정확도와 일반 성능은 추가 평가가 필요합니다',
});
const t28=p.resolve(inv[27].elements.find(x=>x.kind==='table').id);
t28.cells.set(1,0,'촬영점 추정 오차 약 62.4m');
t28.cells.set(1,1,'가까운 지형과 기준점 추가 대조\n다른 테스트 사진의 실제 좌표 확보');
t28.cells.set(1,2,'다른 사진의 거리 오차·범위 포함 여부');
texts(32,{4:'사후 비교는 사용자 요청에 따라 PPT 편집 AI가 계산했으며, 결과는 25쪽에 반영했습니다'});

for(let i=0;i<32;i++){
 const s=p.slides.items[i];
 let note=String(s.speakerNotes.text??'');
 note=note.replace('제공된 정답 촬영 좌표는 없다.','조사 당시에는 실제 촬영 좌표를 제공받지 않았다. 조사 후 사용자가 북위37.81438°, 동경128.89691°를 실제 좌표로 알려 주었고 사후 평가에만 사용했다.');
 if(i===24){
  note='사용자 제공 실제 촬영 좌표(37.81438,128.89691)와 앞선 조사에서 보고한 추정 대표점(37.81425,128.89760)을 사후에 비교했다. 사용자가 최초 메시지에 적은 북위27.81438°는 확인 질문 후 북위37.81438°로 정정했다. 양 좌표는 WGS84 십진 도 좌표로 해석했다. 편집 AI가 작성해 실행한 Node.js 코드가 WGS84 타원체 역측지 계산(Vincenty)으로 지표면 최단 거리를 산출했다. 계산값62.44676232580829m를 소수 첫째 자리로 반올림해 약62.4m로 표시했다. 독립적인 평균 지구 반지름 Haversine 계산62.31245768438899m와도 대조했다. 실제점은 추정점에서 방위각 약283.36° 방향(서북서쪽)이다. 위도 차이는 실제점-추정점 +0.00013°, 경도 차이는 -0.00069°이다. 실제점은 원래 보고한 대표점 반경150m 안에 포함된다. 150m는 구역 보고 범위이며, 이번62.4m는 두 점 사이의 단일 사후 거리다. 이 값은 보장 오차나 평균 성능, 사진 기반 정밀 위치 계산의 검증 결과가 아니다. 사용자가 알려 준 실제 좌표 자체의 측량 정확도는 별도 검증하지 않았다.\n\n출처 및 계산 기록\n- 사용자 메시지의 실제 좌표와 북위37.81438° 확인 답변\n- '+path.join(root,'geo_work_20261102_coast/result.json')+'\n- '+comparisonPath+'\n- '+path.join(build,'edit_coords.mjs');
 } else if([7,25,27,31].includes(i)){
  note+='\n\n사후 평가 추가\n사용자가 조사 후 제공한 실제 좌표(37.81438,128.89691)와 기존 추정 대표점(37.81425,128.89760)의 WGS84 지표면 거리는 약62.4m다. 실제점은 기존 반경150m 안에 포함된다. 사후 비교는 사용자 요청을 받은 PPT 편집 AI의 계산이며, 원래 조사 과정의 독립적인 정밀 검증 성공으로 소급하지 않는다.\n- '+comparisonPath;
 }
 s.speakerNotes.text=note;
}
await(await PresentationFile.exportPptx(p)).save(path.join(build,'candidate_coords.pptx'));
console.log(JSON.stringify({slides:p.slides.items.length,comparison},null,2));
