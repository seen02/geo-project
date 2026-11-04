import json
from pathlib import Path
raw=Path('gsv-fine.json').read_text(encoding='utf-8-sig').strip()
d,_=json.JSONDecoder().raw_decode(raw)
Path('gsv-fine-clean.json').write_text(json.dumps(d,indent=2),encoding='utf-8')
ids={'iji2OHIKbyYu1lSo0NIzdA','LRbVXEQiWAQQhqXko-1Svw','c8uVcCPGTFNNGwTyV5uu-g','83wsVdIu_345czr7Miw0TQ'}
points=d['neighbors']+d['history']
items=[dict(p,heading=h,pitch=0,fov=f) for p in points if p['id'] in ids for h in [150,155,160,165] for f in [30,40]]
Path('fine.index.json').write_text(json.dumps(items,indent=2),encoding='utf-8')
print(len(items))
