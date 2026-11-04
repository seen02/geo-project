import urllib.request, pathlib, json, concurrent.futures
urls={
 'getty.html':'https://www.gettyimages.com/detail/photo/view-of-tree-with-buildings-in-background-royalty-free-image/1189502368',
 'getty.jpg':'https://media.gettyimages.com/photos/view-of-tree-with-buildings-in-background-picture-id1189502368?s=612x612',
 'duksan-blog.html':'https://blackforest.tistory.com/421',
 'tripsavvy.html':'https://www.tripsavvy.com/one-week-in-korea-4802523',
 'nominatim-duksan.json':'https://nominatim.openstreetmap.org/search?q=Doksanseong&format=json',
}
def get(item):
 name,url=item
 try:
  req=urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0 (location-research-demo)'})
  with urllib.request.urlopen(req, timeout=25) as r: data=r.read()
  pathlib.Path(name).write_bytes(data)
  return {'file':name,'url':url,'bytes':len(data)}
 except Exception as e: return {'file':name,'url':url,'error':str(e)}
r=list(concurrent.futures.ThreadPoolExecutor(5).map(get,urls.items()))
pathlib.Path('fetch-log.json').write_text(json.dumps(r,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(r,ensure_ascii=False))
