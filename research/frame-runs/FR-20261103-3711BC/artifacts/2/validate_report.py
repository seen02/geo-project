import json
from pathlib import Path
from PIL import Image
import jsonschema
r=json.loads(Path('final.json').read_text(encoding='utf-8'))
s=json.loads(Path('report.schema.json').read_text(encoding='utf-8-sig'))
jsonschema.validate(r,s)
m=json.loads(Path('satellite.json').read_text(encoding='utf-8'))
assert m['failed_tiles']==0
for f in ['reference.jpg','satellite.jpg','evidence.jpg','comparison-panel-roofs.jpg','comparison-panel-depth.jpg','sv-top.jpg','sv-south.jpg','sv-reverse.jpg']:
    with Image.open(f) as im:
        im.load();assert im.width>0 and im.height>0
for v in r['verification'].values():
    for f in v['files']: assert Path(f).is_file(),f
for e in r['evidence']:assert Path(e['file']).is_file()
spec=json.loads(Path(r['evidence_spec']).read_text(encoding='utf-8'))
assert spec['map']=='satellite.jpg' and 'crop' not in spec
assert 'heading' not in spec and 'hfov' not in spec
Path('validation.json').write_text(json.dumps({'schema':'pass','image_decode':'pass','evidence_files':'pass','satellite_failed_tiles':0,'view_cone':'omitted because hfov unknown'},indent=2),encoding='utf-8')
print('Report schema, evidence files, image decoding and complete satellite mosaic: PASS')
