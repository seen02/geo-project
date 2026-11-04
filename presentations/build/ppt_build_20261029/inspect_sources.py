import zipfile, xml.etree.ElementTree as ET, json, math, sys
sys.stdout.reconfigure(encoding='utf-8')
from pathlib import Path
from collections import Counter
root=Path(r'C:\Users\admin\img2place_project')
build=root/'ppt_build_20261029'
src=Path(r'C:\Users\admin\Desktop\발표 자료\통합_업무_비서_소개_기술설명_부록추가_최종.pptx')
ns={'a':'http://schemas.openxmlformats.org/drawingml/2006/main','p':'http://schemas.openxmlformats.org/presentationml/2006/main'}
with zipfile.ZipFile(src) as z:
 p=ET.fromstring(z.read('ppt/presentation.xml'))
 print('SIZE',p.find('p:sldSz',ns).attrib)
 files=sorted([n for n in z.namelist() if __import__('re').match(r'ppt/slides/slide\d+\.xml$',n)], key=lambda n:int(__import__('re').search(r'(\d+)\.xml',n).group(1)))
 out=[];fonts=Counter();sizes=Counter();colors=Counter()
 for f in files:
  el=ET.fromstring(z.read(f));texts=[t.text or '' for t in el.findall('.//a:t',ns)]
  for t in el.findall('.//a:latin',ns)+el.findall('.//a:ea',ns):fonts[t.get('typeface')]+=1
  for t in el.findall('.//a:rPr',ns):
   if t.get('sz'):sizes[t.get('sz')]+=1
  for t in el.findall('.//a:srgbClr',ns):colors[t.get('val')]+=1
  out.append({'slide':len(out)+1,'text':texts})
 (build/'reference_text.json').write_text(json.dumps(out,ensure_ascii=False,indent=2),encoding='utf-8')
 print('SLIDES',len(files),'FONTS',fonts.most_common(8),'SIZES',sizes.most_common(8),'COLORS',colors.most_common(8))
 for s in out: print(s['slide'],' / '.join(s['text'])[:380])
def distance(a,b):
 la1,lo1,la2,lo2=map(math.radians,(*a,*b));dlat=la2-la1;dlon=lo2-lo1
 h=math.sin(dlat/2)**2+math.cos(la1)*math.cos(la2)*math.sin(dlon/2)**2
 return 6371008.8*2*math.atan2(math.sqrt(h),math.sqrt(1-h))
truth=(37.18428,127.02244)
test=root/'geo_work_20261028_01'
result=json.loads((test/'result.json').read_text(encoding='utf-8'))
road=json.loads((test/'road_matches.json').read_text(encoding='utf-8'))
metrics={'truth':truth,'representative':[result['lat'],result['lon']],'distance_m':distance(truth,(result['lat'],result['lon'])),'street_top_distance_m':distance(truth,road[0]['wgs']),'reported_radius_m':result['radius_m'],'road_count':len(road),'reference_count':len(json.loads((test/'matches.json').read_text(encoding='utf-8')))}
(build/'test_metrics.json').write_text(json.dumps(metrics,ensure_ascii=False,indent=2),encoding='utf-8');print('METRICS',metrics)
