import urllib.request,pathlib
urls={
'stock-comparison.webp':'https://www.tripsavvy.com/thmb/XNFFVcbVoBsYwocsZWk36jxgTVU=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc():format(webp)/GettyImages-1189502368-829f4efb9f7044399ced57381999ca2f.jpg',
'cultural-comparison.jpeg':'https://ggc.ggcf.kr/uploadimg/2023/resize/614e83401699403611855.jpeg'}
for name,u in urls.items():
 try:
  r=urllib.request.urlopen(urllib.request.Request(u,headers={'User-Agent':'Mozilla/5.0'}),timeout=15)
  d=r.read();pathlib.Path(name).write_bytes(d);print(name,len(d))
 except Exception as e:print(name,str(e))
