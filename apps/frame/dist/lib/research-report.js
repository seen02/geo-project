import { escapeHTML as h, imageURL } from './domain.js';
import {
  formatMinutes,
  fovFromEquivFocal,
  guessTimezoneOffsetMinutes,
  lightingRelation,
  parseDateTimeWithOffset,
  solarSchedule,
  sunAtLocalMinutes,
} from './sun-calc.js';

const SOURCE_LABELS = {
  exif: 'EXIF 확인',
  geometry: '기하 계산',
  sun_calc: '태양 계산',
  visual: '시각 참고',
  unknown: '미확인',
};
const VIEWPOINT_LABELS = {
  low: '로우 앵글',
  eye_level: '눈높이',
  elevated: '높은 시점·창가',
  aerial: '항공·고지대',
  unknown: '미확인',
};

const degreeText = n => `${h(n)}°`;
const sourceBadge = src => {
  const key = SOURCE_LABELS[src] ? src : 'unknown';
  return `<span class="source-badge source-${key}">${SOURCE_LABELS[key]}</span>`;
};

function formatDateTimeShort(iso) {
  if (!iso) return '';
  return iso.replace('T', ' ').replace(/(\+\d{2}:\d{2})$/, ' ($1)');
}

function formatExposure(o) {
  const parts = [];
  if (Number.isFinite(o.f_number)) parts.push(`f/${o.f_number}`);
  if (o.shutter) parts.push(o.shutter);
  if (Number.isFinite(o.iso)) parts.push(`ISO ${o.iso}`);
  if (Number.isFinite(o.exposure_bias) && o.exposure_bias !== 0) {
    parts.push(`${o.exposure_bias > 0 ? '+' : ''}${o.exposure_bias} EV`);
  }
  return parts.join(' · ');
}

function formatDistance(meters) {
  if (!Number.isFinite(meters)) return '';
  return meters >= 1000 ? `${(meters / 1000).toFixed(2)}km` : `${Number(meters.toFixed(1))}m`;
}

export function photographerSpecs(e) {
  const o = e.optics || {};
  const p = e.camera_pov || {};
  const l = e.lighting || {};

  // 1. Optics & Focal Length
  const focalParts = [];
  if (Number.isFinite(o.focal_35mm)) focalParts.push(`환산 ${o.focal_35mm}mm`);
  if (Number.isFinite(o.focal_mm)) focalParts.push(`실초점 ${o.focal_mm}mm`);
  if (Number.isFinite(o.digital_zoom) && o.digital_zoom !== 1) focalParts.push(`디지털 ${o.digital_zoom}x`);
  const fovParts = [];
  if (Number.isFinite(e.hfov)) fovParts.push(`수평 ${e.hfov}°`);
  if (Number.isFinite(o.vfov)) fovParts.push(`수직 ${o.vfov}°`);
  const frameInfo = [
    o.aspect_ratio,
    Array.isArray(o.image_size) ? `${o.image_size[0]}×${o.image_size[1]}` : '',
  ].filter(Boolean).join(' · ');
  const lensPrimary = focalParts.length ? focalParts.join(' · ') : (fovParts.length ? fovParts.join(' / ') : '원본 화각 미확인');
  const lensSub = [
    o.camera || o.lens_model ? [o.camera, o.lens_model].filter(Boolean).join(' · ') : '',
    focalParts.length && fovParts.length ? `시야각 ${fovParts.join(' / ')}` : '',
    frameInfo ? `프레임 ${frameInfo}` : '',
    o.note,
  ].filter(Boolean).join(' / ') || 'EXIF 메타데이터가 없어 초점거리와 렌즈를 확인할 수 없습니다.';

  // 2. Exposure (Aperture / Shutter / ISO)
  const expText = formatExposure(o);
  const expSource = expText ? (o.source === 'exif' ? 'exif' : o.source || 'visual') : 'unknown';
  const expPrimary = expText || '미확인 (EXIF 없음)';
  const expSub = expText
    ? (o.source === 'exif'
      ? `원본 사진 EXIF 기록${Number.isFinite(o.exposure_bias) && o.exposure_bias === 0 ? ' · 노출 보정 0.0 EV' : ''}`
      : '기하·시각 참고값입니다.')
    : '조리개·셔터·ISO 메타데이터가 남아 있지 않습니다. 현장 광량과 심도에 맞춰 설정하세요.';

  // 3. Camera POV (Viewpoint, Pitch, Elevation, Distance)
  const povPrimary = p.viewpoint_label || (p.viewpoint_level && p.viewpoint_level !== 'unknown' ? VIEWPOINT_LABELS[p.viewpoint_level] : '시점 상세 미확정');
  const povMetrics = [];
  if (Number.isFinite(p.elevation_m)) {
    const eleTag = p.elevation_source === 'exif' ? 'EXIF 고도' : 'DEM 고도';
    povMetrics.push(`${eleTag} ${p.elevation_m}m`);
  }
  if (Number.isFinite(p.height_agl_m)) povMetrics.push(`지상 약 ${p.height_agl_m}m`);
  if (Number.isFinite(p.pitch_deg)) povMetrics.push(`피치 ${p.pitch_deg > 0 ? '+' : ''}${p.pitch_deg}°`);
  if (Number.isFinite(p.roll_deg) && Math.abs(p.roll_deg) >= 0.5) povMetrics.push(`롤 ${p.roll_deg}°`);
  if (Number.isFinite(p.target_distance_m)) povMetrics.push(`주요 피사체 약 ${formatDistance(p.target_distance_m)}`);
  const povSub = [povMetrics.join(' · '), p.slope_note, p.distance_basis].filter(Boolean).join(' / ') || '정확한 촬영 높이·피치는 현장 확인이 필요합니다.';
  const povSource = p.source && p.source !== 'unknown'
    ? p.source
    : (p.elevation_source && p.elevation_source !== 'unknown' ? p.elevation_source : 'unknown');

  // 4. Capture Time & Solar Lighting
  const lightPrimary = l.captured_at
    ? `${formatDateTimeShort(l.captured_at)}${l.light_type ? ` · ${l.light_type}` : ''}`
    : (l.light_type || (l.golden_evening ? `저녁 골든아워 ${l.golden_evening}` : '원본 촬영 시각 미확인'));
  const lightMeta = [];
  if (Number.isFinite(l.sun_azimuth) && Number.isFinite(l.sun_elevation)) {
    lightMeta.push(`당시 태양 방위 ${l.sun_azimuth}° · 고도 ${l.sun_elevation}°`);
  }
  if (l.plan_date && (l.sunrise || l.sunset)) {
    lightMeta.push(`${l.plan_date} 일출 ${l.sunrise || '-'} / 일몰 ${l.sunset || '-'}`);
  }
  if (l.golden_morning || l.golden_evening) {
    lightMeta.push(`골든아워 ${[l.golden_morning && `오전 ${l.golden_morning}`, l.golden_evening && `오후 ${l.golden_evening}`].filter(Boolean).join(' · ')}`);
  }
  if (l.blue_evening) lightMeta.push(`저녁 블루아워 ${l.blue_evening}`);
  if (l.recommended_window) lightMeta.push(l.recommended_window);
  const lightSub = lightMeta.join(' / ') || '촬영 시각 메타데이터가 없습니다. 아래 일조 계산기에서 원하는 날짜의 빛 각도를 확인하세요.';
  const lightSource = l.source && l.source !== 'unknown' ? l.source : (l.capture_time_source || 'unknown');

  const hasCoords = Number.isFinite(e.lat) && Number.isFinite(e.lon);
  const defaultDate = l.plan_date || (l.captured_at ? l.captured_at.slice(0, 10) : new Date().toISOString().slice(0, 10));

  return `<div class="photo-specs">
    <div class="photo-specs-head">
      <strong>촬영 광학·시점·빛 정보</strong>
      <small>EXIF 확인값과 기하·태양 계산값을 구분해 표시합니다.</small>
    </div>
    <div class="photo-specs-grid">
      <div class="photo-spec-card">
        <div class="photo-spec-top"><small>화각 · 렌즈</small>${sourceBadge(o.source)}</div>
        <b>${h(lensPrimary)}</b>
        <p>${h(lensSub)}</p>
      </div>
      <div class="photo-spec-card">
        <div class="photo-spec-top"><small>조리개 · 셔터 · ISO</small>${sourceBadge(expSource)}</div>
        <b>${h(expPrimary)}</b>
        <p>${h(expSub)}</p>
      </div>
      <div class="photo-spec-card">
        <div class="photo-spec-top"><small>촬영 시점 (POV)</small>${sourceBadge(povSource)}</div>
        <b>${h(povPrimary)}</b>
        <p>${h(povSub)}</p>
      </div>
      <div class="photo-spec-card">
        <div class="photo-spec-top"><small>촬영 시각 · 태양 · 골든아워</small>${sourceBadge(lightSource)}</div>
        <b>${h(lightPrimary)}</b>
        <p>${h(lightSub)}</p>
        ${hasCoords ? `<div class="sun-planner-inline" data-sun-planner data-lat="${e.lat}" data-lon="${e.lon}" data-heading="${Number.isFinite(e.heading) ? e.heading : ''}" data-tz="${Number.isFinite(l.tz_offset_min) ? l.tz_offset_min : ''}">
          <label><span>날짜별 일조 조회</span><input type="date" data-sun-date value="${h(defaultDate)}" aria-label="일조 계산 날짜"></label>
          <div class="sun-planner-output" data-sun-output></div>
        </div>` : ''}
      </div>
    </div>
  </div>`;
}

export function researchDetails(e) {
  const levels = e.confidence_levels || {};
  const degree = n => (Number.isFinite(n) ? `${n}°` : '미산정');
  const type = { camera: '확인된 촬영점', camera_estimate: '추정 촬영점', landmark: '장소 대표점', region: '지역 참고점', unknown: '좌표 유형 미확인' }[e.coordinate_type] || '좌표 유형 미확인';
  const labels = { city: '도시', area: '지역·장소', road: '도로·진입로', camera: '정확한 촬영점' };
  return `<section class="research-details"><div class="research-metrics"><div><small>위치 유형</small><b>${type}</b></div><div><small>위치 추정 반경</small><b>${Number.isFinite(e.radius_m) ? '약 ' + h(e.radius_m) + 'm' : '미산정'}</b></div><div><small>촬영 방위각</small><b>${degree(e.heading)}</b></div><div><small>수평 시야각</small><b>${degree(e.hfov)}</b></div></div>${photographerSpecs(e)}${overlay(e)}<div class="research-basis"><p><b>반경 근거</b> ${h(e.radius_basis || '산정 근거가 기록되지 않았습니다.')}</p><p><b>방향 근거</b> ${h(e.heading_basis || '산정 근거가 기록되지 않았습니다.')}</p><small>위치 추정 반경은 통계적 신뢰구간을 뜻하지 않습니다. 방위각은 진북 0°에서 시계방향, 시야각은 부채꼴의 폭입니다.</small></div><table class="research-table"><thead><tr><th>확인 범위</th><th>신뢰도</th><th>판단 근거</th></tr></thead><tbody>${Object.entries(labels).map(([k, label]) => `<tr><td>${label}</td><td>${({ high: '높음', medium: '중간', low: '낮음' })[levels[k]?.level] || '미평가'}</td><td>${h(levels[k]?.reason || '단계별 평가가 기록되지 않았습니다.')}</td></tr>`).join('')}</tbody></table>${e.quality ? `<div class="research-audit"><b>검증 확인</b>${Object.entries(e.quality.checks || {}).map(([k, v]) => `<p>${v.validated ? '✓' : '!'} ${({ street_view: '거리사진 대조', image_match: '이미지 후보 순위화', geometry: '기하 검증' })[k]} · ${h(v.summary)}</p>`).join('')}${e.quality.warnings.length ? '<p>추가 확인 항목 ' + e.quality.warnings.length + '개 · 아래 확인사항을 참고하세요.</p>' : ''}</div>` : ''}</section>`;
}

export function overlay(e) {
  const m = e.map_image;
  if (!m || !imageURL(m.url) || !['camera', 'camera_estimate'].includes(e.coordinate_type) || !Number.isFinite(e.lat) || !Number.isFinite(e.lon)) return '';
  if (!Array.isArray(m.size) || m.size.some(n => !Number.isFinite(n) || n <= 0) || !Array.isArray(m.origin_tile) || !Number.isFinite(m.zoom) || Math.abs(e.lat) > 85.0511) return '';
  const [w, height] = m.size, world = 256 * 2 ** m.zoom, lat = e.lat * Math.PI / 180;
  const x = (e.lon + 180) / 360 * world - m.origin_tile[0] * 256, y = (1 - Math.asinh(Math.tan(lat)) / Math.PI) / 2 * world - m.origin_tile[1] * 256;
  const meters = 40075016.6856 * Math.cos(lat) / world, r = Number.isFinite(e.radius_m) ? e.radius_m / meters : null;
  if (x < 0 || x > w || y < 0 || y > height) return '<p class="notice">지도 범위 밖의 촬영점입니다. 지도 이미지의 범위를 확인해 주세요.</p>';
  const reach = Math.min(w, height) * 0.32, angle = e.heading, fov = e.hfov;
  const p = a => [x + reach * Math.sin(a * Math.PI / 180), y - reach * Math.cos(a * Math.PI / 180)];
  let cone = '';
  if (Number.isFinite(angle)) {
    const end = p(angle);
    cone = `<path d="M ${x} ${y} L ${end[0]} ${end[1]}" stroke="#ffe467" stroke-width="3"/>`;
    if (Number.isFinite(fov) && fov > 0 && fov < 180) {
      const a = p(angle - fov / 2), b = p(angle + fov / 2);
      cone += `<path d="M ${x} ${y} L ${a[0]} ${a[1]} A ${reach} ${reach} 0 0 1 ${b[0]} ${b[1]} Z" fill="#ffe46744" stroke="#ffe467"/>`;
    }
  }
  const size = Array.isArray(e.optics?.image_size) ? e.optics.image_size : [3, 2];
  const defaultDate = e.lighting?.plan_date || (e.lighting?.captured_at ? e.lighting.captured_at.slice(0, 10) : new Date().toISOString().slice(0, 10));
  const tz = Number.isFinite(e.lighting?.tz_offset_min) ? e.lighting.tz_offset_min : guessTimezoneOffsetMinutes(e.lat, e.lon);
  let defaultMinutes = 900;
  if (e.lighting?.captured_at) {
    const parsed = parseDateTimeWithOffset(e.lighting.captured_at, tz);
    if (parsed) {
      const [hh, mm] = parsed.timeStr.split(':').map(Number);
      defaultMinutes = Math.max(300, Math.min(1260, hh * 60 + mm));
    }
  }
  const controls = Number.isFinite(angle)
    ? `<div class="overlay-controls no-print" data-overlay-controls>
        <div class="overlay-control-row">
          <span class="overlay-control-label">화각 시뮬레이터</span>
          <div class="overlay-lens-group" role="group" aria-label="렌즈 화각 시뮬레이션">
            <button type="button" data-sim-mm="original" class="active">${Number.isFinite(fov) ? `조사값 (${fov}°)` : '방향선만'}</button>
            <button type="button" data-sim-mm="24">24mm</button>
            <button type="button" data-sim-mm="35">35mm</button>
            <button type="button" data-sim-mm="50">50mm</button>
            <button type="button" data-sim-mm="85">85mm</button>
          </div>
          <span class="overlay-readout mono" data-fov-readout>${Number.isFinite(fov) ? `수평 ${fov}°` : '화각 미산정'}</span>
        </div>
        <div class="overlay-control-row">
          <label class="overlay-sun-toggle"><input type="checkbox" data-sun-toggle> 태양 광선 표시</label>
          <input type="date" data-overlay-date value="${h(defaultDate)}" aria-label="태양 광선 기준 날짜">
          <input type="range" data-overlay-time min="300" max="1260" step="15" value="${defaultMinutes}" aria-label="태양 광선 시각">
          <span class="overlay-readout mono" data-sun-readout>${formatMinutes(defaultMinutes)}</span>
        </div>
      </div>`
    : '';
  return `<figure class="camera-overlay" data-cx="${x.toFixed(2)}" data-cy="${y.toFixed(2)}" data-reach="${reach.toFixed(2)}" data-heading="${Number.isFinite(angle) ? angle : ''}" data-hfov="${Number.isFinite(fov) ? fov : ''}" data-lat="${e.lat}" data-lon="${e.lon}" data-tz="${tz}" data-img-w="${size[0]}" data-img-h="${size[1]}"><svg width="${w}" height="${height}" viewBox="0 0 ${w} ${height}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="촬영 후보점과 추정 반경·방향"><image href="${h(m.url)}" width="${w}" height="${height}"/>${r !== null ? `<circle cx="${x}" cy="${y}" r="${r}" fill="#6fbdff22" stroke="#8ad2ff" stroke-dasharray="7 5" stroke-width="2"/>` : ''}<g data-fov-layer>${cone}</g><g data-sun-layer></g><circle cx="${x}" cy="${y}" r="6" fill="#e75145" stroke="white" stroke-width="2"/></svg>${controls}<figcaption>촬영 후보점 · ${Number.isFinite(e.radius_m) ? '파란 점선: 위치 추정 반경 약 ' + h(e.radius_m) + 'm' : '반경 미산정'} · ${Number.isFinite(angle) ? '노란 선: 방위각 ' + degreeText(angle) : '방향 미산정'}${Number.isFinite(fov) ? ' · 부채꼴 시야각 ' + degreeText(fov) : ''}<br>실제 위성영상 위 표시 · 촬영점·반경·시야는 조사 결과에 따른 추정이며 영상 촬영일과 출처는 근거 자료를 참고하세요.${m.attribution ? `<br>${h(m.attribution)}` : ''}</figcaption></figure>`;
}

export function mountReportTools(root) {
  if (!root) return;
  const svgNS = 'http://www.w3.org/2000/svg';

  // 1. Mount date-based solar schedule helper in lighting card
  for (const box of root.querySelectorAll('[data-sun-planner]')) {
    const lat = Number(box.dataset.lat), lon = Number(box.dataset.lon);
    const tz = box.dataset.tz !== '' ? Number(box.dataset.tz) : guessTimezoneOffsetMinutes(lat, lon);
    const dateInput = box.querySelector('[data-sun-date]');
    const output = box.querySelector('[data-sun-output]');
    const update = () => {
      const sched = solarSchedule(lat, lon, dateInput.value, tz);
      if (!sched) { output.textContent = ''; return; }
      const parts = [
        sched.sunrise && `일출 ${sched.sunrise}`,
        sched.golden_morning && `오전 골든 ${sched.golden_morning}`,
        sched.golden_evening && `오후 골든 ${sched.golden_evening}`,
        sched.sunset && `일몰 ${sched.sunset}`,
        sched.blue_evening && `블루 ${sched.blue_evening}`,
      ].filter(Boolean);
      output.textContent = parts.join(' · ');
    };
    dateInput.addEventListener('change', update);
    update();
  }

  // 2. Mount interactive lens FOV & Sun Ray simulator on real satellite overlay
  for (const fig of root.querySelectorAll('figure.camera-overlay')) {
    const controls = fig.querySelector('[data-overlay-controls]');
    if (!controls) continue;
    const cx = Number(fig.dataset.cx), cy = Number(fig.dataset.cy), reach = Number(fig.dataset.reach);
    const heading = Number(fig.dataset.heading);
    const baseHfov = fig.dataset.hfov !== '' ? Number(fig.dataset.hfov) : null;
    const lat = Number(fig.dataset.lat), lon = Number(fig.dataset.lon), tz = Number(fig.dataset.tz);
    const imgW = Number(fig.dataset.imgW) || 3, imgH = Number(fig.dataset.imgH) || 2;
    const fovLayer = fig.querySelector('[data-fov-layer]');
    const sunLayer = fig.querySelector('[data-sun-layer]');
    const fovReadout = controls.querySelector('[data-fov-readout]');
    const sunToggle = controls.querySelector('[data-sun-toggle]');
    const dateInput = controls.querySelector('[data-overlay-date]');
    const timeInput = controls.querySelector('[data-overlay-time]');
    const sunReadout = controls.querySelector('[data-sun-readout]');

    const polar = (deg, dist) => [cx + dist * Math.sin(deg * Math.PI / 180), cy - dist * Math.cos(deg * Math.PI / 180)];

    const drawFov = (fovDeg, simulatedLabel = '') => {
      fovLayer.innerHTML = '';
      const end = polar(heading, reach);
      const ray = document.createElementNS(svgNS, 'path');
      ray.setAttribute('d', `M ${cx} ${cy} L ${end[0]} ${end[1]}`);
      ray.setAttribute('stroke', '#ffe467');
      ray.setAttribute('stroke-width', '3');
      fovLayer.appendChild(ray);
      if (Number.isFinite(fovDeg) && fovDeg > 0 && fovDeg < 180) {
        const a = polar(heading - fovDeg / 2, reach);
        const b = polar(heading + fovDeg / 2, reach);
        const wedge = document.createElementNS(svgNS, 'path');
        wedge.setAttribute('d', `M ${cx} ${cy} L ${a[0]} ${a[1]} A ${reach} ${reach} 0 0 1 ${b[0]} ${b[1]} Z`);
        wedge.setAttribute('fill', simulatedLabel ? '#a3e63544' : '#ffe46744');
        wedge.setAttribute('stroke', simulatedLabel ? '#d9f99d' : '#ffe467');
        wedge.setAttribute('stroke-width', '2');
        fovLayer.appendChild(wedge);
        fovReadout.textContent = simulatedLabel ? `${simulatedLabel} (수평 ${fovDeg}°)` : `수평 ${fovDeg}°`;
      } else {
        fovReadout.textContent = '화각 미산정';
      }
    };

    const drawSun = () => {
      sunLayer.innerHTML = '';
      const mins = Number(timeInput.value);
      const pos = sunAtLocalMinutes(lat, lon, dateInput.value, mins, tz);
      if (!pos) { sunReadout.textContent = formatMinutes(mins); return; }
      const rel = lightingRelation(pos.azimuth, pos.elevation, heading);
      sunReadout.textContent = `${formatMinutes(mins)} · 태양 ${pos.azimuth}° (고도 ${pos.elevation}°) · ${rel.label}`;
      if (!sunToggle.checked) return;
      const sunReach = reach * 0.88;
      const [sx, sy] = polar(pos.azimuth, sunReach);
      const line = document.createElementNS(svgNS, 'line');
      line.setAttribute('x1', sx.toFixed(1));
      line.setAttribute('y1', sy.toFixed(1));
      line.setAttribute('x2', cx.toFixed(1));
      line.setAttribute('y2', cy.toFixed(1));
      line.setAttribute('stroke', pos.elevation <= 0 ? '#93c5fd' : '#fbbf24');
      line.setAttribute('stroke-width', '3');
      line.setAttribute('stroke-dasharray', '8 6');
      sunLayer.appendChild(line);
      const dot = document.createElementNS(svgNS, 'circle');
      dot.setAttribute('cx', sx.toFixed(1));
      dot.setAttribute('cy', sy.toFixed(1));
      dot.setAttribute('r', '10');
      dot.setAttribute('fill', pos.elevation <= 0 ? '#60a5fa' : '#f59e0b');
      dot.setAttribute('stroke', '#ffffff');
      dot.setAttribute('stroke-width', '2.5');
      sunLayer.appendChild(dot);
    };

    for (const btn of controls.querySelectorAll('[data-sim-mm]')) {
      btn.addEventListener('click', () => {
        controls.querySelectorAll('[data-sim-mm]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const val = btn.dataset.simMm;
        if (val === 'original') {
          drawFov(baseHfov, '');
        } else {
          const mm = Number(val);
          const derived = fovFromEquivFocal(mm, imgW, imgH);
          drawFov(derived?.hfov ?? null, `${mm}mm 시뮬레이션`);
        }
      });
    }

    sunToggle.addEventListener('change', drawSun);
    dateInput.addEventListener('change', drawSun);
    timeInput.addEventListener('input', () => {
      if (!sunToggle.checked) sunToggle.checked = true;
      drawSun();
    });
    drawSun();
  }
}
