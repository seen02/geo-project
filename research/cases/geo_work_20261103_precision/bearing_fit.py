# /// script
# requires-python = ">=3.10"
# dependencies = ["pillow", "numpy", "scipy"]
# ///
"""Independent horizontal-angle diagnostic; not a survey solution.

Uses satellite-clicked control points and image x coordinates. Excludes C because
the far curve is not a uniquely identifiable point. The rooftop center of the
distant hotel supplies a separate bearing. Height/pitch/roll and lens distortion
are NOT solved here, so uncertainties are tested before using any result.
"""
from pathlib import Path
import json, math, sys
import numpy as np
from scipy.optimize import least_squares
sys.path.insert(0,r'C:\Users\admin\.codex\skills\geo-sleuth\scripts')
from tiles import Mosaic
p=Path(__file__).parent
spec=json.loads((p/'control_spec.json').read_text())
points=[q for q in spec['points'] if not q['name'].startswith('C_')]
hotel=Mosaic(p/'hotel_map.jpg')
# Center of the north tower's rounded top on the public satellite image.
points.append(dict(name='F_distant_hotel_north_roof',px=[1401,185],
 ll=list(hotel.to_ll(238,350)),map_px=[238,350],status='tentative identification',
 note='Satellite roof center, 10m uncertainty; image x center ±8px. y not used.'))
lat0,lon0=spec['init']['at'];kx=111320*math.cos(math.radians(lat0));ky=110540
xy=np.array([[(q['ll'][1]-lon0)*kx,(q['ll'][0]-lat0)*ky] for q in points])
obs=np.array([q['px'][0] for q in points],float)
def project(v,xy):
 e,n,yaw,f=v;dy=xy-np.array([e,n]);a=np.radians(yaw)
 forward=dy@np.array([np.sin(a),np.cos(a)]);right=dy@np.array([np.cos(a),-np.sin(a)])
 return 720+f*right/forward
def fit(xy,obs,starts=20,seed=3):
 rng=np.random.default_rng(seed);best=None
 for i in range(starts):
  initial=[rng.uniform(-140,40),rng.uniform(-50,70),rng.uniform(100,145),rng.uniform(700,1700)]
  r=least_squares(lambda v: project(v,xy)-obs,initial,
    bounds=([-220,-180,75,500],[140,180,180,2500]),max_nfev=1000)
  if best is None or (r.fun@r.fun)<(best.fun@best.fun):best=r
 return best
r=fit(xy,obs,60);v=r.x
out=dict(model='horizontal-only pinhole, ignores roll/pitch',
 camera_ll=[lat0+v[1]/ky,lon0+v[0]/kx],heading_deg=v[2],
 hfov_deg=2*math.degrees(math.atan(720/v[3])),rms_px=math.sqrt(np.mean(r.fun**2)),
 residuals_px={q['name']:round(float(err),2) for q,err in zip(points,r.fun)},
 points=points,exclusion='C removed: no unique match for the far curved rail',
 note='Candidate region and 500..2500px focal are constraints, not measurements; camera truth not used.')
rng=np.random.default_rng(19);runs=[]
for i in range(180):
 testxy=xy+rng.normal(0,2,xy.shape)
 testxy[-1]=xy[-1]+rng.normal(0,10,2)
 testobs=obs+rng.normal(0,3,obs.shape);testobs[-1]=obs[-1]+rng.normal(0,8)
 t=fit(testxy,testobs,starts=2,seed=i)
 runs.append(dict(ll=[lat0+t.x[1]/ky,lon0+t.x[0]/kx],focal=t.x[3],rms=float(np.sqrt(np.mean(t.fun**2))),offset_m=float(np.linalg.norm(t.x[:2]-v[:2]))))
out['sensitivity']={'trials':len(runs),'control_sigma_m':2,'hotel_sigma_m':10,'pixel_sigma_px':3,
 'offset_p50_m':float(np.percentile([t['offset_m'] for t in runs],50)),
 'offset_p95_m':float(np.percentile([t['offset_m'] for t in runs],95)),
 'warning':'Does not include feature-identity ambiguity, coherent satellite georegistration error or camera model error. Not a confidence radius.'}
(p/'bearing_fit.json').write_text(json.dumps(out,indent=2),encoding='utf-8')
(p/'bearing_sensitivity.json').write_text(json.dumps(runs,indent=2),encoding='utf-8')
print(json.dumps({k:v for k,v in out.items() if k!='points'},indent=2))
