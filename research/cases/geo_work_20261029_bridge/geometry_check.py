import json,math
from pathlib import Path
import numpy as np
from PIL import Image,ImageDraw
p=Path(__file__).parent
def ll(file,x,y):
    m=json.loads((p/file).read_text()); z=m['zoom']; ox,oy=m['origin_tile']; x=x*2304/1600; y=y*2304/1600
    a=(ox+x/256)/2**z; b=(oy+y/256)/2**z
    return [math.degrees(math.atan(math.sinh(math.pi*(1-2*b)))),a*360-180]
near=ll('bridge_map.json',1163,966); far=ll('bridge_map.json',405,675)
third=[ll('map.json',x,y) for x,y in [(716,654),(945,733),(1019,501),(792,449)]]
sixth=[ll('map.json',x,y) for x,y in [(31,643),(160,681),(265,628),(286,513),(106,447)]]
breakwater=[ll('map.json',x,y) for x,y in [(368,1124),(402,1146),(634,816),(600,776)]]
anchors={'near_tower':near,'far_tower':far,'third_corners':third,'sixth_corners':sixth,'breakwater_corners':breakwater}
(p/'map_anchors.json').write_text(json.dumps(anchors,indent=2))
def bearing(cam,pts):
    pts=np.array(pts); b=np.degrees(np.arctan2((pts[:,1]-cam[1])*math.cos(math.radians(cam[0])),pts[:,0]-cam[0]))%360; return np.where(b<180,b+360,b)
obs=np.array([754,478,382,1110.])
best=[]
for lat in np.arange(35.627,35.63551,.0001):
  for lon in np.arange(139.769,139.77921,.0001):
    cam=[lat,lon]; bt=bearing(cam,[near,far]); b3=bearing(cam,third); b6=bearing(cam,sixth)
    bw=bearing(cam,breakwater)
    b=np.r_[bt,min(bw),max(bw)]
    for h in np.arange(260,365,.5):
      t=np.tan(np.radians((b-h+180)%360-180)); f=np.dot(t,obs-720)/np.dot(t,t)
      if f<650 or f>2200:continue
      pred=720+f*t; rms=np.sqrt(np.mean((pred-obs)**2))
      best.append({'lat':lat,'lon':lon,'heading':h,'focal':f,'hfov':math.degrees(2*math.atan(720/f)),'rms_x':rms,'pred':pred.tolist(),'bearings':b.tolist()})
best.sort(key=lambda q:q['rms_x']);(p/'horizontal_fit.json').write_text(json.dumps(best[:30],indent=2));print(json.dumps(best[:3],indent=2))
