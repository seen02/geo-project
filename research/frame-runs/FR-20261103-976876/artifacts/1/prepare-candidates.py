import json,pathlib
items=json.loads(pathlib.Path('official-sources.json').read_text(encoding='utf-8'))
points={p['artclSj']:[float(p['latitude']),float(p['longitude'])] for p in items if p['artclSj'] in ['18 장준하통일관','7 송암관','9 산학관','6 경삼관(중앙도서관)']}
pathlib.Path('building-candidates.json').write_text(json.dumps(points,ensure_ascii=False,indent=2),encoding='utf-8')
