import json
from pathlib import Path
g=json.loads(Path('metapolis.geojson').read_text(encoding='utf-8'))
pixels={'A':[716.5,516.5],'B':[734.5,522.0],'C':[762.0,527.0],'D':[781.0,514.5]}
pts=[]
for f in g['features']:
    p=f['properties']; n=p.get('name','')[:1]
    if n not in pixels or 'height' not in p:continue
    co=f['geometry']['coordinates'][0][:-1]
    ll=[sum(c[1] for c in co)/len(co),sum(c[0] for c in co)/len(co)]
    pts.append({'name':n,'px':pixels[n],'ll':ll,'h':float(p['height'])+40})
spec={'frame':'upright','image_size':[1440,810],'points':pts,'init':{'at':[37.19,127.008],'height':160,'heading':75,'pitch':7,'hfov':60},'fix':['roll']}
Path('pose_spec.json').write_text(json.dumps(spec,indent=2))
print(json.dumps(pts,indent=2))
