from PIL import Image,ImageDraw
im=Image.open('camera-satellite.jpg').crop((450,500,850,900)).resize((1200,1200))
d=ImageDraw.Draw(im)
for x in range(450,851,25):
 a=(x-450)*3;d.line((a,0,a,1200),fill=(255,255,0),width=1);d.text((a+2,4),str(x),fill=(255,0,0))
for y in range(500,901,25):
 a=(y-500)*3;d.line((0,a,1200,a),fill=(255,255,0),width=1);d.text((2,a+3),str(y),fill=(255,0,0))
d.ellipse(((645-450)*3-10,(757-500)*3-10,(645-450)*3+10,(757-500)*3+10),outline='red',width=4)
im.save('satellite-grid.jpg')
