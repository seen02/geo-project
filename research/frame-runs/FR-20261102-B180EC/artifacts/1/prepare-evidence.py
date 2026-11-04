import json,pathlib
spec={'map':'location-map.jpg','width':1280,'labels':[{'at':[37.1837772,127.0195036],'text':'Bojeoksa: landmark point, camera unverified','color':'#ffdd55','dx':-450,'dy':-80}], 'panels':[{'image':'skyline.png','caption':'Supplied photo: skyline crop; camera unverified'},{'image':'duksan-2.jpg','caption':'Published Doksanseong view: blackforest.tistory.com/421'},{'image':'cultural-comparison.jpeg','caption':'Independent view: Gyeonggi Cultural Foundation / Yoo Seunghye'}]}
pathlib.Path('evidence-spec.json').write_text(json.dumps(spec,ensure_ascii=False,indent=2),encoding='utf-8')
measure={'method':'Manual tower center columns, followed by normalization; approximate pixel readings only','reference_columns':[716,735,762,781],'published_columns':[621,679,770,829]}
for key,cols in [('reference','reference_columns'),('published','published_columns')]:
 x=measure[cols];measure[key+'_normalized_gaps']=[round((x[i+1]-x[i])/(x[-1]-x[0]),3) for i in range(3)]
pathlib.Path('tower-comparison.json').write_text(json.dumps(measure,indent=2),encoding='utf-8')
