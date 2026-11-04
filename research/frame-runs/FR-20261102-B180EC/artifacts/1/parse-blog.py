import pathlib,re,json,urllib.request,concurrent.futures
s=pathlib.Path('duksan-blog.html').read_text(encoding='utf-8')
imgs=[]
for m in re.finditer(r'<img\b[^>]*>',s):
 t=m.group()
 if any(x in t for x in ['메타폴리스','정상 View','DSR']):
  print(t[:1800])
# look at stored image captions and preceding image tags
for term in ['독산성 동탄 메타폴리스','독산성 정상 View','독산성 삼성전자 DSR 타워']:
 p=s.find(term)
 print(term,p,s[max(0,p-700):p+300])
print(pathlib.Path('nominatim-duksan.json').read_text()[:4700])
