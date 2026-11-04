import json,urllib.request,concurrent.futures
from pathlib import Path
p=Path(__file__).parent;(p/'exteriors').mkdir(exist_ok=True)
items=[
('BiPa autumn','https://files.ban-life.com/accommodation/2025/01/045b63ed03-3452-44a8-939b-04bc2131cba4.jpg'),
('BiPa listed image','https://yaimg.yanolja.com/v5/2025/04/20/10/640/6804d22fb39d04.02599854.jpg'),
('Uljin cabin','https://image.withstatic.com/166/9/139/579d0eb6b5a9469eaf9eb9136e17ebe3.jpg'),
('Geumsan cabin','https://d1pviohoskiraj.cloudfront.net/room/0aa111ba-6bdd-40fc-bce4-80a31ef89fbe.jpg?b=samsamm2&d=750x560'),
('Danyang Raonsol','https://yaimg.yanolja.com/v5/2024/09/02/18/1280/66d5fe4f831676.41056339.jpg'),
('Wonju forest','https://d2mgzmtdeipcjp.cloudfront.net/files/waus/2025/05/10/1746808585613.jpg?s=540x540&t=outside'),
('Pohang cabin','https://yaimg.yanolja.com/v5/2024/06/17/16/66705fb3058710.97858878.jpg'),
('Wanju cottage','https://media.triple.guide/triple-cms/c_limit%2Cf_auto%2Ch_1024%2Cw_1024/f73c509a-95c4-4348-aab4-55c9f1f687de')]
def get(q):
 i,(name,url)=q;r={'name':name,'url':url}
 try:
  data=urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0'}),timeout=20).read();f=p/'exteriors'/f'{i:02}.jpg';f.write_bytes(data);r['file']=str(f)
 except Exception as e:r['error']=str(e)
 return r
r=list(concurrent.futures.ThreadPoolExecutor(8).map(get,enumerate(items)))
(p/'exteriors.json').write_text(json.dumps(r,indent=2));print('Downloaded',sum('file' in q for q in r),'of',len(r))
