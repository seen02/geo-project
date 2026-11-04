import json
from pathlib import Path
from PIL import Image, ImageOps, ImageDraw

panos = {}
for f in ['gsv-near.json','gsv-north.json','gsv-west.json']:
    raw=Path(f).read_text(encoding='utf-8-sig')
    data,end=json.JSONDecoder().raw_decode(raw.strip())
    Path(f.replace('.json','-clean.json')).write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding='utf-8')
    for p in data.get('neighbors',[]):
        panos[p['id']]=p
items=[dict(p,heading=h,pitch=-8,fov=65) for p in panos.values() for h in [165,185]]
Path('candidates.index.json').write_text(json.dumps(items,indent=2),encoding='utf-8')
Path('panorama-candidates.json').write_text(json.dumps(panos,indent=2),encoding='utf-8')
files=list(Path('intake-recheck/edges').glob('*.jpg'))
sheet=Image.new('RGB',(1200,450*2),'white')
d=ImageDraw.Draw(sheet)
for i,f in enumerate(files):
    im=Image.open(f); im.load()
    tile=ImageOps.contain(im,(295,420))
    x=(i%4)*300;y=(i//4)*450
    sheet.paste(tile,(x,y+25));d.text((x+3,y+3),f.stem,fill='black')
sheet.save('edges-check.jpg')
for f in ['comparison-original.jpg','comparison-news.jpg','comparison-tatler.jpg','satellite.jpg','reference.jpg']:
    with Image.open(f) as im:
        im.load();print(f,im.size)
print('Panoramas',len(panos),'render items',len(items))
