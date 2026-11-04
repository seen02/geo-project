# /// script
# requires-python = ">=3.10"
# dependencies = ["pillow", "numpy"]
# ///
from pathlib import Path
import json,sys,math
import numpy as np
from PIL import Image,ImageDraw,ImageFont
sys.path.insert(0,r'C:\Users\admin\.codex\skills\geo-sleuth\scripts')
from tiles import Mosaic
from pose import project,_frame
p=Path(__file__).parent;m=Mosaic(p/'google20.jpg')
mpx=[[0,275],[100,400],[200,490],[300,559],[400,603],[500,629],[600,650],[700,655],[800,653],[900,631],[1000,608],[1100,580]]
observed=[[0,641],[150,583],[300,529],[450,468],[600,413],[680,384],[724,364],[743,350],[720,341],[674,333],[624,330]]
points=[dict(name=f'S{i}',ll=list(m.to_ll(*v)),h=0,map_px=v) for i,v in enumerate(mpx)]
(p/'shore_points.json').write_text(json.dumps(points,indent=2))
(p/'shore_observed.json').write_text(json.dumps(observed))
pose=json.loads((p/'full_pose.json').read_text());lat0=pose['_frame']['lat0'];lon0=pose['_frame']['lon0'];kx,ky=_frame(lat0)
enu=np.array([[(q['ll'][1]-lon0)*kx,(q['ll'][0]-lat0)*ky,q['h']] for q in points]);uv,z=project(np.array(pose['_params']),enu,1440,810)
im=Image.open(p.parent/'geo_slueth_test/terrain_test_images/test_sol_3.jpg').convert('RGB');d=ImageDraw.Draw(im)
d.line(observed,fill='lime',width=4)
valid=[tuple(x) for x,zz in zip(uv,z) if zz>0 and np.isfinite(x).all()]
d.line(valid,fill='red',width=4)
d.text((30,30),'GREEN = photographed water edge; RED = satellite water edge projected (not same date)',fill='yellow',font=ImageFont.truetype('C:/Windows/Fonts/arial.ttf',22))
im.save(p/'shore_comparison.jpg',quality=95)
print(json.dumps({'map_shore_projected_px':uv.tolist(),'note':'Water edge changes with tide, waves and beach works; this is a consistency check, not surveyed same-time control.'},indent=2))
