import json, math
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageOps

p=Path(__file__).parent
font=ImageFont.truetype('C:/Windows/Fonts/arial.ttf',22)
small=ImageFont.truetype('C:/Windows/Fonts/arial.ttf',17)
files=sorted((p/'intake/edges').glob('*.jpg'))
sheet=Image.new('RGB',(1200,700),'#20252d')
d=ImageDraw.Draw(sheet)
for i,f in enumerate(files):
    im=Image.open(f).convert('RGB'); im.thumbnail((294,300))
    x=(i%4)*300; y=(i//4)*350
    sheet.paste(im,(x+(300-im.width)//2,y+35+(300-im.height)//2))
    d.text((x+5,y+5),f.stem,font=small,fill='white')
sheet.save(p/'edge_review.jpg')

# Crops retain original aspect ratio. Numbered boxes identify permanent features.
specs=[('query.jpg',(0,560,1081,1040),'User photo',[(700,590,1075,704),(10,615,60,650),(340,905,605,1030)]),
       ('forum_reference.jpg',(420,560,1824,1184),'Public reference (different capture)',[(1525,610,1823,720),(542,638,610,688),(420,1100,560,1180)])]
for i,(file,crop,title,boxes) in enumerate(specs):
    im=Image.open(p/file).convert('RGB')
    if file=='forum_reference.jpg':
        scale=im.width/1824
        crop=tuple(round(v*scale) for v in crop)
        boxes=[tuple(round(v*scale) for v in box) for box in boxes]
    dr=ImageDraw.Draw(im)
    for j,box in enumerate(boxes[:2],1):
        dr.rectangle(box,outline='#ffcc33',width=5)
        dr.rectangle((box[0],box[1]-29,box[0]+28,box[1]),fill='#ffcc33')
        dr.text((box[0]+5,box[1]-27),str(j),font=font,fill='black')
    im.crop(crop).save(p/f'comparison_{i}.jpg',quality=94)

cam=[35.6366,139.7574]
f=1081/(2*math.tan(math.radians(70/2)))
pitch=math.degrees(math.atan2(625-720,f))
pose={'_frame':{'frame':'upright','image_size':[1081,1440],'lat0':cam[0],'lon0':cam[1]},'_params':[0,0,30,185,pitch,0,f],
      'note':'Illustrative self-check only. Camera altitude 30m and HFOV70 are assumptions, not solved measurements. Distant flat-water/sky row625 is approximate. Does not fix position along the loop.'}
(p/'pose_assumed.json').write_text(json.dumps(pose,indent=2),encoding='utf-8')
points=[{'name':'quay_NE_unidentified','ll':[35.633729708,139.757916927],'h':0},
        {'name':'quay_NW_unidentified','ll':[35.633598909,139.755154252],'h':0}]
(p/'projection_points.json').write_text(json.dumps(points,indent=2),encoding='utf-8')
(p/'pose_limits.txt').write_text('The projected quay points have NOT been assigned observed image pixels and are not independent position constraints. Ground DEM elevation near loop was approximately 1m; this is not elevated railway camera altitude. The assumed 30m camera altitude is unverified. Actual projection convention gives horizon H/2+f*tan(pitch)=625. pose.py sanity horizon messages use the opposite sign; its automatic warning must not be interpreted as a geolocation rejection. Exact heading, height, field of view and position remain unsolved. Final output is a 300m area, not a solved camera point.',encoding='utf-8')
spec={'map':'loop_detail.jpg','width':1280,'crop':[0,100,1280,1000],
      'camera':cam,'heading':185,'hfov':80,'range_m':280,
      'labels':[{'at':cam,'text':'Approx. loop section; radius 300m','dx':-690,'dy':-65,'color':'#ffcc33'},
                {'at':[35.6372,139.7563],'text':'Shibaura loop','dx':-250,'dy':-40},
                {'at':[35.6361,139.7579],'text':'Southward view (approx.)','dx':-400,'dy':100}],
      'panels':[{'image':'comparison_0.jpg','caption':'User photo: 1 factory/conveyors; 2 white waterfront structure'},
                {'image':'comparison_1.jpg','caption':'Public reference: matching structures and guideway curve'}]}
(p/'evidence_spec.json').write_text(json.dumps(spec,indent=2),encoding='utf-8')
refs=json.loads((p/'refs.json').read_text(encoding='utf-8'))
refs.append({'name':'Matching Yurikamome loop scene','file':'refs/07.jpg','page':'https://jnsforum.com/community/topic/20751-ed75s-random-japanese-trip-photos/page/3/','url':'https://jnsforum.s3.amazonaws.com/monthly_2025_01/IMG_7612.JPG.f19f617f95e39c4cc2bece9620dee164.JPG','discovery':'Text/keyword search; no image uploaded'})
(p/'refs_final.json').write_text(json.dumps(refs,indent=2),encoding='utf-8')
print('Prepared edge review, comparison panels, evidence spec and explicitly limited projection inputs.')
