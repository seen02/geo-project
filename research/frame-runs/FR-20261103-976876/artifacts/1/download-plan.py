import urllib.request,pathlib
u='https://www.g2b.go.kr/pn/pnp/pnpe/UntyAtchFile/downloadFile.do?bidPbancNo=R25BK01229961&bidPbancOrd=000&fileSeq=6&fileType=&prcmBsneSeCd=07'
try:
 r=urllib.request.urlopen(u,timeout=30); b=r.read();print(r.status,r.headers.get('Content-Type'),len(b),b[:20]);pathlib.Path('campus-plans.pdf').write_bytes(b)
except Exception as e: print(type(e).__name__,str(e))
