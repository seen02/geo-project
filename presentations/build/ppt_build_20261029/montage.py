from PIL import Image,ImageOps,ImageDraw
from pathlib import Path
import re
p=Path(r'C:\Users\admin\img2place_project\ppt_build_20261029')
src=p/'reference_render'
files=sorted(src.glob('*.PNG'),key=lambda x:int(re.search(r'\d+',x.stem).group()))
if not files:files=sorted(src.glob('*.png'),key=lambda x:int(re.search(r'\d+',x.stem).group()))
for k in range(0,len(files),12):
 canvas=Image.new('RGB',(1440,900),'#e5e7eb');d=ImageDraw.Draw(canvas)
 for j,f in enumerate(files[k:k+12]):
  im=Image.open(f).convert('RGB');im.thumbnail((350,260))
  x=(j%4)*360+5;y=(j//4)*300+22
  canvas.paste(im,(x,y));d.text((x,y-18),str(k+j+1),fill='black')
 canvas.save(p/f'reference_montage_{k//12+1}.jpg')
print('montages',len(files))
