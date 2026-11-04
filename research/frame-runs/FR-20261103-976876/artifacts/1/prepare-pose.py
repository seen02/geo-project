import json,math,pathlib
m=json.loads(pathlib.Path('detail-satellite.json').read_text())
def ll(x,y):
 n=2**m['zoom'];return [math.degrees(math.atan(math.sinh(math.pi*(1-2*(m['origin_tile'][1]+y/256)/n)))),(m['origin_tile'][0]+x/256)/n*360-180]
controls=[('T-centerline',[1515,2218],[435,348],49),('T-curb',[1608,2635],[404,383],49),('Crosswalk-NW',[1835,1920],[492,326],49),('Lamp-base',[900,2820],[338,365],49),('Planter-near',[900,3250],[347,415],49.7)]
pts=[{'name':name,'px':px,'ll':ll(*xy),'h':h} for name,px,xy,h in controls]
spec={'frame':'upright','image_size':[2252,4000],'points':pts,'init':{'at':ll(325,460),'height':55,'heading':42,'pitch':-20,'roll':0,'hfov':45.8},'fix':['hfov','roll']}
pathlib.Path('pose-controls.json').write_text(json.dumps(spec,indent=2),encoding='utf-8')
pathlib.Path('project-points.json').write_text(json.dumps(pts,indent=2),encoding='utf-8')
print(json.dumps(spec,indent=2))
