import concurrent.futures
import json
import sys
import urllib.request
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageFont, ImageStat

SKILL = Path('C:/Users/admin/.codex/skills/geo-sleuth')
sys.path.insert(0, str(SKILL / 'scripts'))

sources = {
    'unsplash.html': 'https://unsplash.com/photos/wooden-boat-on-lago-di-braies-O453M2Liufs',
    'commons.html': 'https://commons.wikimedia.org/wiki/File:Lago_di_Braies_on_boat.jpg',
    'operator.html': 'https://www.la-palafitta.com/en',
    'official-landscape.jpg': 'https://www.suedtirol.info/en/en/experiences-and-events/nature/lakes-and-natural-pools/pragser-wildsee-lake/_jcr_content/root/containerStatic/editorial_hightlight_1724631691/tab/item_1776932953456/image-bg.coreimg.jpeg/1776933607745/pragserwildsee.jpeg',
    'lake-coordinate.html': 'https://en.wikipedia.org/wiki/Pragser_Wildsee',
}

def download(item):
    name, url = item
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'FRAME-location-research/1.0'})
        with urllib.request.urlopen(req, timeout=20) as r:
            data = r.read()
        Path(name).write_bytes(data)
        return {'file': name, 'url': url, 'bytes': len(data), 'status': 'downloaded'}
    except Exception as e:
        return {'file': name, 'url': url, 'error': str(e)}

with concurrent.futures.ThreadPoolExecutor(max_workers=5) as ex:
    records = list(ex.map(download, sources.items()))
Path('downloads.json').write_text(json.dumps(records, ensure_ascii=False, indent=2), encoding='utf-8')
print(json.dumps(records, ensure_ascii=False))

font = ImageFont.truetype('C:/Windows/Fonts/arial.ttf', 18)
edgefiles = sorted(Path('intake/edges').glob('*.jpg'))
sheet = Image.new('RGB', (1200, 640), 'white')
d = ImageDraw.Draw(sheet)
for i, path in enumerate(edgefiles):
    im = Image.open(path).convert('RGB')
    im.thumbnail((296, 280))
    x, y = (i % 4) * 300, (i // 4) * 320
    sheet.paste(im, (x, y + 25))
    d.text((x + 4, y + 3), path.stem.replace('reference_', ''), font=font, fill='black')
sheet.save('edges-sheet.jpg', quality=90)

a = Image.open('reference.jpg').convert('RGB').resize((800, 533))
b = Image.open('source-unsplash.jpg').convert('RGB').resize((800, 533))
mae = sum(ImageStat.Stat(ImageChops.difference(a, b)).mean) / 3
comparison = {'method': 'RGB mean absolute difference after resizing both full frames to 800x533', 'range': '0-255', 'mae': mae, 'reference': 'reference.jpg', 'downloaded_source': 'source-unsplash.jpg', 'url': 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1600&q=85&fm=jpg', 'note': 'Same-photo provenance check, not an independent camera-position constraint.'}
Path('source-comparison.json').write_text(json.dumps(comparison, indent=2), encoding='utf-8')
print(json.dumps(comparison))

import tiles

tile_records = []
def urllib_get(url, path, proxy):
    if path.exists() and path.stat().st_size > 1000:
        return True
    try:
        with urllib.request.urlopen(url, timeout=15) as r:
            data = r.read()
        path.write_bytes(data)
        Image.open(path).verify()
        tile_records.append({'url': url, 'file': str(path), 'bytes': len(data)})
        return True
    except Exception as e:
        tile_records.append({'url': url, 'error': str(e)})
        return False

tiles._get = urllib_get
meta = tiles.fetch((46.6915, 12.0855), 15, 1, Path('lake-map.jpg'), 'esri', None, Path('.geo-cache/tiles'))
Path('tile-downloads.json').write_text(json.dumps(tile_records, indent=2), encoding='utf-8')
print(json.dumps(meta))
