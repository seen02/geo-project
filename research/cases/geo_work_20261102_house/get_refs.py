from pathlib import Path
import json,re,urllib.request,concurrent.futures
p=Path(__file__).parent
urls=[('BiPa_gallery','https://nol.yanolja.com/stay/domestic/10056014'),('BiPa_banlife','https://ban-life.com/accommodation/15663')]
found=[]
for name,url in urls:
 try:
  req=urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0'})
  html=urllib.request.urlopen(req,timeout=25).read().decode('utf-8','replace')
  (p/(name+'.html')).write_text(html,encoding='utf-8')
  matches=re.findall(r'https?:[^\s<>"\\]+?\.(?:jpg|jpeg|png)(?:\?[^\s<>"\\]*)?',html)
  matches=list(dict.fromkeys(x.replace('&amp;','&') for x in matches if 'yaimg' in x or 'ban-life' in x))
  print(name,len(matches))
  found.extend({'source':url,'url':v,'name':name} for v in matches[:35])
 except Exception as e:print(name,str(e))
(p/'refs').mkdir(exist_ok=True)
def get(q):
 i,r=q
 try:
  data=urllib.request.urlopen(urllib.request.Request(r['url'],headers={'User-Agent':'Mozilla/5.0'}),timeout=20).read()
  file=p/'refs'/f'{i:02}.jpg';file.write_bytes(data);return dict(r,file=str(file),id=str(i))
 except Exception as e:return dict(r,error=str(e))
out=list(concurrent.futures.ThreadPoolExecutor(8).map(get,enumerate(found)))
(p/'refs.json').write_text(json.dumps(out,indent=2),encoding='utf-8')
print('Downloaded',sum('file' in q for q in out))
