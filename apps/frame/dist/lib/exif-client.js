// Pure-JS browser/Node JPEG EXIF reader (zero dependencies) for instant photographer intake preview.
import { formatShutter } from './sun-calc.js';

const IFD0_TAGS = { 0x010f: 'make', 0x0110: 'model', 0x0112: 'orientation', 0x0131: 'software', 0x0132: 'datetime', 0x8769: 'exifIfd', 0x8825: 'gpsIfd' };
const EXIF_TAGS = {
  0x829a: 'exposure_time', 0x829d: 'f_number', 0x8827: 'iso', 0x9003: 'datetime_original',
  0x9011: 'offset_time_original', 0x9204: 'exposure_bias', 0x920a: 'focal_mm',
  0xa404: 'digital_zoom', 0xa405: 'focal_35mm', 0xa433: 'lens_make', 0xa434: 'lens_model',
};
const GPS_TAGS = { 1: 'latRef', 2: 'lat', 3: 'lonRef', 4: 'lon', 5: 'altRef', 6: 'alt', 17: 'dir' };

function readValue(view, tiffStart, entryOffset, le) {
  const type = view.getUint16(entryOffset + 2, le);
  const count = view.getUint32(entryOffset + 4, le);
  const sizes = { 1: 1, 2: 1, 3: 2, 4: 4, 5: 8, 7: 1, 9: 4, 10: 8 };
  const unit = sizes[type];
  if (!unit || count === 0 || count > 2048) return undefined;
  const total = unit * count;
  const valOffset = total <= 4 ? entryOffset + 8 : tiffStart + view.getUint32(entryOffset + 8, le);
  if (valOffset < 0 || valOffset + total > view.byteLength) return undefined;

  if (type === 2) {
    let s = '';
    for (let i = 0; i < count; i++) {
      const code = view.getUint8(valOffset + i);
      if (code === 0) break;
      s += String.fromCharCode(code);
    }
    return s.trim();
  }
  const readOne = idx => {
    const o = valOffset + idx * unit;
    if (type === 1 || type === 7) return view.getUint8(o);
    if (type === 3) return view.getUint16(o, le);
    if (type === 4) return view.getUint32(o, le);
    if (type === 9) return view.getInt32(o, le);
    if (type === 5) { const n = view.getUint32(o, le), d = view.getUint32(o + 4, le); return d ? n / d : null; }
    if (type === 10) { const n = view.getInt32(o, le), d = view.getInt32(o + 4, le); return d ? n / d : null; }
    return undefined;
  };
  if (count === 1) return readOne(0);
  const arr = [];
  for (let i = 0; i < count; i++) arr.push(readOne(i));
  return arr;
}

function readIfd(view, tiffStart, ifdRelOffset, le, tagMap) {
  const start = tiffStart + ifdRelOffset;
  if (start < tiffStart || start + 2 > view.byteLength) return {};
  const count = view.getUint16(start, le);
  const out = {};
  for (let i = 0; i < count; i++) {
    const off = start + 2 + i * 12;
    if (off + 12 > view.byteLength) break;
    const tag = view.getUint16(off, le);
    const key = tagMap[tag];
    if (!key) continue;
    const v = readValue(view, tiffStart, off, le);
    if (v !== undefined && v !== null && v !== '') out[key] = v;
  }
  return out;
}

function dmsToDeg(dms, ref) {
  if (!Array.isArray(dms) || dms.length < 3 || dms.some(v => !Number.isFinite(v))) return null;
  const val = dms[0] + dms[1] / 60 + dms[2] / 3600;
  return Number((ref === 'S' || ref === 'W' ? -val : val).toFixed(7));
}

export function parseJpegExif(arrayBuffer) {
  const view = new DataView(arrayBuffer);
  if (view.byteLength < 12 || view.getUint16(0, false) !== 0xffd8) return { hasExif: false };
  let offset = 2;
  while (offset + 4 < view.byteLength) {
    if (view.getUint8(offset) !== 0xff) break;
    const marker = view.getUint8(offset + 1);
    if (marker === 0xda || marker === 0xd9) break;
    const segLen = view.getUint16(offset + 2, false);
    if (segLen < 2 || offset + 2 + segLen > view.byteLength) break;
    if (marker === 0xe1 && offset + 10 <= view.byteLength) {
      const hdr = String.fromCharCode(
        view.getUint8(offset + 4), view.getUint8(offset + 5), view.getUint8(offset + 6), view.getUint8(offset + 7)
      );
      if (hdr === 'Exif') {
        const tiffStart = offset + 10;
        if (tiffStart + 8 > view.byteLength) return { hasExif: false };
        const endian = view.getUint16(tiffStart, false);
        const le = endian === 0x4949;
        if (!le && endian !== 0x4d4d) return { hasExif: false };
        const firstIfd = view.getUint32(tiffStart + 4, le);
        const ifd0 = readIfd(view, tiffStart, firstIfd, le, IFD0_TAGS);
        const exif = Number.isFinite(ifd0.exifIfd) ? readIfd(view, tiffStart, ifd0.exifIfd, le, EXIF_TAGS) : {};
        const gps = Number.isFinite(ifd0.gpsIfd) ? readIfd(view, tiffStart, ifd0.gpsIfd, le, GPS_TAGS) : {};
        const camera = [ifd0.make, ifd0.model].filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
        const lensModel = [exif.lens_make, exif.lens_model].filter(Boolean).join(' ').trim();
        const iso = Array.isArray(exif.iso) ? exif.iso[0] : exif.iso;
        const fNumber = Number.isFinite(exif.f_number) ? Number(exif.f_number.toFixed(1)) : null;
        const exposureTime = Number.isFinite(exif.exposure_time) ? exif.exposure_time : null;
        const focalMm = Number.isFinite(exif.focal_mm) ? Number(exif.focal_mm.toFixed(1)) : null;
        const focal35 = Number.isFinite(exif.focal_35mm) ? Math.round(exif.focal_35mm) : null;
        const exposureBias = Number.isFinite(exif.exposure_bias) ? Number(exif.exposure_bias.toFixed(1)) : null;
        const digitalZoom = Number.isFinite(exif.digital_zoom) && exif.digital_zoom > 0 ? Number(exif.digital_zoom.toFixed(2)) : null;
        const rawTime = exif.datetime_original || ifd0.datetime || '';
        const capturedAt = rawTime
          ? rawTime.replace(/^(\d{4}):(\d{2}):(\d{2})/, '$1-$2-$3').replace(' ', 'T') + (exif.offset_time_original || '')
          : '';
        const lat = dmsToDeg(gps.lat, gps.latRef);
        const lon = dmsToDeg(gps.lon, gps.lonRef);
        const alt = Number.isFinite(gps.alt) ? Number((gps.altRef === 1 ? -gps.alt : gps.alt).toFixed(1)) : null;
        const dir = Number.isFinite(gps.dir) ? Number(gps.dir.toFixed(1)) : null;
        const hasAny = Boolean(camera || lensModel || focal35 || focalMm || fNumber || exposureTime || iso || capturedAt || (lat !== null && lon !== null));
        return {
          hasExif: hasAny,
          camera, lens_model: lensModel, focal_mm: focalMm, focal_35mm: focal35,
          f_number: fNumber, exposure_time: exposureTime, shutter: formatShutter(exposureTime),
          iso: Number.isFinite(iso) ? Math.round(iso) : null, exposure_bias: exposureBias,
          digital_zoom: digitalZoom, captured_at: capturedAt,
          orientation: Number.isFinite(ifd0.orientation) ? ifd0.orientation : 1,
          gps_lat: lat, gps_lon: lon, gps_altitude_m: alt, gps_direction_deg: dir,
        };
      }
    }
    offset += 2 + segLen;
  }
  return { hasExif: false };
}
