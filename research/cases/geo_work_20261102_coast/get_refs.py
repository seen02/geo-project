from pathlib import Path
import json,urllib.request,concurrent.futures
p=Path(__file__).parent;(p/'refs').mkdir(exist_ok=True)
urls=['https://cdn.ardentnews.co.kr/news/photo/202505/6215_29265_1831.jpg','https://ak-d.tripcdn.com/images/1mi562215ecput2c069C9_R_600_400_R5_Q90.jpg','https://tong.visitkorea.or.kr/cms/resource/41/2921941_image2_1.jpg','https://tong.visitkorea.or.kr/cms/resource/44/2921944_image2_1.jpg','https://ak-d.tripcdn.com/images/1mi38224x8ynfmb6xA1CF.jpg']
def get(q):
 i,u=q
 try:
  data=urllib.request.urlopen(urllib.request.Request(u,headers={'User-Agent':'Mozilla/5.0'}),timeout=20).read();f=p/'refs'/f'{i}.jpg';f.write_bytes(data);return {'id':str(i),'file':str(f),'url':u}
 except Exception as e:return {'url':u,'error':str(e)}
r=list(concurrent.futures.ThreadPoolExecutor(5).map(get,enumerate(urls)));(p/'refs.json').write_text(json.dumps(r,indent=2));print('Downloaded',sum('file'in q for q in r))
