# /// script
# requires-python = ">=3.10"
# dependencies = ["pillow", "numpy"]
# ///
from pathlib import Path
import json,sys
from PIL import Image,ImageDraw
sys.path.insert(0,r'C:\Users\admin\.codex\skills\geo-sleuth\scripts')
from tiles import Mosaic
p=Path(__file__).parent
q=Image.open(p.parent/'geo_slueth_test/terrain_test_images/test_sol_3.jpg')
q.crop((410,200,820,330)).resize((1640,520)).save(p/'query_structure_zoom.png')
m=Image.open(p/'google20.jpg')
m.crop((990,600,1280,940)).resize((870,1020)).save(p/'map_structure_zoom.png')
mm=Mosaic(p/'google20.jpg')
print('old_report_point_pixels',mm.to_px(37.81425,128.89760))
# This held-out point is only visualized for later evaluation, never used in fitting.
print('held_out_user_point_pixels',mm.to_px(37.81438,128.89691))
g=m.copy();d=ImageDraw.Draw(g)
for x in range(0,1280,100):d.line((x,0,x,1280),fill='red');d.text((x+2,2),str(x),fill='white')
for y in range(0,1280,100):d.line((0,y,1280,y),fill='red');d.text((2,y+2),str(y),fill='white')
g.save(p/'map_grid.png')
