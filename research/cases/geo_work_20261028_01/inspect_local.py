from PIL import Image, ImageDraw, ImageOps
from pathlib import Path
import json, math

paths=list(Path('intake/edges').glob('*.jpg'))
sheet=Image.new('RGB',(1200,800),'white'); d=ImageDraw.Draw(sheet)
for i,p in enumerate(paths):
    im=Image.open(p); im.thumbnail((590,170))
    x=(i%2)*600; y=(i//2)*200
    sheet.paste(im,(x,y+25)); d.text((x+8,y+5),p.stem.split('_01_')[-1],fill='black')
sheet.save('edges_sheet.jpg')

def ll(x,y,z,ox,oy):
    xx=(ox*256+x)/(256*2**z); yy=(oy*256+y)/(256*2**z)
    return [math.degrees(math.atan(math.sinh(math.pi*(1-2*yy)))),xx*360-180]

base=[(635,178),(609,384),(568,686),(546,871)]
pts={name:ll(x,y,18,223598,101846) for name,(x,y) in zip('ABCD',base)}
Path('tower_approx.json').write_text(json.dumps(pts,indent=2))
im=Image.open('west_map.jpg'); d=ImageDraw.Draw(im)
for y in range(100,im.height,300):
    for x in range(100,im.width,300):
        lat,lon=ll(x,y,14,13969,6362)
        d.rectangle((x-2,y-2,x+2,y+2),fill='red')
        d.text((x+5,y),f'{lat:.4f},{lon:.4f}',fill='yellow',stroke_width=1,stroke_fill='black')
im.save('west_grid.jpg')
print(json.dumps(pts))
