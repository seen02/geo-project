import json,math
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
b=Path(__file__).parent
at=[33.2273,126.3030];f=720/math.tan(math.radians(75/2));pitch=math.degrees(math.atan((408-405)/f))
pose={'_frame':{'lat0':at[0],'lon0':at[1],'image_size':[1440,810],'frame':'upright'},'_params':[0,0,2.6,220,pitch,0,f],'caution':'Representative shoreline position, not a solved camera fix. Ground DEM1m, assumed eye1.6m. Pitch calibrated from sea horizon row408 using project sign convention. pose.sanity horizon text has a known opposite-sign formula; target projection and actual overlay are used. Terrain shape fits broadly, cliff edge is smoothed and does not coincide exactly.'}
pts=[{'name':'Songaksan approximate summit','ll':[33.199081,126.28979],'h':104},{'name':'Sea direction at 20km','ll':[33.089,126.164],'h':0}]
(b/'camera_pose.json').write_text(json.dumps(pose,indent=2));(b/'project_points.json').write_text(json.dumps(pts,indent=2))
roads={'East layered-rock shoreline':[33.2273,126.3030],'Central sandy shoreline':[33.2258,126.2998],'Harbor frontage':[33.2278,126.3050]}
(b/'coast_segments.json').write_text(json.dumps(roads,indent=2))
font=ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf',23)
for file,boxes,out in [('C:/Users/admin/img2place_project/geo_slueth_test/terrain_test_images/test_sol_1_.jpg',[(312,380,633,419,'1'),(890,385,1435,472,'2')],'query_annotated.jpg'),('refs/08.jpg',[], 'reference_annotated.jpg')]:
 im=Image.open(file).convert('RGB');d=ImageDraw.Draw(im)
 for x0,y0,x1,y1,t in boxes:
  d.rectangle((x0,y0,x1,y1),outline='#ffd738',width=3);d.rectangle((x0,y0-28,x0+26,y0),fill='#ffd738');d.text((x0+5,y0-28),t,fill='black',font=font)
 im.save(out,quality=94)
spec={'map':'coast_detail.jpg','width':1200,'camera':at,'heading':220,'hfov':75,'range_m':170,'labels':[{'at':at,'text':'Estimated shore area: radius ~200 m','dx':-500,'dy':-85},{'at':[33.2281,126.3042],'text':'Sagye coastal road','dx':-400,'dy':-70}],'panels':[{'image':'query_annotated.jpg','caption':'User photo: 1 Songaksan profile | 2 pale layered platform'},{'image':'reference_annotated.jpg','caption':'Public Sagye coast photograph: Jeju Ilbo, 2024-08-28'},{'image':'terrain_view_overlay.jpg','caption':'DEM prediction (red): broad agreement; cliff edge is not exact'}]}
(b/'evidence_spec.json').write_text(json.dumps(spec,indent=2))
r={'place':'제주 서귀포시 안덕면 사계리 사계해안, 사계항 서쪽 암반 지대','lat':at[0],'lon':at[1],'datum':'WGS84','radius_m':200,'heading_deg':220,'confidence':{'city':'high','area':'high','shore_segment':'medium','exact_point':'low'},'uncertainty':'Radius is a practical approximate search range, not statistical confidence. Sea-level tide and camera height are uncertain; no exact rock match.','reverse_image_search':'Not performed; intake --no-rev. Only text and keyword-image searches plus local comparison.','coverage':'9 keyword-sourced public reference photos;22 harbor panoramas and73 coast panoramas, with possible overlap across batches. Not an exhaustive all-Jeju survey.','methods':['DINOv2 local ranking; no strong SIFT confirmation','z18 satellite shore and road layout','Google road panoramas looking southwest','DEM profile view at representative shoreline position','pose projection using sea horizon408px'],'alternatives':['Nearby positions along the same pale layered shore remain plausible.','Gwangchigi and inland Sagye namesakes are downweighted, not formally excluded.'],'sources':['https://www.jejunews.com/news/articleView.html?idxno=2213152','https://m.visitjeju.net/en/detail/view?contentsid=CONT_000000000500275'],'evidence':'evidence.jpg'}
(b/'result.json').write_text(json.dumps(r,ensure_ascii=False,indent=2),encoding='utf-8')
print('prepared representative position; pitch',pitch)
