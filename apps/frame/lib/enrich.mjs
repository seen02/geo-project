import { spawn } from 'node:child_process';
import path from 'node:path';
import {
  aspectRatioLabel,
  equivFocalFromHfov,
  formatShutter,
  fovFromEquivFocal,
  guessTimezoneOffsetMinutes,
  lightingRelation,
  parseDateTimeWithOffset,
  solarSchedule,
  sunPosition,
} from '../dist/lib/sun-calc.js';

export function readPhotoExif(imagePath, config) {
  return new Promise(resolve => {
    const script = path.join(config.helpers, 'photo_exif.py');
    const child = spawn(config.uv, ['run', script, imagePath], {
      env: config.env,
      windowsHide: true,
      shell: false,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let stdout = '';
    child.stdout.setEncoding('utf8');
    child.stdout.on('data', chunk => { stdout += chunk; });
    child.stderr.resume();
    const timer = setTimeout(() => child.kill(), 20000);
    child.on('error', () => { clearTimeout(timer); resolve(null); });
    child.on('close', code => {
      clearTimeout(timer);
      if (code !== 0) return resolve(null);
      try {
        const parsed = JSON.parse(stdout.trim());
        resolve(parsed?.ok ? parsed : null);
      } catch {
        resolve(null);
      }
    });
  });
}

export function applyPhotographerEnrichment(report, exif, request = {}) {
  const optics = { ...(report.optics || {}) };
  const pov = { ...(report.camera_pov || {}) };
  const lighting = { ...(report.lighting || {}) };

  if (exif?.ok) {
    if (Array.isArray(exif.image_size) && exif.image_size.length === 2) {
      const [w, h] = exif.image_size;
      optics.image_size = [w, h];
      optics.aspect_ratio = optics.aspect_ratio || aspectRatioLabel(w, h);
      optics.orientation = w > h ? 'landscape' : h > w ? 'portrait' : 'square';
    }
    if (exif.has_exif) {
      if (exif.camera) optics.camera = exif.camera;
      if (exif.lens_model) optics.lens_model = exif.lens_model;
      if (Number.isFinite(exif.focal_mm)) optics.focal_mm = exif.focal_mm;
      if (Number.isFinite(exif.focal_35mm)) optics.focal_35mm = exif.focal_35mm;
      if (Number.isFinite(exif.digital_zoom)) optics.digital_zoom = exif.digital_zoom;
      if (Number.isFinite(exif.f_number)) optics.f_number = exif.f_number;
      if (Number.isFinite(exif.exposure_time)) {
        optics.exposure_time = exif.exposure_time;
        optics.shutter = exif.shutter || formatShutter(exif.exposure_time);
      }
      if (Number.isFinite(exif.iso)) optics.iso = exif.iso;
      if (Number.isFinite(exif.exposure_bias)) optics.exposure_bias = exif.exposure_bias;
      if (optics.camera || optics.focal_35mm || optics.f_number || optics.exposure_time || optics.iso) {
        optics.source = 'exif';
      }
      if (exif.captured_at) {
        lighting.captured_at = exif.captured_at;
        lighting.capture_time_source = 'exif';
      }
      if (Number.isFinite(exif.gps_altitude_m) && !Number.isFinite(pov.elevation_m)) {
        pov.elevation_m = exif.gps_altitude_m;
        pov.elevation_source = 'exif';
      }
    }
  }

  // Derive missing focal_35mm or vfov strictly from confirmed EXIF focal or geometry hfov.
  const [iw, ih] = Array.isArray(optics.image_size) && optics.image_size.length === 2 ? optics.image_size : [3, 2];
  if (Number.isFinite(optics.focal_35mm)) {
    const derived = fovFromEquivFocal(optics.focal_35mm, iw, ih);
    if (derived) {
      if (!Number.isFinite(optics.vfov)) optics.vfov = derived.vfov;
    }
  } else if (Number.isFinite(report.hfov)) {
    const equiv = equivFocalFromHfov(report.hfov, iw, ih);
    if (equiv) {
      optics.focal_35mm = equiv;
      if (!optics.source || optics.source === 'unknown') optics.source = 'geometry';
    }
    const vfov = Number((2 * Math.atan(Math.tan((report.hfov * Math.PI) / 360) * (ih / iw)) * (180 / Math.PI)).toFixed(1));
    if (Number.isFinite(vfov) && !Number.isFinite(optics.vfov)) optics.vfov = vfov;
  }

  // Compute NOAA solar position & schedule whenever verified/estimated coordinates exist.
  const hasCoords = Number.isFinite(report.lat) && Number.isFinite(report.lon);
  if (hasCoords) {
    const defaultTz = guessTimezoneOffsetMinutes(report.lat, report.lon);
    const parsedCapture = parseDateTimeWithOffset(lighting.captured_at, defaultTz);
    if (parsedCapture) {
      const pos = sunPosition(report.lat, report.lon, parsedCapture.utcDate);
      if (pos) {
        lighting.sun_azimuth = pos.azimuth;
        lighting.sun_elevation = pos.elevation;
        lighting.tz_offset_min = parsedCapture.offsetMin;
        const rel = lightingRelation(pos.azimuth, pos.elevation, report.heading);
        lighting.light_type = rel.label;
        if (!lighting.source || lighting.source === 'unknown') {
          lighting.source = lighting.capture_time_source === 'exif' ? 'exif' : 'sun_calc';
        }
      }
    }
    const planDate =
      (/^\d{4}-\d{2}-\d{2}$/.test(request.date || '') && request.date) ||
      (/^\d{4}-\d{2}-\d{2}$/.test(lighting.plan_date || '') && lighting.plan_date) ||
      parsedCapture?.dateStr ||
      '';
    if (planDate) {
      const tz = Number.isFinite(lighting.tz_offset_min) ? lighting.tz_offset_min : defaultTz;
      const sched = solarSchedule(report.lat, report.lon, planDate, tz);
      if (sched) {
        lighting.plan_date = sched.date;
        lighting.tz_offset_min = sched.tz_offset_min;
        lighting.sunrise = sched.sunrise;
        lighting.sunset = sched.sunset;
        lighting.golden_morning = sched.golden_morning;
        lighting.golden_evening = sched.golden_evening;
        lighting.blue_evening = sched.blue_evening;
        if (!lighting.source || lighting.source === 'unknown') lighting.source = 'sun_calc';
      }
    }
  }

  return { ...report, optics, camera_pov: pov, lighting };
}
