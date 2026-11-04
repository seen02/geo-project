from pathlib import Path
import urllib.request,json
from concurrent.futures import ThreadPoolExecutor
u=[('Tokyo sunset','https://assets.st-note.com/production/uploads/images/134966852/picture_pc_b71a0d32dbdd2f164ce1d71e8938c919.jpg'),('Kobe approach','https://blog-imgs-166-origin.fc2.com/o/p/e/opentp2/20240212150123100.jpg'),('Kobe bridge','https://blog-imgs-166-origin.fc2.com/o/p/e/opentp2/20240212150132ccc.jpg'),('Osaka front','https://cdn.4travel.jp/img/thumbnails/imk/travelogue_pict/69/02/17/650x_69021733.jpg?updated_at=1615812412'),('Tokyo factory','https://www.japan-photo.de/ZEMENTWERK-TOKYO.jpg'),('Tokyo factory2','https://stat.ameba.jp/user_images/20250125/22/hideki-megumi/35/9c/j/o2241149415537078414.jpg'),('Kobe industry','https://cdn.amebaowndme.com/madrid-prd/madrid-web/images/sites/798126/ad7270774caa9b1a49b18c5a9b536901_aceb32d66fb07c57dd4ae63e6b4ea83b.jpg?width=640'),('Tokyo guideway','https://files.structurae.net/files/photos/2055/img_19781.jpg')]
Path('refs').mkdir(exist_ok=True)
def one(t):
 i,(name,url)=t;p=Path(f'refs/{i:02}.jpg')
 try:p.write_bytes(urllib.request.urlopen(url,timeout=25).read());return dict(name=name,url=url,file=str(p))
 except Exception as e:return dict(name=name,error=str(e))
r=list(ThreadPoolExecutor(8).map(one,enumerate(u)));Path('refs.json').write_text(json.dumps(r,indent=2));print(json.dumps(r,indent=2))
