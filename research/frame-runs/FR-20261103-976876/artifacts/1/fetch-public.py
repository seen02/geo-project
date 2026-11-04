import urllib.request, pathlib, re, json
url='https://www.hs.ac.kr/kor/4891/subview.do'
raw=urllib.request.urlopen(url,timeout=30).read()
pathlib.Path('campus-tour.html').write_bytes(raw)
s=raw.decode('utf-8')
for line in s.splitlines():
 if any(x in line.lower() for x in ['.jpg','.png','campus','tour','장공관','송암관','만우관']):
  print(line[:800])
