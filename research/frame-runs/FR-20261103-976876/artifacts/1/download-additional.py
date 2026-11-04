import urllib.request,pathlib,json
from PIL import Image
sources=[('sw-building.jpg','https://swuniv.hs.ac.kr/images/sub/01/sub01_05_img01.jpg'),('news-building.jpg','https://images.christiandaily.co.kr/data/images/full/89732/image.jpg')]
for f,u in sources:
 try:
  raw=urllib.request.urlopen(u,timeout=25).read();pathlib.Path('official/'+f).write_bytes(raw);im=Image.open('official/'+f);print(f,im.size);im.verify()
 except Exception as e:print(f,type(e).__name__,str(e))
pathlib.Path('additional-sources.json').write_text(json.dumps(sources,indent=2),encoding='utf-8')
