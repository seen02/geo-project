import json,pathlib
s=json.loads(pathlib.Path('pose-controls.json').read_text())
s['points']=s['points'][:3]
s['fix']=['hfov','roll','height']
pathlib.Path('pose-road-only.json').write_text(json.dumps(s,indent=2),encoding='utf-8')
c={f'GPS-height-{h}m':[37.1926194,127.0277161,h] for h in [53,57,61,65,69]}
pathlib.Path('height-candidates.json').write_text(json.dumps(c,indent=2),encoding='utf-8')
