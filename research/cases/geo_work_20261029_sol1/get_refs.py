from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
import urllib.request,json
urls=[
('Sagye official south view','https://api.cdn.visitjeju.net/photomng/imgpath/202111/15/98292dc5-c8b9-4ca5-891f-cd095a5431ec.webp'),
('Sagye official coast','https://api.cdn.visitjeju.net/photomng/imgpath/202111/15/2ead4897-42a3-4769-8959-f7fd77990078.webp'),
('Sagye beach KTO','https://tong.visitkorea.or.kr/cms/resource/67/2800667_image2_1.jpg'),
('Sagye rocks','https://media.triple.guide/triple-cms/c_limit%2Cf_auto%2Ch_1024%2Cw_1024/843fcbc8-6b8a-46ad-992b-82ebd8802d17.jpeg'),
('Sagye trip south','https://ak-d.tripcdn.com/images/1mi5t224x8v7uy7bkFC91.jpg?proc=source%2Ftrip'),
('Sagye layered rocks','https://t1.daumcdn.net/brunch/service/user/17Gb/image/ay6cSRycPh0YmuZxUu04Rr8MmoQ'),
('Sagye beach south','https://t1.daumcdn.net/brunch/service/user/17Gb/image/KrnuHkXvm78Y5yPlm_RZZKjqrr8'),
('Seopjikoji','https://cdn.imweb.me/upload/S201802145a83a6028d5cf/d3d2c38b16cde.jpg'),
('Sagye news','https://www.jejunews.com/news/photo/202408/2213152_240458_1811.jpg')]
Path('refs').mkdir(exist_ok=True)
def get(it):
 i,(label,url)=it;p=Path(f'refs/{i:02}.jpg')
 try:p.write_bytes(urllib.request.urlopen(url,timeout=30).read());return {'label':label,'url':url,'file':str(p)}
 except Exception as e:return {'label':label,'error':str(e)}
r=list(ThreadPoolExecutor(8).map(get,enumerate(urls)))
Path('refs.json').write_text(json.dumps(r,indent=2));print(json.dumps(r,indent=2))
