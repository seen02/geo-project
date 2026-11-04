# /// script
# requires-python = ">=3.10"
# dependencies = ["pillow", "numpy"]
# ///
"""Record manually picked, tentative feature correspondences BEFORE camera fitting.

The four upper points are beam/rail outline locations; their correspondence and
height are uncertain. Their small separation in the photo makes resection weak.
No user-supplied camera coordinate is used in this file.
"""
from pathlib import Path
import json,sys
from PIL import Image,ImageDraw,ImageFont
sys.path.insert(0,r'C:\Users\admin\.codex\skills\geo-sleuth\scripts')
from tiles import Mosaic
p=Path(__file__).parent
m=Mosaic(p/'google20.jpg')
raw=[
    ('A_NW_beam_open_end',[505,229],[1095,705],8.5,'tentative roof beam end; height assumed'),
    ('B_NW_bow',[447,234],[1152,660],8.5,'tentative curved rail transition; height assumed'),
    ('C_SE_bow',[456,242],[1194,706],8.5,'tentative far curved rail; height assumed'),
    ('D_SE_beam_open_end',[562,232],[1146,764],8.5,'tentative far beam end; height assumed'),
    ('E_stair_foot',[589,307],[1115,789],2.0,'stair foot; map ground/top ambiguity')
]
pts=[]
for name,px,mpx,h,note in raw:
    ll=m.to_ll(*mpx)
    pts.append(dict(name=name,px=px,map_px=mpx,ll=list(ll),h=h,status='tentative',note=note,pixel_uncertainty_px=3,map_uncertainty_m=5))
spec=dict(frame='upright',image_size=[1440,810],points=pts,
    init=dict(at=[37.81425,128.89760],height=4.5,heading=110,pitch=-6,hfov=65),fix=[])
(p/'control_spec.json').write_text(json.dumps(spec,indent=2),encoding='utf-8')
(p/'observed_points.json').write_text(json.dumps(pts,indent=2),encoding='utf-8')
for fname,base,key,box,scale,out in [
    ('photo',p.parent/'geo_slueth_test/terrain_test_images/test_sol_3.jpg','px',(420,210,625,330),5,'photo_controls.png'),
    ('map',p/'google20.jpg','map_px',(1040,620,1240,840),4,'map_controls.png')]:
    im=Image.open(base).convert('RGB').crop(box).resize(((box[2]-box[0])*scale,(box[3]-box[1])*scale))
    d=ImageDraw.Draw(im)
    for q in pts:
        x,y=q[key]; x=(x-box[0])*scale;y=(y-box[1])*scale
        d.ellipse((x-7,y-7,x+7,y+7),outline='red',width=3)
        d.text((x+10,y-20),q['name'][0],fill='yellow',stroke_width=1,stroke_fill='black',font=ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf',24))
    im.save(p/out)
print(json.dumps(pts,indent=2))
