from PIL import Image,ExifTags
import json,pathlib
im=Image.open('reference.jpg');ex=im.getexif();result={}
for ifd in [ExifTags.IFD.Exif,ExifTags.IFD.GPSInfo]:
 d=ex.get_ifd(ifd);name=ifd.name
 result[name]={str((ExifTags.GPSTAGS if name=='GPSInfo' else ExifTags.TAGS).get(k,k)):str(v) for k,v in d.items() if k not in [37500,37510]}
pathlib.Path('exif-detail.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(result,ensure_ascii=False,indent=2))
