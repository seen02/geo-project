# /// script
# requires-python = ">=3.10"
# dependencies = ["pillow", "numpy", "scipy"]
# ///
from pathlib import Path
import json,sys,math,itertools
import numpy as np
from scipy.optimize import least_squares
sys.path.insert(0,r'C:\Users\admin\.codex\skills\geo-sleuth\scripts')
from pose import project,_frame
from geo import distance as haversine,bearing
p=Path(__file__).parent
s=json.loads((p/'full_spec.json').read_text())
pose=json.loads((p/'full_pose.json').read_text())
lat0,lon0=pose['_frame']['lat0'],pose['_frame']['lon0'];kx,ky=_frame(lat0)
pts0=np.array([[(q['ll'][1]-lon0)*kx,(q['ll'][0]-lat0)*ky,q['h']] for q in s['points']])
obs=np.array([q['px'] for q in s['points']],float)
results=[]
for roof,stair,hotel,cam in itertools.product([6.5,8.5,10.5],[0.5,1.5,2.5],[65,75,85],[3,4.5,6]):
 pts=pts0.copy();pts[:3,2]=roof;pts[3,2]=stair;pts[4,2]=hotel
 def res(v):
  params=np.array([v[0],v[1],cam,v[2],v[3],v[4],v[5]])
  uv,z=project(params,pts,1440,810)
  return np.nan_to_num((uv-obs).ravel(),nan=5000)
 initial=np.array(pose['_params'])[[0,1,3,4,5,6]]
 r=least_squares(res,initial,bounds=([-220,-180,75,-20,-8,500],[140,180,180,5,8,2500]),max_nfev=1000)
 results.append(dict(assumptions=dict(roof=roof,stair=stair,hotel=hotel,camera=cam),
  ll=[lat0+r.x[1]/ky,lon0+r.x[0]/kx],heading=r.x[2],hfov=2*math.degrees(math.atan(720/r.x[-1])),rms_px=float(np.sqrt(np.sum(r.fun**2)/len(obs)))))
(p/'height_sensitivity.json').write_text(json.dumps(results,indent=2))
old=[37.81425,128.89760]
new=pose['camera_ll']
# Evaluation only: camera labels were not passed to any solve/selection.
truth=[37.81438,128.89691]
comparison=dict(user_supplied_actual=truth,previous_representative=old,conditional_full_pose=new,
 previous_error_m=haversine(old,truth),new_point_error_m=haversine(new,truth),
 bearing_only_point=json.loads((p/'bearing_fit.json').read_text())['camera_ll'],
 truth_usage='Held-out evaluation after all fitting; same photo was already known from a prior conversation, so not a blind test.',
 height_sensitivity_cases=len(results),height_sensitivity_min_rms=min(t['rms_px'] for t in results),
 max_position_shift_m=max(haversine(new,t['ll']) for t in results),
 height_ranges='Roof 6.5..10.5m; stair foot 0.5..2.5m; hotel 65..85m; camera 3..6m, all assumed elevations, not surveys',
 direction_to_observatory_deg=bearing(new,[37.81419,128.89829]))
(p/'coordinate_comparison.json').write_text(json.dumps(comparison,indent=2))
cands={'conditional_solution':new,'previous_representative':old,
 'west_shore':[37.81445,128.89665],'central_curve':[37.81425,128.8974],
 'south_promenade':[37.81395,128.89805]}
(p/'camera_candidates.json').write_text(json.dumps(cands,indent=2))
print(json.dumps(comparison,indent=2))
