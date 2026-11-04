import json,pathlib,math
from PIL import Image,ImageOps,ImageDraw,ImageFont
font=ImageFont.truetype('C:/Windows/Fonts/arial.ttf',23)
small=ImageFont.truetype('C:/Windows/Fonts/arial.ttf',18)
ref=ImageOps.exif_transpose(Image.open('reference.jpg')).convert('RGB')
def panel(name,right,crop,title,leftmarks,rightmarks,foot):
 out=Image.new('RGB',(1400,760),'#ffffff');d=ImageDraw.Draw(out)
 d.text((20,12),title,font=font,fill='black')
 a=ref.crop((0,1650,2252,3500));a=ImageOps.contain(a,(680,620));out.paste(a,(10,65))
 b=Image.open(right).convert('RGB');b=b.crop(crop) if crop else b;b=ImageOps.contain(b,(680,620));out.paste(b,(710,65))
 for marks,ox,oy,origsize,size in [(leftmarks,10,65,(2252,1850),a.size),(rightmarks,710,65,((crop[2]-crop[0],crop[3]-crop[1]) if crop else Image.open(right).size),b.size)]:
  for text,x,y in marks:
   xx=ox+x*size[0]/origsize[0];yy=oy+y*size[1]/origsize[1]
   d.ellipse((xx-18,yy-18,xx+18,yy+18),fill='#ffdd44',outline='black',width=2);d.text((xx-8,yy-13),text,font=font,fill='black')
 d.text((20,690),'A: curved planter   B: southeast crossing   C: transverse white road marking',font=small,fill='black')
 d.text((20,723),foot,font=small,fill='black');out.save(name)
panel('comparison-layout.jpg','camera-satellite.jpg',(580,590,800,810),'1. Original view / north-up satellite: frontage layout', [('A',1100,1500),('B',2130,550),('C',1510,570)],[('A',105,128),('B',162,108),('C',145,94)],'Source: original photo / Google satellite, zoom 19. Approximate feature positions.')
panel('comparison-building.jpg','official/building-03.jpg',None,'2. Original view / official exterior: same curved entrance landscaping',[('A',1100,1500),('B',2130,550)],[('A',98,221),('B',43,247)],'Source: Hanshin University official campus tour. Exterior view faces toward the building; floor unresolved.')
log=json.loads(pathlib.Path('verification-log.json').read_text(encoding='utf-8'))
log['geometry']={'terrain_camera_m':54,'terrain_road_m':49,'pose_fit':'RMS 122 px; unstable 80 m camera height and -58 deg pitch rejected; point heights/identifications insufficient','height_comparison':'GPS fixed, 5 heights tested; high residual and confounded pitch prevent a floor claim','heading':'T marking bearing + reference x gives 41.2-42.0 deg conditional on GPS and approximate tie point','hfov':'23mm equivalent plus 4000x2252 portrait crop -> approx 45.8 deg; no calibration','radius':'35 m practical uncertainty covers GPS-to-frontage offset and southeast wing window candidates, not a statistical interval'}
log['plan_download']='g2b PDF fetched 200 and rendered pages 33-34; no correspondence establishes a floor'
pathlib.Path('verification-log.json').write_text(json.dumps(log,ensure_ascii=False,indent=2),encoding='utf-8')
spec={'map':'camera-satellite.jpg','width':1280,'camera':[37.1926194,127.0277161],'heading':42,'hfov':46,'range_m':100,'labels':[{'at':[37.1926194,127.0277161],'text':'Camera estimate / uncertainty radius 35 m','dx':-220,'dy':90},{'at':[37.1927387,127.0273697],'text':'Jangjunha Unification Hall (18)','dx':-280,'dy':-130},{'at':[37.1927944,127.0280188],'text':'B: southeast crossing','dx':30,'dy':-90}],'panels':[{'image':'comparison-layout.jpg','caption':'Layout correspondence. Google satellite imagery; original photo on left.'},{'image':'comparison-building.jpg','caption':'Official university exterior comparison. Exact window and floor are unverified.'}]}
pathlib.Path('evidence-spec.json').write_text(json.dumps(spec,ensure_ascii=False,indent=2),encoding='utf-8')
