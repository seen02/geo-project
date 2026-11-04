# /// script
# dependencies = ["pillow"]
# ///
import urllib.request,urllib.parse,pathlib,concurrent.futures,math,json
cache=pathlib.Path('.geo-cache/tiles');cache.mkdir(parents=True,exist_ok=True)
lat,lon,z=37.18361,127.01944,18
n=2**z;cx=int((lon+180)/360*n);cy=int((1-math.asinh(math.tan(math.radians(lat)))/math.pi)/2*n)
jobs=[]
for x in range(cx-1,cx+2):
 for y in range(cy-1,cy+2):jobs.append((f'esri_{z}_{x}_{y}.jpg',f'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'))
def get(it):
 name,url=it
 try:
  req=urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0'})
  d=urllib.request.urlopen(req,timeout=18).read();(cache/name).write_bytes(d);return {'file':str(cache/name),'url':url,'bytes':len(d)}
 except Exception as e:return {'url':url,'error':str(e)}
r=list(concurrent.futures.ThreadPoolExecutor(9).map(get,jobs));pathlib.Path('map-download-log.json').write_text(json.dumps(r,indent=2),encoding='utf-8');print(json.dumps(r))
for term,name in [('보적사','bojeoksa-verified.json'),('메타폴리스','metapolis-verified.json')]:
 u='https://nominatim.openstreetmap.org/search?'+urllib.parse.urlencode({'q':term,'countrycodes':'kr','format':'json','limit':5})
 try:
  d=urllib.request.urlopen(urllib.request.Request(u,headers={'User-Agent':'FRAME-location-research/1.0'}),timeout=15).read();pathlib.Path(name).write_bytes(d);print(name,d.decode()[:1500])
 except Exception as e:print(name,str(e))
