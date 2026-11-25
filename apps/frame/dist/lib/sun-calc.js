// Pure-JS NOAA Meeus solar position, golden/blue hour schedule, optics FOV helpers, and GPX export.
// Shared by Node.js backend and browser UI with zero external dependencies.

const RAD = Math.PI / 180;
const DEG = 180 / Math.PI;

function sunCore(utcDate) {
  const jd = utcDate.getTime() / 86400000 + 2440587.5;
  const t = (jd - 2451545) / 36525;
  const l0 = (280.46646 + t * (36000.76983 + t * 0.0003032)) % 360;
  const m = 357.52911 + t * (35999.05029 - 0.0001537 * t);
  const e = 0.016708634 - t * (0.000042037 + 0.0000001267 * t);
  const c =
    Math.sin(m * RAD) * (1.914602 - t * (0.004817 + 0.000014 * t)) +
    Math.sin(2 * m * RAD) * (0.019993 - 0.000101 * t) +
    Math.sin(3 * m * RAD) * 0.000289;
  const appLong = l0 + c - 0.00569 - 0.00478 * Math.sin((125.04 - 1934.136 * t) * RAD);
  const obliq0 = 23 + (26 + (21.448 - t * (46.815 + t * (0.00059 - t * 0.001813))) / 60) / 60;
  const obliq = obliq0 + 0.00256 * Math.cos((125.04 - 1934.136 * t) * RAD);
  const decl = Math.asin(Math.sin(obliq * RAD) * Math.sin(appLong * RAD)) * DEG;
  const y = Math.tan((obliq / 2) * RAD) ** 2;
  const eqt =
    4 *
    DEG *
    (y * Math.sin(2 * l0 * RAD) -
      2 * e * Math.sin(m * RAD) +
      4 * e * y * Math.sin(m * RAD) * Math.cos(2 * l0 * RAD) -
      0.5 * y * y * Math.sin(4 * l0 * RAD) -
      1.25 * e * e * Math.sin(2 * m * RAD));
  return { decl, eqt };
}

function refraction(h) {
  if (h > 85) return 0;
  const te = Math.tan(h * RAD);
  let r;
  if (h > 5) r = 58.1 / te - 0.07 / te ** 3 + 0.000086 / te ** 5;
  else if (h > -0.575) r = 1735 + h * (-518.2 + h * (103.4 + h * (-12.79 + h * 0.711)));
  else r = -20.772 / te;
  return r / 3600;
}

export function sunPosition(lat, lon, utcDate, useRefraction = true) {
  if (!Number.isFinite(lat) || !Number.isFinite(lon) || !(utcDate instanceof Date) || Number.isNaN(utcDate.getTime())) {
    return null;
  }
  const { decl, eqt } = sunCore(utcDate);
  const minutes =
    utcDate.getUTCHours() * 60 +
    utcDate.getUTCMinutes() +
    utcDate.getUTCSeconds() / 60 +
    utcDate.getUTCMilliseconds() / 60000;
  const tst = (((minutes + eqt + 4 * lon) % 1440) + 1440) % 1440;
  const ha = tst / 4 < 0 ? tst / 4 + 180 : tst / 4 - 180;
  const cz =
    Math.sin(lat * RAD) * Math.sin(decl * RAD) +
    Math.cos(lat * RAD) * Math.cos(decl * RAD) * Math.cos(ha * RAD);
  const zen = Math.acos(Math.max(-1, Math.min(1, cz))) * DEG;
  let elevation = 90 - zen;
  const denom = Math.cos(lat * RAD) * Math.sin(zen * RAD);
  let azimuth = 180;
  if (Math.abs(denom) >= 1e-9) {
    const ca = Math.max(-1, Math.min(1, (Math.sin(lat * RAD) * Math.cos(zen * RAD) - Math.sin(decl * RAD)) / denom));
    azimuth = ha > 0 ? (Math.acos(ca) * DEG + 180) % 360 : (540 - Math.acos(ca) * DEG) % 360;
  }
  if (useRefraction) elevation += refraction(elevation);
  const shadowRatio = elevation <= 0 ? null : Number((1 / Math.tan(elevation * RAD)).toFixed(2));
  return {
    azimuth: Number(azimuth.toFixed(1)),
    elevation: Number(elevation.toFixed(1)),
    shadowRatio,
  };
}

export function guessTimezoneOffsetMinutes(lat, lon) {
  // Korea bounds -> exact KST (+09:00); otherwise approximate solar longitude offset in 60-min steps.
  if (Number.isFinite(lat) && Number.isFinite(lon) && lat >= 33 && lat <= 39.5 && lon >= 124 && lon <= 132) return 540;
  if (!Number.isFinite(lon)) return 540;
  return Math.round(lon / 15) * 60;
}

export function formatMinutes(totalMin) {
  const m = ((Math.round(totalMin) % 1440) + 1440) % 1440;
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
}

export function parseDateTimeWithOffset(value, fallbackOffsetMin = 540) {
  if (!value || typeof value !== 'string') return null;
  const clean = value.trim().replace(/^(\d{4}):(\d{2}):(\d{2})/, '$1-$2-$3').replace(' ', 'T');
  const m = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2})(?::(\d{2}))?)?(Z|[+-]\d{2}:?\d{2})?$/.exec(clean);
  if (!m) return null;
  const [, yr, mo, dy, hh = '12', mm = '00', ss = '00', tz] = m;
  let offsetMin = fallbackOffsetMin;
  if (tz === 'Z') offsetMin = 0;
  else if (tz) {
    const sign = tz.startsWith('-') ? -1 : 1;
    const digits = tz.slice(1).replace(':', '');
    offsetMin = sign * (Number(digits.slice(0, 2)) * 60 + Number(digits.slice(2, 4)));
  }
  const utcMs = Date.UTC(Number(yr), Number(mo) - 1, Number(dy), Number(hh), Number(mm), Number(ss)) - offsetMin * 60000;
  return { utcDate: new Date(utcMs), dateStr: `${yr}-${mo}-${dy}`, timeStr: `${hh}:${mm}`, offsetMin };
}

export function lightingRelation(sunAzimuth, sunElevation, cameraHeading) {
  if (!Number.isFinite(sunElevation)) return { phase: '미확인', relation: '', label: '미확인' };
  const phase =
    sunElevation < -6 ? '야간' :
    sunElevation < 0 ? '블루아워' :
    sunElevation <= 10 ? '골든아워' : '주간';
  if (sunElevation < -6) return { phase, relation: '야간', label: '야간 (태양 지평선 아래)' };
  if (sunElevation < 0) return { phase, relation: '박명', label: '블루아워 (박명)' };
  if (!Number.isFinite(cameraHeading) || !Number.isFinite(sunAzimuth)) {
    return { phase, relation: '', label: phase };
  }
  const diff = Math.abs(((sunAzimuth - cameraHeading + 540) % 360) - 180);
  const relation =
    diff <= 30 ? '역광' :
    diff <= 65 ? '반역광' :
    diff <= 115 ? '측사광' :
    diff <= 150 ? '사광' : '순광';
  return { phase, relation, label: phase === '주간' ? relation : `${phase} · ${relation}` };
}

export function solarSchedule(lat, lon, dateStr, tzOffsetMin = guessTimezoneOffsetMinutes(lat, lon)) {
  if (!Number.isFinite(lat) || !Number.isFinite(lon) || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr || '')) return null;
  const [yr, mo, dy] = dateStr.split('-').map(Number);
  const baseUtcMs = Date.UTC(yr, mo - 1, dy, 0, 0, 0) - tzOffsetMin * 60000;
  const samples = [];
  for (let m = 0; m <= 1440; m += 2) {
    const pos = sunPosition(lat, lon, new Date(baseUtcMs + m * 60000));
    samples.push({ m, az: pos.azimuth, el: pos.elevation });
  }
  let sunrise = null, sunset = null, maxEl = -90, noonMin = 720;
  for (let i = 1; i < samples.length; i++) {
    const prev = samples[i - 1], cur = samples[i];
    if (cur.el > maxEl) { maxEl = cur.el; noonMin = cur.m; }
    if (sunrise === null && prev.el < -0.5 && cur.el >= -0.5) sunrise = cur.m;
    if (prev.el >= -0.5 && cur.el < -0.5) sunset = cur.m;
  }
  const range = (minEl, maxE, half) => {
    const hits = samples.filter(s => (half === 'am' ? s.m <= noonMin : s.m >= noonMin) && s.el >= minEl && s.el <= maxE);
    return hits.length ? `${formatMinutes(hits[0].m)}–${formatMinutes(hits.at(-1).m)}` : '';
  };
  return {
    date: dateStr,
    tz_offset_min: tzOffsetMin,
    sunrise: sunrise !== null ? formatMinutes(sunrise) : '',
    sunset: sunset !== null ? formatMinutes(sunset) : '',
    sunrise_azimuth: sunrise !== null ? samples[Math.floor(sunrise / 2)].az : null,
    sunset_azimuth: sunset !== null ? samples[Math.floor(sunset / 2)].az : null,
    golden_morning: range(0, 10, 'am'),
    golden_evening: range(0, 10, 'pm'),
    blue_morning: range(-6, 0, 'am'),
    blue_evening: range(-6, 0, 'pm'),
    noon_elevation: Number(maxEl.toFixed(1)),
  };
}

export function sunAtLocalMinutes(lat, lon, dateStr, localMinutes, tzOffsetMin = guessTimezoneOffsetMinutes(lat, lon)) {
  if (!Number.isFinite(lat) || !Number.isFinite(lon) || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr || '')) return null;
  const [yr, mo, dy] = dateStr.split('-').map(Number);
  const utcMs = Date.UTC(yr, mo - 1, dy, 0, 0, 0) + (localMinutes - tzOffsetMin) * 60000;
  return sunPosition(lat, lon, new Date(utcMs));
}

export function aspectRatioLabel(width, height) {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) return '';
  const r = width / height;
  const presets = [
    [16 / 9, '16:9'], [9 / 16, '9:16'], [3 / 2, '3:2'], [2 / 3, '2:3'],
    [4 / 3, '4:3'], [3 / 4, '3:4'], [4 / 5, '4:5'], [5 / 4, '5:4'],
    [1, '1:1'], [21 / 9, '21:9'], [2, '2:1'], [0.5, '1:2'],
  ];
  for (const [target, label] of presets) {
    if (Math.abs(r - target) / target < 0.045) return label;
  }
  return width >= height ? `${(width / height).toFixed(2)}:1` : `1:${(height / width).toFixed(2)}`;
}

export function fovFromEquivFocal(focal35mm, width = 3, height = 2) {
  if (!Number.isFinite(focal35mm) || focal35mm <= 0) return null;
  const w = Number.isFinite(width) && width > 0 ? width : 3;
  const h = Number.isFinite(height) && height > 0 ? height : 2;
  // Standard 35mm full-frame diagonal = sqrt(36^2 + 24^2) = 43.2666 mm.
  const diag = Math.hypot(w, h);
  const sensorW = 43.2666 * (w / diag);
  const sensorH = 43.2666 * (h / diag);
  const hfov = 2 * Math.atan(sensorW / (2 * focal35mm)) * DEG;
  const vfov = 2 * Math.atan(sensorH / (2 * focal35mm)) * DEG;
  return { hfov: Number(hfov.toFixed(1)), vfov: Number(vfov.toFixed(1)) };
}

export function equivFocalFromHfov(hfov, width = 3, height = 2) {
  if (!Number.isFinite(hfov) || hfov <= 1 || hfov >= 179) return null;
  const w = Number.isFinite(width) && width > 0 ? width : 3;
  const h = Number.isFinite(height) && height > 0 ? height : 2;
  const diag = Math.hypot(w, h);
  const sensorW = 43.2666 * (w / diag);
  return Math.round(sensorW / (2 * Math.tan((hfov / 2) * RAD)));
}

export function formatShutter(seconds) {
  if (!Number.isFinite(seconds) || seconds <= 0) return '';
  if (seconds >= 0.5) return `${Number(seconds.toFixed(seconds >= 10 ? 0 : 1))}s`;
  return `1/${Math.round(1 / seconds)}s`;
}

export function formatGpx(report, request = {}) {
  const xml = s => String(s || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[c]));
  const name = report.place_name || report.title || request.title || 'FRAME Location';
  const bits = [];
  if (Number.isFinite(report.heading)) bits.push(`방위각 ${report.heading}°`);
  if (Number.isFinite(report.hfov)) bits.push(`수평 시야각 ${report.hfov}°`);
  if (Number.isFinite(report.radius_m)) bits.push(`추정 반경 ±${report.radius_m}m`);
  if (report.optics?.focal_35mm) bits.push(`환산 ${report.optics.focal_35mm}mm`);
  if (report.camera_pov?.viewpoint_label) bits.push(`시점: ${report.camera_pov.viewpoint_label}`);
  if (report.lighting?.golden_evening) bits.push(`저녁 골든아워 ${report.lighting.golden_evening}`);
  const desc = [bits.join(' · '), report.summary].filter(Boolean).join('\n');
  const ele = Number.isFinite(report.camera_pov?.elevation_m) ? `\n    <ele>${report.camera_pov.elevation_m}</ele>` : '';
  return `<?xml version="1.0" encoding="UTF-8"?>\n<gpx version="1.1" creator="FRAME Location Research" xmlns="http://www.topografix.com/GPX/1/1">\n  <wpt lat="${report.lat}" lon="${report.lon}">${ele}\n    <name>${xml(name)}</name>\n    <desc>${xml(desc)}</desc>\n  </wpt>\n</gpx>\n`;
}
