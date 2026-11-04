import sys,json,math
from pathlib import Path
import numpy as np
from PIL import Image,ImageDraw,ImageFont
sys.path.insert(0,r'C:\Users\admin\.codex\skills\geo-sleuth\scripts')
import pose
base=Path(__file__).parent
lat,lon=37.1843,127.0223
spec=json.loads((base/'pose_spec.json').read_text())
pts=spec['points']
for p in pts:p['h']+=25 # replace initial ground assumption 40 m with measured 65 m
kx,ky=pose._frame(lat)
enu=np.array([[(p['ll'][1]-lon)*kx,(p['ll'][0]-lat)*ky,p['h']] for p in pts])
obs=np.array([p['px'] for p in pts])
p0=np.array([0,0,125.6,61,8,0,720/math.tan(math.radians(67/2))])
p,cost,_=pose.lm(p0,[3,4,5,6],enu,obs,1440,810)
pred,z=pose.project(p,enu,1440,810)
result={'_frame':{'lat0':lat,'lon0':lon,'image_size':[1440,810],'frame':'upright'},'_params':p.tolist(),'location':[lat,lon],'height':125.6,'heading':p[3],'pitch':p[4],'roll':p[5],'hfov':math.degrees(2*math.atan(720/p[6])),'rms_px':math.sqrt(cost/len(pts)),'caution':'Camera position fixed from street-view candidate; fit is only a consistency test, not independent localization. Tower caps, footprints and elevations have uncertainty. No sea horizon is visible. pose.sanity horizon formula has opposite sign to pose.project; actual projection is used.'}
result['features']=[{'name':q['name'],'observed':q['px'],'projected':uv.tolist()} for q,uv in zip(pts,pred)]
result['horizon_row_from_projection']=405+p[6]*math.tan(math.radians(p[4]))
(base/'final_pose.json').write_text(json.dumps(result,indent=2))
(base/'final_points.json').write_text(json.dumps(pts,indent=2))
print(json.dumps({k:v for k,v in result.items() if not k.startswith('_')},indent=2))

# Compare identical persistent features; these are annotations, not generated imagery.
font=ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf',22)
photo=Image.open(r'C:\Users\admin\img2place_project\geo_slueth_test\terrain_test_images\KakaoTalk_20261028_142436521_01.jpg').convert('RGB')
street=Image.open(base/'street_top.jpg').convert('RGB')
print('street image size',street.size)
for im,boxes,name in [(photo,[(704,508,794,574,'1'),(802,568,931,610,'2'),(1080,548,1291,612,'3'),(1180,767,1265,810,'4')],'photo_annotated.jpg'),(street,[(488,362,553,412,'1'),(557,403,663,433,'2'),(750,389,928,442,'3'),(790,543,852,576,'4')],'street_annotated.jpg')]:
    if im is street and im.width!=1024:
        boxes=[(int(a*im.width/1024),int(b*im.height/576),int(c*im.width/1024),int(d*im.height/576),t) for a,b,c,d,t in boxes]
    draw=ImageDraw.Draw(im)
    for x0,y0,x1,y1,t in boxes:
        draw.rectangle((x0,y0,x1,y1),outline='#ffce32',width=3)
        yy=max(0,y0-27)
        draw.rectangle((x0,yy,x0+25,yy+26),fill='#ffce32')
        draw.text((x0+5,yy),t,font=font,fill='black')
    im.save(base/name,quality=94)

ev={'map':'doksan_detail.jpg','crop':[250,100,1600,1150],'width':1280,'camera':[lat,lon],'heading':61,'hfov':67,'range_m':200,'labels':[{'at':[lat,lon],'text':'Estimated area (+/-150 m)','dx':-600,'dy':-90},{'at':[37.1824,127.0212],'text':'Bojeoksa / Doksanseong','dx':-300,'dy':55}],'panels':[{'image':'photo_annotated.jpg','caption':'User photo: 1 towers | 2 golf net | 3 apartments | 4 small roof'},{'image':'street_annotated.jpg','caption':'Google Street View nearby: same skyline and foreground roof'}]}
(base/'evidence_spec.json').write_text(json.dumps(ev,indent=2))
