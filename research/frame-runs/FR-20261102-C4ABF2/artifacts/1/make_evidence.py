import json
from PIL import Image,ImageDraw
def mark(src,out,points):
    im=Image.open(src).convert('RGB');d=ImageDraw.Draw(im)
    for x,y,t in points:
        d.ellipse((x-14,y-14,x+14,y+14),outline='yellow',width=4); d.text((x+18,y-8),t,fill='yellow',stroke_width=1,stroke_fill='black')
    im.save(out,quality=94)
mark('reference.jpg','reference-annotated.jpg',[(515,250,'1 Finned lookout'),(272,315,'2 Pastel blocks'),(710,285,'3 Arched shelters')])
mark('comparison/public3.jpg','comparison/public3-annotated.jpg',[(630,280,'1 Finned lookout'),(175,480,'2 Pastel blocks'),(1080,430,'3 Arched shelter')])
mark('comparison/municipal1.jpg','comparison/municipal1-annotated.jpg',[(180,85,'1'),(360,130,'2'),(117,125,'3')])
spec={'map':'satellite-north.jpg','width':1440,'camera':[37.814194,128.897465],
'labels':[{'at':[37.814194,128.897465],'text':'Camera; radius ~50 m','color':'#ffff00','dx':-180,'dy':-120},{'at':[37.814183,128.898270],'text':'Lookout','color':'#00ffff','dx':60,'dy':110}],
'lines':[{'from':[37.814194,128.897465],'bearing':103,'length_m':100,'color':'#ffdd00'}],
'panels':[{'image':'reference-annotated.jpg','caption':'Reference: 1 lookout, 2 pastel blocks, 3 arched shelters'},
{'image':'comparison/public3-annotated.jpg','caption':'North-side public photo: same fixed structures; Ardent News / source photo'},
{'image':'comparison/municipal1-annotated.jpg','caption':'Opposite-side comparison: Gangneung City photo / JoongAng, 2021-07-02'}]}
open('evidence-spec.json','w',encoding='utf-8').write(json.dumps(spec,ensure_ascii=False,indent=2))
