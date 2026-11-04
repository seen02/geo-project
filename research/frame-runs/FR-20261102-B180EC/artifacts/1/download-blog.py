import pathlib,re,json,urllib.request,concurrent.futures,html
s=pathlib.Path('duksan-blog.html').read_text(encoding='utf-8')
items=[]
for t in re.findall(r'<img\b[^>]*>',s):
 if any(x in t for x in ['메타폴리스','정상 View','DSR']):
  u=html.unescape(re.search(r'src="([^"]+)"',t).group(1)); alt=re.search(r'alt="([^"]+)"',t).group(1)
  name='duksan-'+str(len(items))+'.jpg';items.append((name,u,alt))
def get(it):
 name,u,alt=it
 try:
  req=urllib.request.Request(u,headers={'User-Agent':'Mozilla/5.0','Referer':'https://blackforest.tistory.com/421'})
  data=urllib.request.urlopen(req,timeout=20).read();pathlib.Path(name).write_bytes(data)
  return {'file':name,'url':u,'caption':alt,'bytes':len(data)}
 except Exception as e:return {'file':name,'url':u,'caption':alt,'error':str(e)}
r=list(concurrent.futures.ThreadPoolExecutor(4).map(get,items));pathlib.Path('duksan-images.json').write_text(json.dumps(r,ensure_ascii=False,indent=2),encoding='utf-8');print(json.dumps(r,ensure_ascii=False))
print(pathlib.Path('nominatim-duksan.json').read_text(encoding='utf-8'))
