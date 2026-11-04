import math,json
cam=[37.814194,128.897465]
def bearing(ll):
    p1,p2=map(math.radians,[cam[0],ll[0]]); d=math.radians(ll[1]-cam[1]); return math.degrees(math.atan2(math.sin(d)*math.cos(p2),math.cos(p1)*math.sin(p2)-math.sin(p1)*math.cos(p2)*math.cos(d)))%360
b1=bearing([37.814183,128.898270]); b2=bearing([37.804258,128.90778])
best=None
for i in range(1,5000):
    h=b1+(b2-b1)*i/5000; f=200/math.tan(math.radians(h-b1)); u=720+f*math.tan(math.radians(b2-h)); err=abs(u-1403)
    if best is None or err<best[0]: best=(err,h,f)
err,h,f=best
pitch=math.degrees(math.atan((290-405)/f))
out={'camera':cam,'heading':h,'hfov':math.degrees(2*math.atan(720/f)),'focal_px':f,'note':'Conditional fit to lookout x520 and assumed Skybay roof x1403, NOT independent camera localization. Heights and sea horizon uncertain.'}
open('conditional-horizontal.json','w',encoding='utf-8').write(json.dumps(out,indent=2))
pose={'_frame':{'frame':'upright','image_size':[1440,810],'lat0':cam[0],'lon0':cam[1]},'_params':[0,0,3.6,h,pitch,-2,f],'note':out['note']}
open('pose-conditional.json','w',encoding='utf-8').write(json.dumps(pose,indent=2))
print(json.dumps(out))
