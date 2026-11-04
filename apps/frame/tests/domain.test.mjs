import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import { normalizeReport,validatePublication,safeURL,imageURL,restoreRequest,sampleRequest,handoffText,reportTemplate,zipBytes,crc32 } from '../dist/lib/domain.js';

test('geo-sleuth 좌표 별칭과 미확정 값을 손실 없이 읽는다',()=>{
  const result=normalizeReport({latitude:0,longitude:0,error_radius_m:0,heading_deg:-90,location:'테스트 장소',conclusion:'근거가 있는 결론',confidence:'high',reasoning:['확인한 단서']});
  assert.equal(result.lat,0);assert.equal(result.lon,0);assert.equal(result.radius_m,0);assert.equal(result.heading,270);assert.equal(result.clues.length,1);
  const unresolved=normalizeReport({place_name:'지역만 확인',lat:null,lon:null,confidence:{city:'high'}});
  assert.equal(unresolved.lat,null);assert.equal(unresolved.radius_m,null);assert.equal(unresolved.heading,null);assert.equal(unresolved.confidence,'unrated');
});
test('위험한 URL과 외부 이미지 경로는 화면 입력에서 제거한다',()=>{
  assert.equal(safeURL('javascript:alert(1)'),'');assert.equal(imageURL('https://attacker.invalid/image.jpg'),'');assert.equal(imageURL('data:image/svg+xml;base64,PHN2Zz4='),'');
  const r=normalizeReport({sources:[{title:'bad',url:'javascript:alert(1)'},{title:'ok',url:'https://example.com'}],evidence:[{name:'bad',url:'file:///private.jpg'}]});
  assert.equal(r.sources.length,1);assert.equal(r.evidence[0].dataUrl,'');
});
test('잘못된 좌표 및 반쪽 좌표를 차단한다',()=>{
  for(const v of [{lat:91,lon:0},{lat:0,lon:-181},{lat:1},{lat:'NaN',lon:2},{radius_m:-1},{heading:'north'}])assert.throws(()=>normalizeReport(v));
});
test('좌표가 없는 결과는 완성 대신 추가 확인 상태로 전달할 수 있다',()=>{
  const r=normalizeReport({place_name:'제주 동부 일대',summary:'세부 지점은 아직 확인되지 않았습니다.'});
  assert.throws(()=>validatePublication(r));assert.equal(validatePublication(r,true),r);
  assert.throws(()=>validatePublication(normalizeReport({}),true));
});
test('백업 파일은 의뢰 형식과 상태·사진·날짜를 검증한다',()=>{
  const sample=sampleRequest();assert.equal(restoreRequest({format:'frame-request-v1',request:sample}).id,sample.id);
  assert.throws(()=>restoreRequest({request:sample}));
  assert.throws(()=>restoreRequest({format:'frame-request-v1',request:{...sample,status:'invalid'}}));
  assert.throws(()=>restoreRequest({format:'frame-request-v1',request:{...sample,reference:{url:'javascript:bad'}}}));
});
test('수동 조사 요청에는 사진·의뢰조건·결과 계약이 함께 들어간다',()=>{
  const sample={...sampleRequest(),mode:'alternative',region:'제주',constraints:'공개 접근 가능한 장소'};
  const handoff=handoffText(sample);assert.match(handoff,/제주/);assert.match(handoff,/대체 촬영지/);assert.match(handoff,/result.json/);assert.match(handoff,/확인 불가/);assert.equal(reportTemplate(sample).request_id,sample.id);
});
test('내려받는 ZIP의 CRC와 UTF-8 패키징을 검증한다',async()=>{
  assert.equal(crc32(new TextEncoder().encode('123456789')),0xcbf43926);
  const blob=zipBytes([{name:'FR-TEST/TASK.md',content:'촬영지 조사 지침'},{name:'FR-TEST/reference.png',content:new Uint8Array([137,80,78,71])}]);
  await mkdir(new URL('../test-results/',import.meta.url),{recursive:true});
  await writeFile(new URL('../test-results/packet.zip',import.meta.url),new Uint8Array(await blob.arrayBuffer()));
  assert.equal(blob.type,'application/zip');
});
