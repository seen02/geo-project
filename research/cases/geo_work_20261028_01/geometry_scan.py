import json, math
from pathlib import Path
import numpy as np
s=json.loads(Path('pose_spec.json').read_text())
points=s['points']+[{'name':'Green net center','ll':[37.18957,127.038217],'px':[866,588]}]
out=[]
for lat in np.arange(37.179,37.192,.00025):
  for lon in np.arange(127.016,127.029,.00025):
    b=np.array([math.atan2((p['ll'][1]-lon)*math.cos(math.radians(lat)),p['ll'][0]-lat) for p in points])
    yaw=np.mean(b[:4]); xx=np.tan(b-yaw)
    obs=np.array([p['px'][0] for p in points])
    f,c=np.linalg.lstsq(np.stack([xx,np.ones(5)],axis=1),obs,rcond=None)[0]
    pred=f*xx+c; rms=np.sqrt(np.mean((pred-obs)**2))
    if f<=0:continue
    out.append({'lat':round(lat,6),'lon':round(lon,6),'heading':math.degrees(yaw-math.atan((c-720)/f)), 'hfov':math.degrees(2*math.atan(720/f)),'rms_x':rms,'pred':pred.tolist()})
out.sort(key=lambda r:r['rms_x'])
Path('horizontal_scan.json').write_text(json.dumps({'assumptions':'Green enclosure is the mapped range at 37.18957,127.038217; center read within about 20 pixels. Tower coordinates from OSM. Fits horizontal geometry only, not a final camera solution.','best':out[:40]},indent=2))
for ll in [[37.182367,127.020611],[37.189377,127.023181],[37.1845,127.0223]]:
 r=min(out,key=lambda r:abs(r['lat']-ll[0])+abs(r['lon']-ll[1]));print(r)
print('TOP',out[:4])
