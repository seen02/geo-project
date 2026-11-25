#!/usr/bin/env node
// Recover genuinely verifiable photographer metadata (EXIF, DEM elevation, target distances, NOAA sun schedule)
// from existing .local-data/requests/*/runs/* artifacts without fabricating missing or rejected values.

import { copyFile, mkdir, readdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { normalizeReport, SAMPLE_ID } from '../dist/lib/domain.js';
import { runtimeConfig } from '../lib/runtime.mjs';
import { applyPhotographerEnrichment, readPhotoExif } from '../lib/enrich.mjs';

const base = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dataRoot = path.resolve(process.env.FRAME_DATA_DIR || path.join(base, '.local-data'));
const requestsDir = path.join(dataRoot, 'requests');
const backupDir = path.join(dataRoot, 'backups', 'pre-photo-recovery');
const config = runtimeConfig(dataRoot);

async function readTextIfExists(filePath) {
  try {
    return (await readFile(filePath, 'utf8')).replace(/^\uFEFF/, '').trim();
  } catch {
    return null;
  }
}

function parseMeters(text) {
  if (!text) return null;
  const m = /(?:^|\s)(\d+(?:\.\d+)?)\s*m\b/i.exec(text.split('\n')[0]);
  return m ? Number(m[1]) : null;
}

function parseBearingDistance(text) {
  if (!text) return null;
  const b = /bearing=([-\d.]+)deg/i.exec(text);
  const d = /distance=([\d.]+)m/i.exec(text);
  return {
    bearing: b ? Number(b[1]) : null,
    distance: d ? Number(d[1]) : null,
  };
}

async function findReferenceImage(runDir) {
  try {
    const entries = await readdir(runDir);
    const match = entries.find(n => /^reference\.(jpg|jpeg|png|webp)$/i.test(n));
    return match ? path.join(runDir, match) : null;
  } catch {
    return null;
  }
}

async function latestRunDir(reqFolder, record) {
  const runsRoot = path.join(reqFolder, 'runs');
  if (record.job?.attempt) {
    const candidate = path.join(runsRoot, String(record.job.attempt));
    if (await stat(candidate).then(s => s.isDirectory(), () => false)) return candidate;
  }
  try {
    const dirs = (await readdir(runsRoot, { withFileTypes: true }))
      .filter(d => d.isDirectory() && /^\d+$/.test(d.name))
      .map(d => Number(d.name))
      .sort((a, b) => b - a);
    return dirs.length ? path.join(runsRoot, String(dirs[0])) : null;
  } catch {
    return null;
  }
}

async function recoverGeometryFromRun(runDir, report) {
  const pov = { ...(report.camera_pov || {}) };
  const recoveredNotes = [];
  if (!runDir) return { pov, recoveredNotes };

  // 1. Verified terrain DEM elevations
  const elevCam = parseMeters(await readTextIfExists(path.join(runDir, 'terrain-camera.txt')));
  const elevSingle = parseMeters(await readTextIfExists(path.join(runDir, 'terrain-elevation.txt')));
  const elevMid = parseMeters(await readTextIfExists(path.join(runDir, 'terrain-mid.txt')));
  const elevLower = parseMeters(await readTextIfExists(path.join(runDir, 'terrain-lower.txt')));

  if (Number.isFinite(elevCam)) {
    pov.elevation_m = elevCam;
    pov.elevation_source = 'geometry';
    recoveredNotes.push(`DEM 고도 ${elevCam}m`);
  } else if (Number.isFinite(elevSingle)) {
    pov.elevation_m = elevSingle;
    pov.elevation_source = 'geometry';
    recoveredNotes.push(`DEM 고도 ${elevSingle}m`);
  }

  // 2. Verified geo.py bearings & distances
  const roadBear = parseBearingDistance(await readTextIfExists(path.join(runDir, 'geometry-road-bearing.txt')));
  const longBear = parseBearingDistance(await readTextIfExists(path.join(runDir, 'geometry-long-bearing.txt')));
  const lookoutBear = parseBearingDistance(await readTextIfExists(path.join(runDir, 'bearing-lookout.txt')));
  const skybayBear = parseBearingDistance(await readTextIfExists(path.join(runDir, 'bearing-skybay.txt')));
  const landmarkBear = parseBearingDistance(await readTextIfExists(path.join(runDir, 'landmark-bearing.txt')));

  if (Number.isFinite(longBear?.distance)) {
    pov.target_distance_m = longBear.distance;
    const midPart = Number.isFinite(roadBear?.distance) ? ` (인접 파노라마 ${roadBear.distance}m)` : '';
    pov.distance_basis = `상단 추정점에서 골목 하단 기준점까지 geo.py 계산 거리 ${longBear.distance}m${midPart}`;
    recoveredNotes.push(`피사체 거리 ${longBear.distance}m`);
  } else if (Number.isFinite(lookoutBear?.distance)) {
    pov.target_distance_m = lookoutBear.distance;
    const farPart = Number.isFinite(skybayBear?.distance) ? ` (원경 건물 ${skybayBear.distance}m)` : '';
    pov.distance_basis = `후보점에서 해중공원 전망대까지 geo.py 계산 거리 ${lookoutBear.distance}m${farPart}`;
    recoveredNotes.push(`전망대 거리 ${lookoutBear.distance}m`);
  } else if (Number.isFinite(landmarkBear?.distance)) {
    pov.target_distance_m = landmarkBear.distance;
    pov.distance_basis = `장소 대표점에서 원경 랜드마크까지 geo.py 계산 거리 약 ${(landmarkBear.distance / 1000).toFixed(2)}km (대표점 기준 참고값)`;
    recoveredNotes.push(`원경 거리 ${(landmarkBear.distance / 1000).toFixed(2)}km`);
  }

  if (Number.isFinite(elevCam) && Number.isFinite(elevLower)) {
    const midStr = Number.isFinite(elevMid) && Number.isFinite(roadBear?.distance)
      ? ` → 중간 ${elevMid}m(${roadBear.distance}m)`
      : '';
    const distStr = Number.isFinite(longBear?.distance) ? `(${longBear.distance}m)` : '';
    pov.slope_note = `지형 경사: 상단 ${elevCam}m${midStr} → 하단 ${elevLower}m${distStr}`;
    recoveredNotes.push(`지형 경사 ${elevCam}m→${elevLower}m`);
  }

  // 3. Honest viewpoint classification grounded strictly in verified report context (never adopting rejected pose fits)
  const textBlob = `${report.place_name || ''} ${report.summary || ''} ${report.composition || ''}`;
  if (/창가/.test(textBlob)) {
    pov.viewpoint_level = 'elevated';
    pov.viewpoint_label = '실내 전면 창가 추정 (정확한 층·호실 미확정)';
    pov.source = 'visual';
  } else if (Number.isFinite(elevCam) && Number.isFinite(elevLower)) {
    pov.viewpoint_level = 'eye_level';
    pov.viewpoint_label = '보행 눈높이 · 상단 내리막 골목';
    pov.source = 'geometry';
  } else if (/석축/.test(textBlob) && Number.isFinite(elevSingle)) {
    pov.viewpoint_level = 'eye_level';
    pov.viewpoint_label = '해안 곡선 석축 눈높이 추정 (높이 가정 민감)';
    pov.source = 'geometry';
  } else if (/선상 촬영|목조 보트/.test(textBlob)) {
    pov.viewpoint_level = 'low';
    pov.viewpoint_label = '목조 보트 선상 촬영 (수면 인접)';
    pov.source = 'visual';
  }

  return { pov, recoveredNotes };
}

export async function recoverAll({ syncShowcase = true } = {}) {
  await mkdir(backupDir, { recursive: true });
  const entries = (await readdir(requestsDir, { withFileTypes: true }))
    .filter(d => d.isDirectory())
    .sort((a, b) => a.name.localeCompare(b.name));

  const summary = [];
  const recoveredById = new Map();

  for (const dir of entries) {
    const reqFolder = path.join(requestsDir, dir.name);
    const statePath = path.join(reqFolder, 'state.json');
    if (!await stat(statePath).then(s => s.isFile(), () => false)) continue;

    // One-time backup of pristine state.json
    const backupPath = path.join(backupDir, `${dir.name}.state.json`);
    if (!await stat(backupPath).then(s => s.isFile(), () => false)) {
      await copyFile(statePath, backupPath);
    }

    const record = JSON.parse(await readFile(statePath, 'utf8'));
    if (!record.report) {
      summary.push({ id: dir.name, skipped: 'no report' });
      continue;
    }

    if (dir.name === SAMPLE_ID || record.isSample) {
      if (!record.report.coordinate_type) record.report.coordinate_type = 'camera';
      record.report = normalizeReport(record.report);
      await writeFile(statePath, JSON.stringify(record, null, 2), 'utf8');
      summary.push({ id: dir.name, title: record.title, items: ['샘플 coordinate_type/스키마 정규화'] });
      continue;
    }

    const runDir = await latestRunDir(reqFolder, record);
    const refPath = runDir ? await findReferenceImage(runDir) : null;
    const exif = refPath ? await readPhotoExif(refPath, config) : null;

    let report = normalizeReport(record.report);
    const { pov, recoveredNotes } = await recoverGeometryFromRun(runDir, report);
    report.camera_pov = pov;
    report = normalizeReport(applyPhotographerEnrichment(report, exif, record));

    const items = [];
    if (report.optics.image_size) items.push(`해상도 ${report.optics.image_size[0]}×${report.optics.image_size[1]} (${report.optics.aspect_ratio})`);
    if (report.optics.source === 'exif') {
      items.push(`EXIF: ${[report.optics.camera, report.optics.focal_35mm && `${report.optics.focal_35mm}mm`, report.optics.f_number && `f/${report.optics.f_number}`, report.optics.shutter, report.optics.iso && `ISO ${report.optics.iso}`].filter(Boolean).join(' · ')}`);
    } else {
      items.push('EXIF 없음(미확인 유지)');
    }
    if (report.camera_pov.elevation_source === 'exif' && Number.isFinite(report.camera_pov.elevation_m)) {
      items.push(`EXIF GPS 고도 ${report.camera_pov.elevation_m}m`);
    }
    items.push(...recoveredNotes);
    if (report.lighting.captured_at) {
      items.push(`촬영시각 ${report.lighting.captured_at} · 태양 ${report.lighting.sun_azimuth}°/고도 ${report.lighting.sun_elevation}° (${report.lighting.light_type})`);
    }
    if (report.lighting.plan_date && report.lighting.sunrise) {
      items.push(`${report.lighting.plan_date} 일출 ${report.lighting.sunrise}/일몰 ${report.lighting.sunset}/오후 골든 ${report.lighting.golden_evening}`);
    }

    record.report = report;
    await writeFile(statePath, JSON.stringify(record, null, 2), 'utf8');
    recoveredById.set(dir.name, report);
    summary.push({ id: dir.name, title: record.title, items });
  }

  if (syncShowcase) {
    const showcasePath = path.join(base, 'dist', 'lib', 'showcase.js');
    try {
      const { SHOWCASE } = await import(`file:///${showcasePath.replace(/\\/g, '/')}?t=${Date.now()}`);
      let updated = 0;
      const nextShowcase = SHOWCASE.map(item => {
        const src = recoveredById.get(item.sourceRequestId);
        if (!src) return item;
        updated++;
        return {
          ...item,
          report: {
            ...item.report,
            optics: src.optics,
            camera_pov: src.camera_pov,
            lighting: src.lighting,
          },
        };
      });
      if (updated > 0) {
        const content = `// Public, read-only examples. These records never enter the investigation queue.\n// Reports and annotated evidence retain their original source links and limitations.\nexport const SHOWCASE = ${JSON.stringify(nextShowcase, null, 2)};\n`;
        await writeFile(showcasePath, content, 'utf8');
      }
    } catch (err) {
      console.warn('showcase sync skipped:', err.message);
    }
  }

  return summary;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const results = await recoverAll();
  console.log(JSON.stringify(results, null, 2));
}
