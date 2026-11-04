# /// script
# requires-python = ">=3.10"
# dependencies = []
# ///
from pathlib import Path
import subprocess,json
p=Path(__file__).parent
uv=r'C:\Users\admin\AppData\Roaming\Python\Python312\Scripts\uv.exe'
script=r'C:\Users\admin\.codex\skills\geo-sleuth\scripts\board.py'
commands=[
 ['country','kr'],
 ['add','--from','anchor_area.json','--level','area','--radius','250'],
 ['add','Sageunjin shore segments','--level','road','--parent','Sageunjin coastal facility','--bbox','37.8138,128.8963,37.8148,128.8985'],
 ['add','--from','camera_candidates.json','--level','point','--parent','Sageunjin shore segments','--radius','30'],
 ['clue','White curved observatory, stair arrangement and colored tetrapods match the public reference.','--kind','visual','--status','observed','--file','../geo_work_20261102_coast/refs/0.jpg'],
 ['clue','Upper structure control points are provisional; the far curved point C has no unique correspondence.','--kind','geometry','--status','inferred','--file','map_controls.png'],
 ['clue','Reprojection solved with A/B/D/E and tentative distant hotel: RMS 7.15px; E is flagged by leave-one-out.','--kind','geometry','--status','computed','--file','full_pose.json','--resolves','K2'],
 ['clue','Projected satellite water edge differs from photographed water edge; no same-date shore control.','--kind','geometry','--status','computed','--file','shore_comparison.jpg'],
 ['clue','Camera candidates compared with all points and each point omitted; none exceeds robust delta-chi2 9.','--kind','geometry','--status','computed','--file','candidate_check.json'],
 ['clue','The user supplied 37.81438,128.89691 previously for this byte-identical photo; withheld from fit and used for evaluation.','--kind','hint','--status','inferred','--file','coordinate_comparison.json'],
 ['evidence','--clue','K1','--for','Sageunjin coastal facility:5','--why','The landmark identity matches three structural features.','--file','evidence.jpg'],
 ['evidence','--clue','K1','--for','Sageunjin shore segments:5','--why','The same facility and coastal layout are observed.','--file','evidence.jpg'],
 ['evidence','--clue','K3','--for','conditional_solution:3','--for','west_shore:2','--against','central_curve:0.5','--against','previous_representative:0.3','--against','south_promenade:0.5','--why','Provisional camera model favors the northwest shore; no candidate is definitively excluded.','--file','candidate_check.json'],
 ['evidence','--clue','K5','--for','conditional_solution:1.5','--for','west_shore:1.1','--against','central_curve:0.8','--against','previous_representative:0.7','--against','south_promenade:0.8','--why','All-point residual favors the new position, but dropping the distant landmark prevents robust exclusions.','--file','candidate_check.json'],
 ['check','--evidence','evidence.jpg'],
 ['report','--merge','result.json']]
log=[]
for args in commands:
 r=subprocess.run([uv,'run',script,*args],cwd=p,capture_output=True,text=True,encoding='utf-8',errors='replace')
 log.append(dict(command=[uv,'run',script,*args],returncode=r.returncode,stdout=r.stdout,stderr=r.stderr))
 if r.returncode:
  print('FAILED',args,r.stdout,r.stderr)
  break
 print(' '.join(args[:3]),':',r.stdout[:240].strip())
(p/'board_commands.json').write_text(json.dumps(log,indent=2),encoding='utf-8')
