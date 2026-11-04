import json,math,pathlib
m=json.loads(pathlib.Path('camera-satellite.json').read_text())
def xy(lat,lon):
 n=2**m['zoom'];return [(lon+180)/360*n*256-m['origin_tile'][0]*256,(1-math.asinh(math.tan(math.radians(lat)))/math.pi)/2*n*256-m['origin_tile'][1]*256]
print('GPS pixel',xy(37.1926194,127.0277161))
for p in json.loads(pathlib.Path('official-sources.json').read_text(encoding='utf-8')):
 print(p['artclSj'],xy(float(p['latitude']),float(p['longitude'])))
