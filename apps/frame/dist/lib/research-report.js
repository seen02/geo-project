import {escapeHTML as h,imageURL} from './domain.js';
export function researchDetails(e){
 const levels=e.confidence_levels||{};
 const degree=n=>Number.isFinite(n)?`${n}°`:'미산정';
 const type={camera:'확인된 촬영점',camera_estimate:'추정 촬영점',landmark:'장소 대표점',region:'지역 참고점',unknown:'좌표 유형 미확인'}[e.coordinate_type]||'좌표 유형 미확인';
 const labels={city:'도시',area:'지역·장소',road:'도로·진입로',camera:'정확한 촬영점'};
 return `<section class="research-details"><div class="research-metrics"><div><small>위치 유형</small><b>${type}</b></div><div><small>위치 추정 반경</small><b>${Number.isFinite(e.radius_m)?'약 '+h(e.radius_m)+'m':'미산정'}</b></div><div><small>촬영 방위각</small><b>${degree(e.heading)}</b></div><div><small>수평 시야각</small><b>${degree(e.hfov)}</b></div></div>${overlay(e)}<div class="research-basis"><p><b>반경 근거</b> ${h(e.radius_basis||'산정 근거가 기록되지 않았습니다.')}</p><p><b>방향 근거</b> ${h(e.heading_basis||'산정 근거가 기록되지 않았습니다.')}</p><small>위치 추정 반경은 통계적 신뢰구간을 뜻하지 않습니다. 방위각은 진북 0°에서 시계방향, 시야각은 부채꼴의 폭입니다.</small></div><table class="research-table"><thead><tr><th>확인 범위</th><th>신뢰도</th><th>판단 근거</th></tr></thead><tbody>${Object.entries(labels).map(([k,label])=>`<tr><td>${label}</td><td>${({high:'높음',medium:'중간',low:'낮음'})[levels[k]?.level]||'미평가'}</td><td>${h(levels[k]?.reason||'단계별 평가가 기록되지 않았습니다.')}</td></tr>`).join('')}</tbody></table>${e.quality?`<div class="research-audit"><b>검증 확인</b>${Object.entries(e.quality.checks||{}).map(([k,v])=>`<p>${v.validated?'✓':'!'} ${({street_view:'거리사진 대조',image_match:'이미지 후보 순위화',geometry:'기하 검증'})[k]} · ${h(v.summary)}</p>`).join('')}${e.quality.warnings.length?'<p>추가 확인 항목 '+e.quality.warnings.length+'개 · 아래 확인사항을 참고하세요.</p>':''}</div>`:''}</section>`;
}
export function overlay(e){
 const m=e.map_image;
 if(!m||!imageURL(m.url)||!['camera','camera_estimate'].includes(e.coordinate_type)||!Number.isFinite(e.lat)||!Number.isFinite(e.lon))return '';
 if(!Array.isArray(m.size)||m.size.some(n=>!Number.isFinite(n)||n<=0)||!Array.isArray(m.origin_tile)||!Number.isFinite(m.zoom)||Math.abs(e.lat)>85.0511)return '';
 const [w,height]=m.size,world=256*2**m.zoom,lat=e.lat*Math.PI/180;
 const x=(e.lon+180)/360*world-m.origin_tile[0]*256,y=(1-Math.asinh(Math.tan(lat))/Math.PI)/2*world-m.origin_tile[1]*256;
 const meters=40075016.6856*Math.cos(lat)/world,r=Number.isFinite(e.radius_m)?e.radius_m/meters:null;
 if(x<0||x>w||y<0||y>height)return '<p class="notice">지도 범위 밖의 촬영점입니다. 지도 이미지의 범위를 확인해 주세요.</p>';
 const reach=Math.min(w,height)*.32,angle=e.heading,fov=e.hfov;
 const p=a=>[x+reach*Math.sin(a*Math.PI/180),y-reach*Math.cos(a*Math.PI/180)];
 let cone='';
 if(Number.isFinite(angle)){
  const end=p(angle);cone=`<path d="M ${x} ${y} L ${end[0]} ${end[1]}" stroke="#ffe467" stroke-width="3"/>`;
  if(Number.isFinite(fov)&&fov>0&&fov<180){const a=p(angle-fov/2),b=p(angle+fov/2);cone+=`<path d="M ${x} ${y} L ${a[0]} ${a[1]} A ${reach} ${reach} 0 0 1 ${b[0]} ${b[1]} Z" fill="#ffe46744" stroke="#ffe467"/>`;}
 }
 return `<figure class="camera-overlay"><svg width="${w}" height="${height}" viewBox="0 0 ${w} ${height}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="촬영 후보점과 추정 반경·방향"><image href="${h(m.url)}" width="${w}" height="${height}"/>${r!==null?`<circle cx="${x}" cy="${y}" r="${r}" fill="#6fbdff22" stroke="#8ad2ff" stroke-dasharray="7 5" stroke-width="2"/>`:''}${cone}<circle cx="${x}" cy="${y}" r="6" fill="#e75145" stroke="white" stroke-width="2"/></svg><figcaption>촬영 후보점 · ${Number.isFinite(e.radius_m)?'파란 점선: 위치 추정 반경 약 '+h(e.radius_m)+'m':'반경 미산정'} · ${Number.isFinite(angle)?'노란 선: 방위각 '+degreeText(angle):'방향 미산정'}${Number.isFinite(fov)?' · 부채꼴 시야각 '+degreeText(fov):''}<br>실제 위성영상 위 표시 · 촬영점·반경·시야는 조사 결과에 따른 추정이며 영상 촬영일과 출처는 근거 자료를 참고하세요.</figcaption></figure>`;
}
const degreeText=n=>h(n)+'°';
