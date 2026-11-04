from pathlib import Path
from bs4 import BeautifulSoup
import json, re, sys
from urllib.request import urlopen
from concurrent.futures import ThreadPoolExecutor

refs=[]
for fn in ['yangsan.html','doksan_blog.html','doksan.html']:
    soup=BeautifulSoup(Path(fn).read_text(encoding='utf-8'),'html.parser')
    for s in soup.find_all(string=re.compile('메타폴리스|동탄.*(풍경|조망|시내)|양산봉에서')):
        imgs=s.find_parent().find_all_previous('img',limit=2)
        imgs+=s.find_parent().find_all_next('img',limit=2)
        for im in imgs:
            u=im.get('src','')
            if 'thumb/' in u and 'hanmesoft' in u:
                u=re.sub(r'/thumb/(.+?)/\d+px-[^/]+$',r'/\1',u)
            if u.startswith('http') and u not in [r['url'] for r in refs]:
                refs.append({'url':u,'caption':str(s).strip()[:110],'source':fn})
Path('refs.json').write_text(json.dumps(refs,ensure_ascii=False,indent=2),encoding='utf-8')
if '--download' in sys.argv:
    Path('refs').mkdir(exist_ok=True)
    def get(item):
        i,r=item
        try:
            p=Path(f'refs/{i:02d}.jpg'); p.write_bytes(urlopen(r['url'],timeout=25).read()); r['image']=str(p)
        except Exception as e:r['error']=str(e)
    list(ThreadPoolExecutor(6).map(get,enumerate(refs)))
    Path('refs.json').write_text(json.dumps(refs,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(refs,ensure_ascii=False,indent=2))
