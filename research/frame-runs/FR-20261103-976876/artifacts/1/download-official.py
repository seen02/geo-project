import re,json,pathlib,urllib.request,urllib.parse
from PIL import Image,ImageOps,ImageDraw
s=pathlib.Path('campus-tour.html').read_text(encoding='utf-8')
items=[]
pathlib.Path('official').mkdir(exist_ok=True)
for i in range(1,16):
 def val(k):
  m=re.search(r'id="'+k+'_'+str(i)+r'" value="([^"]*)"',s); return m.group(1) if m else ''
 item={k:val(k) for k in ['artclSj','longitude','latitude','imgPath','changeNm']}
 url='https://www.hs.ac.kr'+item['imgPath']+item['changeNm']
 item['url']=url
 try:
  raw=urllib.request.urlopen(urllib.parse.quote(url,safe=':/%'),timeout=25).read()
  f=f'official/building-{i:02d}.jpg';pathlib.Path(f).write_bytes(raw); im=Image.open(f);im.verify();item['file']=f
 except Exception as e: item['error']=str(e)
 items.append(item)
pathlib.Path('official-sources.json').write_text(json.dumps(items,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(items,ensure_ascii=False,indent=2))
imgs=[]
for f in pathlib.Path('intake/edges').glob('*.jpg'):
 im=Image.open(f);im.thumbnail((360,420));imgs.append((f.name,im.copy()))
out=Image.new('RGB',(1440,920),'white');d=ImageDraw.Draw(out)
for i,(name,im) in enumerate(imgs):
 x=(i%4)*360;y=(i//4)*460;out.paste(im,(x,y+30));d.text((x+5,y+5),name,fill='black')
out.save('edges-sheet.jpg')
