# /// script
# requires-python = ">=3.10"
# dependencies = ["pillow", "numpy"]
# ///
from pathlib import Path
import json,sys,subprocess,math
import numpy as np
from PIL import Image,ImageDraw,ImageFont
sys.path.insert(0,r'C:\Users\admin\.codex\skills\geo-sleuth\scripts')
from pose import project,_frame
p=Path(__file__).parent
spec=json.loads((p/'full_spec.json').read_text())
pose=json.loads((p/'full_pose.json').read_text())
cmp=json.loads((p/'coordinate_comparison.json').read_text())
font=ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf',25)
im=Image.open(p.parent/'geo_slueth_test/terrain_test_images/test_sol_3.jpg').convert('RGB')
box=(430,215,615,330);scale=5
im=im.crop(box).resize(((box[2]-box[0])*scale,(box[3]-box[1])*scale))
d=ImageDraw.Draw(im);lat0,lon0=pose['_frame']['lat0'],pose['_frame']['lon0'];kx,ky=_frame(lat0)
pts=np.array([[(q['ll'][1]-lon0)*kx,(q['ll'][0]-lat0)*ky,q['h']] for q in spec['points']])
uv,_=project(np.array(pose['_params']),pts,1440,810)
for q,(u,v) in zip(spec['points'],uv):
 if q['name'].startswith('F_'):continue
 ox,oy=(q['px'][0]-box[0])*scale,(q['px'][1]-box[1])*scale
 cx,cy=(u-box[0])*scale,(v-box[1])*scale
 d.line((ox-8,oy,ox+8,oy),fill='lime',width=4);d.line((ox,oy-8,ox,oy+8),fill='lime',width=4)
 d.ellipse((cx-9,cy-9,cx+9,cy+9),outline='red',width=4)
 d.text((ox+13,oy-30),q['name'][0],fill='yellow',font=font,stroke_width=2,stroke_fill='black')
im.save(p/'observed_projected_zoom.jpg',quality=95)
evidence=dict(map='google20.jpg',crop=[0,240,1280,1000],width=1280,
 camera=pose['camera_ll'],heading=pose['heading'],hfov=pose['hfov'],range_m=130,
 labels=[
 dict(at=pose['camera_ll'],text='Conditional estimate',color='#ff6666',dx=0,dy=-95),
 dict(at=cmp['user_supplied_actual'],text='User-supplied actual',color='#66ff66',dx=5,dy=65),
 dict(at=cmp['previous_representative'],text='Previous representative',color='#ffaa55',dx=-5,dy=100),
 dict(at=[37.81419,128.89829],text='Observatory',color='#66ccff',dx=-70,dy=130)],
 panels=[
 dict(image='observed_projected_zoom.jpg',caption='Green crosses: observed pixels. Red circles: projected pixels. A/B/D: upper structure; E: stair foot. Mean 2D RMS = 7.15 px. C was rejected as ambiguous.'),
 dict(image='../geo_work_20261102_coast/refs/0.jpg',caption='Public daytime reference: same white structure, stairs and colored tetrapods. Source: Ardent News, 2025 image; identity comparison, not camera-position ground truth.'),
 dict(image='shore_comparison.jpg',caption='Shoreline check: green is photo water edge; red is projected satellite water edge. They disagree. Date, tide and coastal works are unresolved; this cannot validate metre-level precision.')])
(p/'evidence_spec.json').write_text(json.dumps(evidence,indent=2),encoding='utf-8')
roadcands={k:v for k,v in json.loads((p/'camera_candidates.json').read_text()).items()}
(p/'anchor_area.json').write_text(json.dumps({'Sageunjin coastal facility':[37.8142,128.8981]}))
(p/'camera_candidates.json').write_text(json.dumps(roadcands,indent=2))
result=dict(place='Sageunjin underwater park observatory, northwest curved shore, Gangneung',
 camera=pose['camera_ll'],heading=pose['heading'],coordinate_status='Conditional estimate only; no independently established small error radius',
 verified_user_coordinate=cmp['user_supplied_actual'],supplied_coordinate_status='Provided previously by user, not newly inferred',
 radius_m=None,radius_note='No validated camera-position radius; horizontal control perturbation has 146m p95 spread and the unconstrained pose Monte Carlo is unstable. Do not report 5m accuracy.',
 confidence={'city':'high','facility':'high','northwest shore sector':'medium','exact camera point from image alone':'low'},
 comparison=cmp,
 limitations=['Same image and actual coordinate were known before this run; not a blind test.',
 'Upper structure point identities and elevations are approximate, not surveyed.',
 'Distant building identification as Skybay north tower is tentative.',
 'No GPS, camera calibration or visible sea horizon.',
 'Stair-foot point is flagged by leave-one-out check.',
 'Satellite and photo waterlines disagree; causes are unresolved.'],
 sources=['https://korean.visitkorea.or.kr/detail/ms_detail.do?cotid=18985b56-92b8-41db-ac6d-c71b62449f99','https://naver.me/GsjTdXnj','https://www.skybay.co.kr/find_us','https://www.skybay.co.kr/about_hotel','https://cdn.ardentnews.co.kr/news/photo/202505/6215_29265_1831.jpg'],
 artifacts=['intake/intake.md','observed_points.json','full_spec.json','full_pose.json','candidate_check.json','bearing_sensitivity.json','height_sensitivity.json','shore_comparison.jpg','evidence.jpg'])
(p/'result.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8')
report=f'''# 사진 위치 재검증 기록

촬영 장소: 강릉시 안현동 사근진해중공원 전망대 북서쪽 곡선 해안.

- 조건부 계산 좌표: {pose['camera_ll'][0]}, {pose['camera_ll'][1]}
- 이전에 사용자가 제공한 실제 좌표: 37.81438, 128.89691
- 실제 좌표와 이번 계산점 거리: {cmp['new_point_error_m']:.2f}m
- 이전 대표점과 실제 좌표 거리: {cmp['previous_error_m']:.2f}m
- 사진 중심 방향 계산값: {pose['heading']:.2f}도; 전망대 방향: {cmp['direction_to_observatory_deg']:.2f}도
- 같은 파일의 재검증이며, 답을 모르는 상태의 독립 탐색이 아니다.

## 실제로 수행한 절차

| 작업 | 입력 | 실행 주체 | 산출물 | 의미 |
|---|---|---|---|---|
| 메타데이터·글자 확인 | 원본 사진 | 제가 intake.py 실행 | intake/intake.md | GPS와 유효한 지명 없음 |
| 시설 확인 | 공식 안내·공개 사진·거리뷰 | 제가 검색하고 형태 대조 | 출처 링크·확대 이미지 | 흰 구조물, 계단, 테트라포드 대응 |
| 위성영상 확보 | 시설 주변 좌표 | tiles.py, 제가 실행 | google20.jpg/json | 좌표를 읽을 수 있는 실제 지도 이미지 |
| 대응점 지정 | 사진 확대본·지도 | 제가 점을 선택, 프로그램이 좌표 변환 | observed_points.json | A~E 잠정 지정; C는 같은 점인지 불명확해 제외 |
| 방향 단서 추가 | 먼 건물·지도 | 제가 건물을 잠정 식별, poi.py 조회 | skybay_en_poi.json | 스카이베이 북쪽 동으로 추정; 식별 불확실성 유지 |
| 카메라 위치 계산 | A/B/D/E/F의 픽셀·좌표·높이 가정 | pose.py와 로컬 비교 코드 | full_pose.json, full_overlay.png | 조건부 좌표 계산, RMS 7.15픽셀 |
| 계산점과 실제 사진점 비교 | 같은 다섯 점 | pose.py | observed_projected_zoom.jpg | E는 약 13.7픽셀 차이, 높이 또는 대응 재검토 필요 |
| 점 하나씩 제외 | 다섯 기준점 | pose.py | full_pose.json leave_one_out | E 의심 표시; 먼 건물이 빠지면 위치도 불안정 |
| 해안선 검증 | 지도 수제선·사진 수제선 | 제가 선을 지정, 로컬 투영 코드 | shore_comparison.jpg | 두 선은 일치하지 않음. 원인 확인 전 정밀 검증으로 사용할 수 없음 |
| 가정 변경 | 높이 81조합·기준점 이동 180회 | 로컬 수치 계산 코드 | height_sensitivity.json, bearing_sensitivity.json | 높이 변경 최대 약 25m; 기준점 2m 오차만 줘도 위치가 크게 흔들림 |
| 실제 좌표와 비교 | 계산 완료 결과·기존 실제 좌표 | 로컬 거리 계산 | coordinate_comparison.json | 4.65m 떨어짐. 이것을 5m 정확도 보장으로 해석하지 않음 |

## 결론의 한계

사진 속 시설은 확실하다. 북서쪽 해안이라는 촬영 구역도 지지된다. 그러나 지도 모서리의 좌표와 높이가 측량값이 아니며, 먼 건물의 식별도 잠정적이다. 같은 조건에서 나온 점은 실제 좌표에 가까웠지만, 입력을 조금 바꾸면 결과가 흔들린다. 따라서 사진만으로 정확한 촬영점을 확정하거나 ±5m라고 발표하면 안 된다. 더 정확한 독립 검증에는 같은 모서리의 측량 좌표·높이, 렌즈 정보 또는 해당 해안의 가까운 거리뷰가 필요하다.

역 이미지 검색은 사용하지 않았다. 사진 속 사람의 신원은 조사하지 않았다.

출처와 상세 입력·계산 결과는 result.json 및 위 산출물에 저장했다.
'''
(p/'report_ko.md').write_text(report,encoding='utf-8')
print('Prepared evidence_spec.json, result.json and report_ko.md')
