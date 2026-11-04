# /// script
# requires-python = ">=3.10"
# dependencies = ["pillow"]
# ///
"""Decode actual images and JSON. Input is a JSON list of absolute paths on stdin."""
import json, sys, warnings
from pathlib import Path
from PIL import Image

def inspect(filename):
    p=Path(filename);result={'ok':False}
    try:
        if not p.is_file() or not 0<p.stat().st_size<=64*1024*1024:raise ValueError('empty, missing or oversized file')
        if p.suffix.lower() in ('.png','.jpg','.jpeg','.webp'):
            with warnings.catch_warnings():
                warnings.simplefilter('error',Image.DecompressionBombWarning)
                with Image.open(p) as im:im.verify()
                with Image.open(p) as im:
                    im.load();result.update(width=im.width,height=im.height)
        elif p.suffix.lower()=='.json':
            value=json.loads(p.read_text(encoding='utf-8-sig'))
            if value is None or value=={} or value==[]:raise ValueError('empty JSON result; not proof of missing imagery')
            if isinstance(value,dict) and value.get('error'):raise ValueError('JSON contains a service error')
            if isinstance(value,dict) and value.get('failed_tiles',0)>0:raise ValueError(f"{value['failed_tiles']} failed tiles")
        else:raise ValueError('unsupported verification file format')
        result['ok']=True
    except Exception as exc:result['error']=str(exc)[:300]
    return result

if __name__=='__main__':
    files=json.load(sys.stdin)
    print(json.dumps({f:inspect(f) for f in files},ensure_ascii=True))
