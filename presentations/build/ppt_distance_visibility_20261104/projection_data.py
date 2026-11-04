from pathlib import Path
import json,sys,numpy as np
sys.path.insert(0,r'C:\Users\admin\.codex\skills\geo-sleuth\scripts')
from pose import project,_frame
root=Path(r'C:\Users\admin\img2place_project')
work=root/'geo_work_20261103_precision'
pose=json.loads((work/'full_pose.json').read_text())
spec=json.loads((work/'full_spec.json').read_text())
shore=json.loads((work/'shore_points.json').read_text())
lat0=pose['_frame']['lat0'];lon0=pose['_frame']['lon0'];kx,ky=_frame(lat0)
def projected(points):
    coords=np.array([[(q['ll'][1]-lon0)*kx,(q['ll'][0]-lat0)*ky,q['h']]for q in points])
    uv,z=project(np.array(pose['_params']),coords,1440,810)
    return uv.tolist()
out={'comparison_points':[{'name':q['name'][0],'observed':q['px'],'projected':v}for q,v in zip(spec['points'],projected(spec['points']))],
     'shore_projected':[v for v in projected(shore) if all(np.isfinite(v))],
     'shore_observed':json.loads((work/'shore_observed.json').read_text())}
(root/'ppt_distance_visibility_20261104/projection_data.json').write_text(json.dumps(out,indent=2))
print('Saved existing camera-model projections for native PPT annotations.')
