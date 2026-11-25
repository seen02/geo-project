import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { normalizeReport, reportTemplate, handoffText } from '../dist/lib/domain.js';
import { researchDetails, overlay } from '../dist/lib/research-report.js';
import {
  aspectRatioLabel,
  equivFocalFromHfov,
  formatGpx,
  formatShutter,
  fovFromEquivFocal,
  lightingRelation,
  parseDateTimeWithOffset,
  solarSchedule,
  sunPosition,
} from '../dist/lib/sun-calc.js';
import { parseJpegExif } from '../dist/lib/exif-client.js';
import { applyPhotographerEnrichment } from '../lib/enrich.mjs';

const base = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('NOAA 태양 위치·골든아워·광선 방향 계산이 정확한 범위를 반환한다', () => {
  const parsed = parseDateTimeWithOffset('2026-11-03T13:49:03+09:00', 540);
  assert.equal(parsed.dateStr, '2026-11-03');
  assert.equal(parsed.offsetMin, 540);
  const pos = sunPosition(37.1926194, 127.0277161, parsed.utcDate);
  assert.ok(pos.azimuth > 195 && pos.azimuth < 220, `azimuth=${pos.azimuth}`);
  assert.ok(pos.elevation > 28 && pos.elevation < 38, `elevation=${pos.elevation}`);
  // Camera looking NE (42°) with sun in SSW (~205°) is front-lit (순광)
  const rel = lightingRelation(pos.azimuth, pos.elevation, 42);
  assert.equal(rel.phase, '주간');
  assert.equal(rel.relation, '순광');

  const sched = solarSchedule(37.583326, 126.983396, '2026-11-15', 540);
  assert.match(sched.sunrise, /^07:\d\d$/);
  assert.match(sched.sunset, /^17:\d\d$/);
  assert.ok(sched.golden_evening.includes('–'));
  assert.ok(sched.blue_evening.includes('–'));
});

test('35mm 환산 초점거리·시야각·셔터·화면비·GPX 유틸리티가 정확히 동작한다', () => {
  assert.equal(aspectRatioLabel(2252, 4000), '9:16');
  assert.equal(aspectRatioLabel(1440, 810), '16:9');
  assert.equal(aspectRatioLabel(2000, 1333), '3:2');
  assert.equal(formatShutter(0.001712328), '1/584s');
  assert.equal(formatShutter(2.5), '2.5s');
  const f = fovFromEquivFocal(23, 9, 16);
  assert.ok(f.hfov > 44 && f.hfov < 52, `hfov=${f.hfov}`);
  assert.equal(equivFocalFromHfov(f.hfov, 9, 16), 23);
  assert.equal(equivFocalFromHfov(73.7, 3, 2), 24);
  const gpx = formatGpx({ lat: 37.583326, lon: 126.983396, place_name: '북촌로11가길', heading: 155, radius_m: 25, camera_pov: { elevation_m: 71 }, summary: '테스트' });
  assert.match(gpx, /lat="37.583326" lon="126.983396"/);
  assert.match(gpx, /<ele>71<\/ele>/);
});

test('포토그래퍼 확장 필드는 기존 JSON과 하위 호환되고 리포트·오버레이에 렌더링된다', () => {
  const legacy = normalizeReport({ place_name: '구버전 장소', summary: '기존 필드만 있음' });
  assert.equal(legacy.optics.source, 'unknown');
  assert.equal(legacy.camera_pov.pitch_deg, null);
  assert.equal(legacy.lighting.captured_at, '');

  const enriched = normalizeReport(applyPhotographerEnrichment(
    normalizeReport({
      place_name: '한신대 통일관', summary: '테스트', coordinate_type: 'camera_estimate',
      lat: 37.1926194, lon: 127.0277161, radius_m: 35, heading: 42, hfov: 46,
      map_image: { url: '/api/requests/FR-TEST/files/map.jpg', zoom: 19, origin_tile: [447139, 203714], size: [1280, 1280] },
    }),
    {
      ok: true, has_exif: true, image_size: [2252, 4000], camera: 'samsung Galaxy S24',
      focal_mm: 5.4, focal_35mm: 23, f_number: 1.8, exposure_time: 0.001712, shutter: '1/584s', iso: 25,
      captured_at: '2026-11-03T13:49:03+09:00', gps_altitude_m: 78.0,
    },
    { date: '' }
  ));
  assert.equal(enriched.optics.source, 'exif');
  assert.equal(enriched.optics.f_number, 1.8);
  assert.equal(enriched.optics.iso, 25);
  assert.equal(enriched.camera_pov.elevation_m, 78);
  assert.equal(enriched.lighting.light_type, '순광');

  const html = researchDetails(enriched);
  assert.match(html, /EXIF 확인/);
  assert.match(html, /f\/1\.8 · 1\/584s · ISO 25/);
  assert.match(html, /환산 23mm/);
  assert.match(overlay(enriched), /화각 시뮬레이터/);
  assert.match(overlay(enriched), /태양 광선 표시/);

  const tmpl = reportTemplate({ id: 'FR-PHOTO-1', title: '포토 테스트' });
  assert.equal(tmpl.optics.source, 'unknown');
  const handoff = handoffText({ id: 'FR-PHOTO-1', title: '포토 테스트', mode: 'original', brief: '테스트', gear_lenses: ['표준 (24-70mm)'], light_pref: '골든아워' });
  assert.match(handoff, /보유 렌즈: 표준 \(24-70mm\)/);
  assert.match(handoff, /희망 광선: 골든아워/);
});

test('클라이언트 순수 JS JPEG EXIF 파서가 실제 저장된 캠퍼스 사진의 메타데이터를 읽는다', async () => {
  const campusPhoto = path.join(base, '.local-data', 'requests', 'FR-20261103-976876', 'runs', '1', 'reference.jpg');
  const buf = await readFile(campusPhoto).catch(() => null);
  if (!buf) return; // Skip cleanly in fresh clones without .local-data
  const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
  const ex = parseJpegExif(ab);
  assert.equal(ex.hasExif, true);
  assert.match(ex.camera, /Galaxy S24/);
  assert.equal(ex.focal_35mm, 23);
  assert.equal(ex.f_number, 1.8);
  assert.equal(ex.iso, 25);
  assert.equal(ex.shutter, '1/584s');
  assert.ok(ex.captured_at.startsWith('2026-11-03T13:49:03'));
  assert.equal(ex.gps_altitude_m, 78);
});
