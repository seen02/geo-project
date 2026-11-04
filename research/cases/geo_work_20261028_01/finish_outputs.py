import json,sys
from pathlib import Path
sys.path.insert(0,r'C:\Users\admin\.codex\skills\geo-sleuth\scripts')
import geo
b=Path(__file__).parent
# Road candidates collectively cover the sampled access-road panorama sequence.
roads={'North bend':[37.18462,127.02170],'East overlook segment':[37.18425,127.02232],'Southeast approach':[37.18385,127.02234]}
(b/'road_segments.json').write_text(json.dumps(roads,indent=2))
s=json.loads((b/'evidence_spec.json').read_text())
s['labels'][1]['at']=list(geo.px2ll(18,223562*256+700,101864*256+650))
s['labels'][1].update(text='Bojeoksa / Doksanseong',dx=-300,dy=150)
(b/'evidence_spec.json').write_text(json.dumps(s,indent=2))
r={'place':'경기도 오산시 독산성·보적사 북동쪽 진입로 주변','lat':37.1843,'lon':127.0223,'datum':'WGS84','radius_m':150,'radius_interpretation':'Approximate search tolerance, not a statistical confidence interval; not an exact camera fix.','heading_deg':61,'confidence':{'city':'high','area':'high','road':'medium','exact_point':'low'},'evidence':['evidence.jpg','road_matches.json','horizontal_scan.json','final_pose.json','pose_selfcheck.jpg'],'search_coverage':'24 public reference photos; 20 nearby public Google panorama views; z18 satellite detail. No exhaustive street-by-street survey.','limitations':['No GPS EXIF or readable text.','Reverse image upload was blocked by automatic approval review; no image was uploaded.','Far towers are nearly collinear; unconstrained pose solution is degenerate and was not used.','Fixed-position reprojection passes, but is not independent proof of camera location.','Panorama metadata date was not verified separately for each neighbor; no capture date claimed.','Seasonal trees and older imagery prevent an exact tree/footstep match.'],'alternatives':['Nearby positions along the same east access road remain plausible within the stated area.','Yangsanbong is downweighted by tower/net alignment; not formally excluded. Other namesakes are not supported by the skyline and were not locally surveyed.'],'sources':['https://www.google.com/maps/@?api=1&map_action=pano&pano=JLn8Mh9EZ02Qha_FQYGYdg&heading=61&pitch=8&fov=67','https://taijung.tistory.com/159','https://ggc.ggcf.kr/p/654ad78777e5f81f54e4a703']}
(b/'result.json').write_text(json.dumps(r,ensure_ascii=False,indent=2),encoding='utf-8')
