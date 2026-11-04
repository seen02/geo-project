import json, math, pathlib, re, urllib.request
from PIL import Image, ImageDraw
def download_more():
    s=pathlib.Path('place.html').read_text(encoding='utf-8')
    urls=sorted(set(u.replace('http:','https:') for u in re.findall(r'https?://tong.visitkorea.or.kr[^\s"<>]+',s)))
    pathlib.Path('comparison-sources.txt').write_text('\n'.join(urls),encoding='utf-8')
    for i,u in enumerate(urls):
        try:
            b=urllib.request.urlopen(u,timeout=20).read()
            pathlib.Path(f'comparison/kto{i}.jpg').write_bytes(b)
        except Exception as e: print(u,str(e))
    print('Downloaded',len(urls),'tourism images')
if __name__=='__main__': download_more()
