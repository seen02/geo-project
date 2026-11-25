export const STATUS = {
  received: { label: '접수 완료', detail: '레퍼런스와 요청사항을 확인하고 있습니다.', step: 1 },
  researching: { label: '리서치 중', detail: '장소 후보와 사진 속 단서를 대조하고 있습니다.', step: 2 },
  review: { label: '추가 확인 필요', detail: '현재 확인된 범위와 남은 확인사항을 정리했습니다.', step: 3 },
  ready: { label: '리포트 완성', detail: '촬영지 리포트를 확인해 보세요.', step: 3 },
  failed: { label: '실행 확인 필요', detail: '실행 환경을 확인한 뒤 다시 시작할 수 있습니다.', step: 2 },
  cancelled: { label: '조사 중지', detail: '요청에 따라 조사를 중지했습니다.', step: 2 },
  interrupted: { label: '조사 중단', detail: '서버 종료로 중단되었습니다. 다시 시작할 수 있습니다.', step: 2 },
};
export const SAMPLE_ID = 'FR-SAMPLE-001';
export const SAMPLE_REPORT = {
  schema_version: 1,
  title: '호수의 가장자리에서, 능선을 마주하는 자리',
  place_name: '브라이에스 호수 일대',
  region: '돌로미티 · 이탈리아',
  summary: '호수 너머로 겹치는 산 능선과 물가의 구조물을 단서로 정리한 촬영지 카드의 예시입니다. 실제 위치 조사 결과가 아니며, 사진·좌표·방향·신뢰도는 서비스 시연을 위해 구성했습니다.',
  lat: 46.6944, lon: 12.0856, radius_m: 80, heading: 180,
  confidence: 'medium',
  coordinate_type: 'camera',
  composition: '물가를 전경으로 두고, 호수와 산 능선을 한 프레임 안에 배치하는 구도입니다.',
  best_time: '부드러운 아침빛을 가정한 예시입니다. 실제 일조·날씨 확인이 필요합니다.',
  access: '접근 동선과 현장 촬영 가능 여부는 확인하지 않았습니다. 방문 전 공식 안내를 확인해 주세요.',
  lens: '표준~광각 구도를 가정한 예시. 실제 화각과 렌즈는 확인되지 않았습니다.',
  clues: [
    { title: '겹쳐 보이는 산 능선', description: '사진 뒤편 능선의 높이와 윤곽을 비교하는 패널 예시입니다.', kind: '비교 예시' },
    { title: '호숫가의 구조물', description: '물가 구조물과 산의 상대적인 배치로 시야를 검토하는 예시입니다.', kind: '비교 예시' },
    { title: '촬영 방향과 시야', description: '카메라 방향과 오차 범위를 지도에 함께 제시합니다. 수치는 시연용입니다.', kind: '구성 예시' },
  ],
  alternatives: [{ name: '호수 인접 산책로', reason: '같은 배경을 볼 수 있는 대체 시점의 표시 예시입니다. 접근성은 미확인입니다.' }],
  caveats: ['이 리포트는 시연용 예시이며 실제 geo-sleuth 분석 결과가 아닙니다.', '지도 좌표는 예시 위치입니다. 이 사진의 실제 촬영 위치를 확정하지 않습니다.', '출입·촬영 허가, 계절별 접근성, 현재 현장 상태는 확인하지 않았습니다.'],
  sources: [{ title: '레퍼런스 사진 · Unsplash', url: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1' }, { title: 'OpenStreetMap · 예시 위치', url: 'https://www.openstreetmap.org/?mlat=46.6944&mlon=12.0856#map=15/46.6944/12.0856' }],
  evidence: [{ name: '능선과 수면의 배치 · 구성 예시', url: './assets/lake.jpg', description: '원본 사진 위에 단서를 표시하는 리포트 패널의 시연 예시입니다.', annotated: true }],
};
export function sampleRequest() {
  return {
    id: SAMPLE_ID, title: '호수와 능선이 겹치는 프레임', mode: 'original', region: '지역 제한 없음', purpose: '사진 촬영', brief: '사진 속 호수와 산 능선이 보이는 장소를 찾고, 카메라 위치와 방향을 근거와 함께 정리해 주세요.',
    constraints: '산 능선 · 호수 · 조용한 풍경', date: '', status: 'ready', createdAt: '2026-10-30T02:00:00Z', updatedAt: '2026-10-30T02:00:00Z', isSample: true,
    reference: { name: 'lake-reference.jpg', type: 'image/jpeg', url: './assets/lake.jpg' }, report: structuredClone(SAMPLE_REPORT),
  };
}
export function newId() { return 'FR-' + new Date().toISOString().slice(0,10).replaceAll('-','') + '-' + crypto.randomUUID().slice(0,6).toUpperCase(); }
export function escapeHTML(value = '') { return String(value).replace(/[&<>"']/g, x => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[x])); }
export function safeURL(value) {
  try { const u = new URL(String(value)); return ['http:', 'https:'].includes(u.protocol) ? u.href : ''; } catch { return ''; }
}
export function imageURL(value) {
  return typeof value === 'string' && (/^data:image\/(?:jpeg|png|webp);base64,[a-zA-Z0-9+/=]+$/.test(value) || /^\.\/assets\/[a-zA-Z0-9._-]+$/.test(value) || /^\/api\/requests\/FR-[A-Z0-9-]+\/files\/(?:[a-zA-Z0-9_%.-]+\/)*[a-zA-Z0-9_%.-]+\.(?:jpg|jpeg|png|webp)$/i.test(value)) ? value : '';
}
export function referenceURL(request) { return imageURL(request.reference?.dataUrl || request.reference?.url || ''); }
export function modeLabel(mode) { return mode === 'alternative' ? '비슷한 촬영지 찾기' : '사진 속 촬영지 찾기'; }
const SOURCE_TYPES = ['exif', 'geometry', 'sun_calc', 'visual', 'unknown'];
const VIEWPOINT_LEVELS = ['low', 'eye_level', 'elevated', 'aerial', 'unknown'];
const ORIENTATIONS = ['portrait', 'landscape', 'square', 'unknown'];
const pickEnum = (v, allowed, fallback) => (allowed.includes(v) ? v : fallback);
const numOrNull = (v, min = -Infinity, max = Infinity) => {
  if (v === undefined || v === null || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) && n >= min && n <= max ? n : null;
};

export function defaultOptics() {
  return {
    camera: '', lens_model: '', focal_mm: null, focal_35mm: null, digital_zoom: null,
    f_number: null, exposure_time: null, shutter: '', iso: null, exposure_bias: null,
    aspect_ratio: '', orientation: 'unknown', image_size: null, vfov: null,
    source: 'unknown', note: '',
  };
}
export function defaultCameraPov() {
  return {
    viewpoint_level: 'unknown', viewpoint_label: '', pitch_deg: null, roll_deg: null,
    elevation_m: null, elevation_source: 'unknown', height_agl_m: null,
    target_distance_m: null, distance_basis: '', slope_note: '', source: 'unknown',
  };
}
export function defaultLighting() {
  return {
    captured_at: '', capture_time_source: 'unknown', sun_azimuth: null, sun_elevation: null,
    light_type: '', plan_date: '', tz_offset_min: null,
    sunrise: '', sunset: '', golden_morning: '', golden_evening: '', blue_evening: '',
    recommended_window: '', source: 'unknown',
  };
}
function normalizeOptics(v, asText) {
  const o = v && typeof v === 'object' ? v : {};
  const size = Array.isArray(o.image_size) && o.image_size.length === 2 && o.image_size.every(n => Number.isFinite(Number(n)) && Number(n) > 0)
    ? [Math.round(Number(o.image_size[0])), Math.round(Number(o.image_size[1]))]
    : null;
  return {
    camera: asText(o.camera), lens_model: asText(o.lens_model),
    focal_mm: numOrNull(o.focal_mm, 0.1, 5000), focal_35mm: numOrNull(o.focal_35mm, 1, 5000),
    digital_zoom: numOrNull(o.digital_zoom, 0.1, 200), f_number: numOrNull(o.f_number, 0.5, 128),
    exposure_time: numOrNull(o.exposure_time, 1e-6, 36000), shutter: asText(o.shutter),
    iso: numOrNull(o.iso, 1, 10000000), exposure_bias: numOrNull(o.exposure_bias, -15, 15),
    aspect_ratio: asText(o.aspect_ratio), orientation: pickEnum(o.orientation, ORIENTATIONS, 'unknown'),
    image_size: size, vfov: numOrNull(o.vfov, 0.1, 179.9),
    source: pickEnum(o.source, SOURCE_TYPES, 'unknown'), note: asText(o.note),
  };
}
function normalizeCameraPov(v, asText) {
  const p = v && typeof v === 'object' ? v : {};
  return {
    viewpoint_level: pickEnum(p.viewpoint_level, VIEWPOINT_LEVELS, 'unknown'),
    viewpoint_label: asText(p.viewpoint_label),
    pitch_deg: numOrNull(p.pitch_deg, -90, 90), roll_deg: numOrNull(p.roll_deg, -180, 180),
    elevation_m: numOrNull(p.elevation_m, -500, 12000),
    elevation_source: pickEnum(p.elevation_source, SOURCE_TYPES, 'unknown'),
    height_agl_m: numOrNull(p.height_agl_m, 0, 10000),
    target_distance_m: numOrNull(p.target_distance_m, 0, 500000),
    distance_basis: asText(p.distance_basis), slope_note: asText(p.slope_note),
    source: pickEnum(p.source, SOURCE_TYPES, 'unknown'),
  };
}
function normalizeLighting(v, asText) {
  const l = v && typeof v === 'object' ? v : {};
  return {
    captured_at: asText(l.captured_at),
    capture_time_source: pickEnum(l.capture_time_source, SOURCE_TYPES, 'unknown'),
    sun_azimuth: numOrNull(l.sun_azimuth, 0, 360), sun_elevation: numOrNull(l.sun_elevation, -90, 90),
    light_type: asText(l.light_type), plan_date: asText(l.plan_date),
    tz_offset_min: numOrNull(l.tz_offset_min, -720, 840),
    sunrise: asText(l.sunrise), sunset: asText(l.sunset),
    golden_morning: asText(l.golden_morning), golden_evening: asText(l.golden_evening),
    blue_evening: asText(l.blue_evening), recommended_window: asText(l.recommended_window),
    source: pickEnum(l.source, SOURCE_TYPES, 'unknown'),
  };
}

export function normalizeReport(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('리포트 JSON은 객체 형식이어야 합니다.');
  const r = input.report && typeof input.report === 'object' ? input.report : input;
  const loc = typeof r.location === 'object' && r.location ? r.location : {};
  const getNumber = (value, fallback = null) => value === undefined || value === null || value === '' ? fallback : Number(value);
  const lat = getNumber(r.lat ?? r.latitude ?? loc.lat ?? loc.latitude);
  const lon = getNumber(r.lon ?? r.longitude ?? loc.lon ?? loc.longitude);
  if (lat !== null && (!Number.isFinite(lat) || lat < -90 || lat > 90)) throw new Error('위도는 -90~90 사이의 숫자여야 합니다.');
  if (lon !== null && (!Number.isFinite(lon) || lon < -180 || lon > 180)) throw new Error('경도는 -180~180 사이의 숫자여야 합니다.');
  if ((lat === null) !== (lon === null)) throw new Error('위도와 경도를 함께 입력해 주세요.');
  const radius = getNumber(r.radius_m ?? r.error_radius_m ?? loc.radius_m);
  if (radius !== null && (!Number.isFinite(radius) || radius < 0)) throw new Error('오차 반경은 0 이상의 숫자여야 합니다.');
  const rawHeading = getNumber(r.heading ?? r.heading_deg ?? loc.heading);
  if (rawHeading !== null && !Number.isFinite(rawHeading)) throw new Error('촬영 방향은 숫자여야 합니다.');
  const asText = v => typeof v === 'string' ? v : '';
  const list = v => Array.isArray(v) ? v : [];
  const confidence = typeof r.confidence === 'string' ? r.confidence.toLowerCase() : '';
  const caveats = list(r.caveats ?? r.limitations ?? r.unresolved).map(x => typeof x === 'string' ? x : asText(x.description)).filter(Boolean);
  const clues = list(r.clues ?? r.reasoning ?? r.evidence_chain).map(x => typeof x === 'string' ? { title: x, description: '', kind: '근거' } : { title: asText(x.title || x.clue || x.name), description: asText(x.description || x.reasoning || x.detail), kind: asText(x.kind || x.status) || '근거' }).filter(x => x.title);
  return {
    schema_version: 1,
    title: asText(r.title) || asText(r.place_name) || '촬영지 리서치 리포트',
    place_name: asText(r.place_name || r.place || r.location_name) || asText(loc.name) || asText(r.location),
    region: asText(r.region) || asText(loc.region), summary: asText(r.summary || r.conclusion), lat, lon,
    radius_m: radius, heading: rawHeading === null ? null : ((rawHeading % 360) + 360) % 360,
    coordinate_type: ['camera','camera_estimate','landmark','region'].includes(r.coordinate_type) ? r.coordinate_type : 'unknown',
    hfov: (()=>{const n=getNumber(r.hfov);if(n!==null&&(!Number.isFinite(n)||n<=0||n>=180))throw new Error('시야각은 0~180도 사이여야 합니다.');return n;})(),
    radius_basis:asText(r.radius_basis),heading_basis:asText(r.heading_basis),
    confidence_levels:Object.fromEntries(['city','area','road','camera'].map(k=>[k,{level:['high','medium','low'].includes(r.confidence_levels?.[k]?.level)?r.confidence_levels[k].level:'unrated',reason:asText(r.confidence_levels?.[k]?.reason)}])),
    verification:Object.fromEntries(['street_view','image_match','geometry'].map(k=>[k,{status:['verified','attempted','blocked','not_applicable'].includes(r.verification?.[k]?.status)?r.verification[k].status:'not_attempted',summary:asText(r.verification?.[k]?.summary),files:list(r.verification?.[k]?.files).filter(x=>typeof x==='string')} ])),
    evidence_spec:asText(r.evidence_spec),
    map_image:r.map_image&&imageURL(r.map_image.url)?r.map_image:null,
    quality:r.quality&&Array.isArray(r.quality.warnings)?r.quality:null,
    confidence: ['high','medium','low'].includes(confidence) ? confidence : 'unrated',
    optics: normalizeOptics(r.optics, asText),
    camera_pov: normalizeCameraPov(r.camera_pov, asText),
    lighting: normalizeLighting(r.lighting, asText),
    composition: asText(r.composition), best_time: asText(r.best_time), access: asText(r.access), lens: asText(r.lens),
    clues, caveats,
    alternatives: list(r.alternatives).map(x => typeof x === 'string' ? {name:x,reason:''} : {name:asText(x.name),reason:asText(x.reason || x.how_to_separate)}).filter(x=>x.name),
    sources: list(r.sources).map(x => typeof x === 'string' ? {title:x,url:safeURL(x)} : {title:asText(x.title || x.name),url:safeURL(x.url)}).filter(x=>x.url),
    evidence: list(r.evidence).filter(x=>x && typeof x === 'object').map(x=>({name:asText(x.name || x.title) || '조사 근거 이미지',description:asText(x.description),dataUrl:imageURL(x.dataUrl || x.url || ''),file:asText(x.file || x.path)})),
  };
}
export function validatePublication(report, review = false) {
  if (!report.place_name.trim()) throw new Error('장소명 또는 확인된 지역을 입력해 주세요.');
  if (!report.summary.trim()) throw new Error('리서치 요약을 입력해 주세요.');
  if (!review && (report.lat === null || report.lon === null)) throw new Error('확정 좌표가 없으면 ‘추가 확인 필요’로 전달해 주세요.');
  return report;
}
export function reportTemplate(request) {
  return { schema_version:1,request_id:request.id,title:request.title,place_name:'',region:'',summary:'',lat:null,lon:null,radius_m:null,heading:null,hfov:null,radius_basis:'',heading_basis:'',confidence_levels:Object.fromEntries(['city','area','road','camera'].map(k=>[k,{level:'unrated',reason:''}])),verification:Object.fromEntries(['street_view','image_match','geometry'].map(k=>[k,{status:'not_attempted',summary:'',files:[]}])),evidence_spec:'',coordinate_type:'unknown',confidence:'unrated',optics:defaultOptics(),camera_pov:defaultCameraPov(),lighting:defaultLighting(),composition:'',best_time:'',access:'',lens:'',clues:[],evidence:[{name:'조사 근거 이미지',file:'evidence.jpg',description:''}],alternatives:[],caveats:[],sources:[] };
}
export function handoffText(request) {
  const gear = Array.isArray(request.gear_lenses) && request.gear_lenses.length ? `\n보유 렌즈: ${request.gear_lenses.join(', ')}` : '';
  const light = request.light_pref ? `\n희망 광선: ${request.light_pref}` : '';
  return `# FRAME 촬영지 리서치 의뢰\n\n의뢰 번호: ${request.id}\n제목: ${request.title}\n조사 유형: ${modeLabel(request.mode)}\n지역 조건: ${request.region || '제한 없음'}\n촬영 목적: ${request.purpose || '미지정'}\n희망 날짜: ${request.date || '미정'}${gear}${light}\n추가 조건: ${request.constraints || '없음'}\n\n## 요청사항\n${request.brief}\n\n## 실행\n동봉된 reference 이미지를 분석 대상으로 사용하세요. 기존 geo-sleuth 스킬을 사용해 조사하고, 실제 실행한 도구와 결과 파일로 결론을 검증하세요.\n${request.mode === 'alternative' ? '이 의뢰는 지정 지역 안에서 비슷한 구도의 촬영지를 찾는 작업입니다. 원본의 실제 촬영지와 대체 촬영지 제안을 구분하세요. 현재 도구로 검증하지 못한 조건은 확인 불가로 남기세요.' : '사진의 실제 촬영지와 카메라 위치·방향을 조사하세요. 장소 대표 좌표와 카메라 위치를 구분하세요.'}\n\n## 결과물\n1. result.json: 동봉된 result.template.json의 형식으로 작성하세요. 좌표 미확정 시 lat/lon은 null, 신뢰도 미평가 시 confidence는 unrated. 수치를 지어내지 마세요.\n2. evidence.jpg 또는 evidence.png: 실제 비교한 지도/사진을 활용한 근거 이미지. 원본 출처와 이용 조건을 유지하세요.\n3. 추가 근거 이미지가 있으면 evidence 배열에 파일명과 설명을 기록하세요.\n\n카메라 방향은 북쪽 0°, 시계방향입니다. sources에는 실제 확인한 출처 제목과 URL을, caveats에는 미확인 사항과 한계를 기록하세요. 일조·접근성·촬영 허가·렌즈 정보는 확인했을 때만 작성하세요.\n\n조사 완료 후 FRAME 스튜디오에서 result.json과 근거 이미지를 가져오고, 미리보기 확인 후 리포트를 전달하세요.\n`;
}
export function restoreRequest(input) {
  if (!input || input.format !== 'frame-request-v1' || !input.request || typeof input.request !== 'object') throw new Error('FRAME 의뢰 백업 파일을 선택해 주세요.');
  const r = input.request;
  if (typeof r.id !== 'string' || !/^FR-[A-Z0-9-]{1,60}$/.test(r.id) || typeof r.title !== 'string' || typeof r.brief !== 'string') throw new Error('백업 파일의 의뢰 정보가 올바르지 않습니다.');
  if (!STATUS[r.status] || !['original','alternative'].includes(r.mode)) throw new Error('백업 파일의 상태 또는 의뢰 유형이 올바르지 않습니다.');
  if (!referenceURL(r)) throw new Error('백업 파일에 사용할 수 있는 레퍼런스 사진이 없습니다.');
  if (!Number.isFinite(Date.parse(r.createdAt)) || (r.updatedAt && !Number.isFinite(Date.parse(r.updatedAt)))) throw new Error('백업 파일의 날짜가 올바르지 않습니다.');
  return {...r,report:r.report ? normalizeReport(r.report) : null,draft:r.draft ? normalizeReport(r.draft) : null};
}
const crcTable = Array.from({length:256},(_,n)=>{for(let k=0;k<8;k++)n=(n&1)?0xedb88320^(n>>>1):n>>>1;return n>>>0;});
export function crc32(bytes) { let crc=0xffffffff;for(const b of bytes)crc=crcTable[(crc^b)&255]^(crc>>>8);return (crc^0xffffffff)>>>0; }
export function zipBytes(files) {
  const enc=new TextEncoder();const local=[],central=[];let offset=0;
  for (const file of files) {
    const name=enc.encode(file.name);const data=typeof file.content==='string'?enc.encode(file.content):file.content;
    if (!(data instanceof Uint8Array)) throw new Error('ZIP 파일 데이터가 올바르지 않습니다.');
    const crc=crc32(data);const head=new Uint8Array(30+name.length);const v=new DataView(head.buffer);
    v.setUint32(0,0x04034b50,true);v.setUint16(4,20,true);v.setUint16(6,0x0800,true);v.setUint32(14,crc,true);v.setUint32(18,data.length,true);v.setUint32(22,data.length,true);v.setUint16(26,name.length,true);head.set(name,30);
    const cen=new Uint8Array(46+name.length);const c=new DataView(cen.buffer);
    c.setUint32(0,0x02014b50,true);c.setUint16(4,20,true);c.setUint16(6,20,true);c.setUint16(8,0x0800,true);c.setUint32(16,crc,true);c.setUint32(20,data.length,true);c.setUint32(24,data.length,true);c.setUint16(28,name.length,true);c.setUint32(42,offset,true);cen.set(name,46);
    local.push(head,data);central.push(cen);offset+=head.length+data.length;
  }
  const csize=central.reduce((n,x)=>n+x.length,0);const end=new Uint8Array(22);const e=new DataView(end.buffer);e.setUint32(0,0x06054b50,true);e.setUint16(8,files.length,true);e.setUint16(10,files.length,true);e.setUint32(12,csize,true);e.setUint32(16,offset,true);
  return new Blob([...local,...central,end],{type:'application/zip'});
}
