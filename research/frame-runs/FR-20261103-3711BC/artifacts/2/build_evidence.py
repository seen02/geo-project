import json, math
from pathlib import Path
from PIL import Image, ImageOps, ImageDraw, ImageFont

camera=[37.58332635447713,126.9833964451579]
points={'CameraUpper':camera,'CameraMid':[37.58319694449171,126.983436524374],'CameraLower':[37.58269406776118,126.98362397023158],'CameraNorth':[37.58340361580242,126.98334587482722]}
Path('camera-candidates.json').write_text(json.dumps(points,indent=2),encoding='utf-8')
pose={'_frame':{'lat0':camera[0],'lon0':camera[1],'image_size':[2866,5095],'frame':'upright'},'_params':[0,0,72.6,155,-3,0,1433/math.tan(math.radians(15))]}
Path('pose-consistency.json').write_text(json.dumps(pose,indent=2),encoding='utf-8')
control={'Road_mid_DEM':[37.58319694449171,126.983436524374,70],'Road_lower_DEM':[37.58269406776118,126.98362397023158,64]}
Path('projection-points.json').write_text(json.dumps(control,indent=2),encoding='utf-8')
font=ImageFont.truetype('C:/Windows/Fonts/arial.ttf',22)
bold=ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf',24)
def panel(name,src1,box1,src2,box2,marks1,marks2,title,footer):
    out=Image.new('RGB',(1200,810),'#f3f4f7');d=ImageDraw.Draw(out)
    d.text((20,12),title,font=bold,fill='#182738')
    for idx,(src,box,marks) in enumerate([(src1,box1,marks1),(src2,box2,marks2)]):
        im=Image.open(src).convert('RGB');im=im.crop(box)
        w,h=im.size; scale=min(570/w,665/h); im=im.resize((round(w*scale),round(h*scale)))
        x=15+idx*600+(570-im.width)//2;y=55+(665-im.height)//2
        out.paste(im,(x,y));d=ImageDraw.Draw(out)
        for num,px,py in marks:
            xx=x+(px-box[0])*scale;yy=y+(py-box[1])*scale
            d.ellipse((xx-14,yy-14,xx+14,yy+14),fill='#ffee00',outline='black',width=2)
            d.text((xx-6,yy-13),str(num),font=font,fill='black')
    d.text((20,730),'Reference photo',font=font,fill='black')
    d.text((620,730),'Google Street View - public panorama',font=font,fill='black')
    d.text((20,770),footer,font=font,fill='#26394b')
    out.save(name,quality=94)

ref=Image.open('reference.jpg').convert('RGB').resize((1152,2048))
ref.save('reference-display.jpg',quality=96)
# Mark physical geometry, not people, signs or sky color.
panel('comparison-panel-roofs.jpg','reference-display.jpg',(0,450,1152,1510),'sv-top.jpg',(0,140,512,690),
      [(1,120,570),(2,470,1020),(3,80,1290)],[(1,73,182),(2,177,369),(3,91,570)],
      'A | Gable roof, repeated eaves and geometric wall frieze',
      '1 Gable + timber frame   2 Repeated tiled eaves   3 Red/white wall pattern')
panel('comparison-panel-depth.jpg','reference-display.jpg',(220,800,1010,1470),'sv-south.jpg',(20,240,490,640),
      [(1,572,967),(2,863,1121),(3,683,1240)],[(1,124,310),(2,260,365),(3,180,460)],
      'B | Downhill sequence; lower panorama is a nearby viewpoint',
      '1 Roof sequence   2 End-of-lane gate   3 Continuous wall; viewpoint differs')
spec={'map':'satellite.jpg','width':1280,'camera':camera,'range_m':100,
      'labels':[{'at':camera,'text':'Camera estimate | radius ~25 m','color':'#ffee00','dx':-360,'dy':-50},
                {'at':points['CameraMid'],'text':'Adjacent panorama (14.8 m)','color':'#00ffff','dx':-330,'dy':35}],
      'lines':[{'from':camera,'bearing':155,'length_m':100,'color':'#ff5577'},
               {'from':camera,'bearing':164.1,'length_m':73.1,'color':'#00ffff'}],
      'panels':[{'image':'comparison-panel-roofs.jpg','caption':'Ground-level comparison A | Google Street View / reference'},
                {'image':'comparison-panel-depth.jpg','caption':'Ground-level comparison B | adjacent panorama / reference'}],
      'attribution':'Satellite and panoramas: Google Maps; reference supplied by user. Source links in verification-notes.json.',
      'heading_note':'Pink line: approximate camera heading 155 degrees. Cyan: road axis. No view cone: hfov unknown.'}
Path('evidence-spec.json').write_text(json.dumps(spec,indent=2),encoding='utf-8')
notes={'camera_estimate':camera,'radius_m':25,'heading_estimate':155,'hfov_reported':None,
       'heading_basis':'Panorama orientation renders 150-165 degrees and downward alley axis 164.1-166.2 degrees; original is aimed left of the alley axis. Approximate heading, not a measured optical axis.',
       'radius_basis':'Top and adjacent panorama are 14.8 m apart; north historical panorama is approximately 10 m away. Gable timber frame, stepped tiled eaves, wall frieze and end gate support this short segment. 25 m includes along-street, sidewalk and panorama geotag uncertainty; not a statistical confidence interval.',
       'elevation_m':{'upper_ground':71,'upper_eye_assumed':72.6,'mid_ground':70,'lower_ground':64},
       'projection_limit':'30 degree hfov and -3 degree pitch are test hypotheses only; no reliable sea/flat horizon or surveyed roof controls. Fixed-position projection is not independent localization.',
       'streetview_no_data':'A 5 m radius near query returned normal NO_DATA; successful neighboring panorama lookups/renders prove this is not evidence of absent local imagery.',
       'recovery':'Reused current-job intake search images after opening and decoding; previous satellite failed_tiles=25 invalidated. New Google mosaic failed_tiles=0.',
       'sources':[{'title':'Google panorama upper','url':'https://www.google.com/maps/@?api=1&map_action=pano&pano=iji2OHIKbyYu1lSo0NIzdA&heading=155'},
                  {'title':'Google panorama adjacent','url':'https://www.google.com/maps/@?api=1&map_action=pano&pano=LRbVXEQiWAQQhqXko-1Svw&heading=165'},
                  {'title':'Google satellite tiles','url':'https://mt1.google.com/vt/lyrs=s&x=447076&y=203002&z=19'}]}
Path('verification-notes.json').write_text(json.dumps(notes,ensure_ascii=False,indent=2),encoding='utf-8')
print('Evidence spec, two comparison panels and projection inputs saved')
