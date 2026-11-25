# /// script
# requires-python = ">=3.10"
# dependencies = ["pillow"]
# ///
"""Extract photographer-relevant EXIF metadata and upright dimensions from an image."""
import json
import math
import sys
from pathlib import Path
from PIL import ExifTags, Image


def _to_float(v):
    if v is None:
        return None
    try:
        val = float(v)
        return val if math.isfinite(val) else None
    except Exception:
        return None


def _deg(v, ref):
    d, m, s = (float(x) for x in v)
    val = d + m / 60.0 + s / 3600.0
    return -val if ref in ("S", "W") else val


def _format_shutter(sec):
    if sec is None or sec <= 0:
        return ""
    if sec >= 0.5:
        return f"{round(sec, 0 if sec >= 10 else 1):g}s"
    return f"1/{round(1.0 / sec)}s"


def extract(path_str: str) -> dict:
    p = Path(path_str)
    with Image.open(p) as im:
        w, h = im.size
        ex = im.getexif()
        base = {ExifTags.TAGS.get(k, k): v for k, v in ex.items()}
        sub = {ExifTags.TAGS.get(k, k): v for k, v in ex.get_ifd(0x8769).items()}
        gps = ex.get_ifd(0x8825) or {}

    orient = int(base.get("Orientation", 1) or 1)
    uw, uh = (h, w) if orient in (5, 6, 7, 8) else (w, h)
    make = str(base.get("Make", "")).strip("\x00 ")
    model = str(base.get("Model", "")).strip("\x00 ")
    camera = " ".join(x for x in (make, model) if x)
    if make and model and model.lower().startswith(make.lower()):
        camera = model

    lens_make = str(sub.get("LensMake", "")).strip("\x00 ")
    lens_model = str(sub.get("LensModel", "")).strip("\x00 ")
    lens = " ".join(x for x in (lens_make, lens_model) if x)
    if lens_make and lens_model and lens_model.lower().startswith(lens_make.lower()):
        lens = lens_model

    focal_mm = _to_float(sub.get("FocalLength"))
    focal_35 = _to_float(sub.get("FocalLengthIn35mmFilm"))
    f_number = _to_float(sub.get("FNumber"))
    exp_time = _to_float(sub.get("ExposureTime"))
    raw_iso = sub.get("ISOSpeedRatings", sub.get("PhotographicSensitivity"))
    if isinstance(raw_iso, (list, tuple)) and raw_iso:
        raw_iso = raw_iso[0]
    iso = int(round(float(raw_iso))) if _to_float(raw_iso) is not None else None
    ev = _to_float(sub.get("ExposureBiasValue"))
    dzoom = _to_float(sub.get("DigitalZoomRatio"))
    if dzoom is not None and dzoom <= 0:
        dzoom = None

    dt_raw = str(sub.get("DateTimeOriginal") or base.get("DateTime") or "").strip("\x00 ")
    tz_raw = str(sub.get("OffsetTimeOriginal") or "").strip("\x00 ")
    captured_at = ""
    if dt_raw:
        parts = dt_raw.split(" ")
        if len(parts) == 2:
            captured_at = parts[0].replace(":", "-") + "T" + parts[1] + tz_raw
        else:
            captured_at = dt_raw

    gps_lat = gps_lon = gps_alt = gps_dir = None
    if 2 in gps and 4 in gps:
        try:
            gps_lat = round(_deg(gps[2], gps.get(1, "N")), 7)
            gps_lon = round(_deg(gps[4], gps.get(3, "E")), 7)
        except Exception:
            pass
    if 6 in gps:
        alt_val = _to_float(gps[6])
        if alt_val is not None:
            gps_alt = round(-alt_val if gps.get(5) == 1 else alt_val, 1)
    if 17 in gps:
        dir_val = _to_float(gps[17])
        if dir_val is not None:
            gps_dir = round(dir_val, 1)

    has_exif = any([
        camera, lens, focal_mm, focal_35, f_number, exp_time, iso, captured_at,
        gps_lat is not None and gps_lon is not None,
    ])

    return {
        "ok": True,
        "has_exif": has_exif,
        "image_size": [uw, uh],
        "orientation": orient,
        "camera": camera,
        "lens_model": lens,
        "focal_mm": round(focal_mm, 2) if focal_mm is not None else None,
        "focal_35mm": int(round(focal_35)) if focal_35 is not None else None,
        "digital_zoom": round(dzoom, 2) if dzoom is not None else None,
        "f_number": round(f_number, 1) if f_number is not None else None,
        "exposure_time": round(exp_time, 6) if exp_time is not None else None,
        "shutter": _format_shutter(exp_time),
        "iso": iso,
        "exposure_bias": round(ev, 1) if ev is not None else None,
        "captured_at": captured_at,
        "gps_lat": gps_lat,
        "gps_lon": gps_lon,
        "gps_altitude_m": gps_alt,
        "gps_direction_deg": gps_dir,
    }


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")
    if len(sys.argv) < 2:
        print(json.dumps({"ok": False, "error": "missing image path"}))
        sys.exit(1)
    try:
        print(json.dumps(extract(sys.argv[1]), ensure_ascii=False))
    except Exception as exc:
        print(json.dumps({"ok": False, "error": str(exc)[:300]}, ensure_ascii=False))
        sys.exit(1)
