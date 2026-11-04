import json, sys
from pathlib import Path
sys.path.insert(0,r'C:\Users\admin\.codex\skills\geo-sleuth\scripts')
import pose
s=json.loads(Path('pose_spec.json').read_text())
for p in s['points']: p['h']+=25
s['init']['at']=[37.1825,127.021]
s['init']['heading']=60
s['fix']=['height','roll']
out=[]
for h in [100,130,160,190,210]:
    s['init']['height']=h
    r=pose.solve(s,1000,8,pt_sigma=0)
    out.append({k:r[k] for k in ['camera_ll','height','heading','pitch','hfov','rms_px']})
Path('fixed_tower_results.json').write_text(json.dumps(out,indent=2))
print(json.dumps(out,indent=2))
