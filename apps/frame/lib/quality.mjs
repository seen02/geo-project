import {readFile,stat} from 'node:fs/promises';

export async function assessReport(report,resolve,tools,assets={}){
  const warnings=[], checks={};
  const valid=f=>assets[f]?.ok===true;
  for(const [key,names] of Object.entries({street_view:['gsv.py','baidu_pano.py'],image_match:['match.py'],geometry:['pose.py','geo.py']})){
    const entry=report.verification[key];let files=true;
    for(const f of entry.files){try{if(!(await stat(await resolve(f))).isFile()||!valid(f))files=false;}catch{files=false;}}
    const verified=entry.status==='verified'&&entry.files.length>0&&files&&names.some(n=>tools.has(n));
    checks[key]={...entry,validated:!!verified};
    if(!verified)warnings.push(({street_view:'거리사진 대조',image_match:'후보 이미지 순위화',geometry:'촬영 위치·방향 기하 검증'})[key]+'의 실행·산출물 확인이 완료되지 않았습니다. '+entry.summary);
  }
  let spec=null,map=null;
  try{
    spec=JSON.parse((await readFile(await resolve(report.evidence_spec),'utf8')).replace(/^\uFEFF/,''));
    const metaPath=spec.map.replace(/\.[^.]+$/,'.json');
    const meta=JSON.parse((await readFile(await resolve(metaPath),'utf8')).replace(/^\uFEFF/,''));
    if(!/\.(jpg|jpeg|png|webp)$/i.test(spec.map))throw new Error('Map must be an image');
    if(!valid(spec.map)||!valid(metaPath)||meta.failed_tiles!==0)throw new Error('Incomplete or invalid satellite mosaic');
    if(assets[spec.map].width!==meta.size?.[0]||assets[spec.map].height!==meta.size?.[1])throw new Error('Mosaic size does not match metadata');
    if(Number.isInteger(meta.zoom)&&meta.zoom>=0&&meta.zoom<=24&&Array.isArray(meta.origin_tile)&&meta.origin_tile.length===2&&meta.origin_tile.every(Number.isFinite)&&Array.isArray(meta.size)&&meta.size.length===2&&meta.size.every(n=>Number.isFinite(n)&&n>0))map={file:spec.map,zoom:meta.zoom,origin_tile:meta.origin_tile,size:meta.size};
  }catch{}
  const camera=['camera','camera_estimate'].includes(report.coordinate_type)&&report.lat!==null&&report.lon!==null;
  const cameraMark=camera&&Array.isArray(spec?.camera)&&Math.abs(spec.camera[0]-report.lat)<.00001&&Math.abs(spec.camera[1]-report.lon)<.00001;
  const heading=report.heading!==null&&Number.isFinite(spec?.heading)&&Math.abs(((spec.heading-report.heading+540)%360)-180)<1;
  let panels=Array.isArray(spec?.panels)&&spec.panels.length>=2&&new Set(spec.panels.map(p=>p.image)).size>=2;
  if(panels)for(const p of spec.panels){try{await resolve(p.image);if(!valid(p.image))panels=false;}catch{panels=false;}}
  for(const [file,result] of Object.entries(assets))if(!result.ok)warnings.push(`자료 검사 실패 (${file}): ${result.error||'손상되거나 비어 있는 자료입니다.'}`);
  if(camera&&!cameraMark)warnings.push('근거 이미지 설정의 촬영점이 결과 좌표와 일치하는지 확인하지 못했습니다.');
  if(report.heading!==null&&!heading)warnings.push('근거 이미지 설정의 촬영 방향이 결과와 일치하는지 확인하지 못했습니다.');
  if(!panels)warnings.push('원본·대조 자료의 비교 패널 설정이 부족합니다.');
  if(!map)warnings.push('범위·방향을 겹쳐 표시할 원본 지도와 타일 메타데이터가 없습니다.');
  if(camera&&report.radius_m!==null&&!report.radius_basis)warnings.push('위치 추정 반경의 산정 근거가 없습니다.');
  if(report.heading!==null&&!report.heading_basis)warnings.push('촬영 방향의 산정 근거가 없습니다.');
  return {checks,warnings,map,ready:!!(camera&&report.radius_m!==null&&report.heading!==null&&report.radius_basis&&report.heading_basis&&report.evidence.length&&['high','medium'].includes(report.confidence)&&Object.values(checks).every(x=>x.validated)&&cameraMark&&heading&&panels&&map)};
}
