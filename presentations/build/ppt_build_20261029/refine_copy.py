import json
from pathlib import Path
p=Path(__file__).parent/'korean_copy.json'
a=json.loads(p.read_text(encoding='utf-8'))
if len(a)==27:
 a.insert(11,{'texts':['거리사진 수집은 후보 좌표를 비교 이미지로 바꿉니다','지점·방향·화각을 지정해, 원본과 대조할 거리사진을 준비합니다','INPUT  입력','PROCESS  처리','OUTPUT  출력','후보 좌표와 탐색 반경\n확인할 방위각 heading\n상하 각도 pitch·화각 fov\n필요한 촬영 시기','gsv.py / baidu_pano.py\n주변 파노라마 지점 조회\n지점의 좌표·날짜·ID 확인\n방향·화각에 맞춰 이미지 생성','파노라마 ID·위치 목록\n방향·시기·좌표를 담은 인덱스\n비교용 JPEG 이미지\nmatch.py에 전달할 items 목록','거리사진 좌표는 그 이미지를 찍은 지점입니다. 원본 사진의 정확한 촬영점과는 다를 수 있습니다','좌표가 있는 비교 이미지가 있어야, 이미지 유사도를 실제 장소 후보에 연결할 수 있습니다']})
a[13]['texts'][6]='pose.py: LM 최소제곱 최적화\n위치·방향·기울기 등 조정\ngeo.py: 시선 교차·구조물 간격\nsun.py: 그림자로 방향 제한'
a[25]['table'][-1][0]='카메라 투영·LM 최적화'
a[25]['table'][-1][1]='기준점과 예측 픽셀의 잔차\n위치·자세와 조건부 오차 반경'
a[12]['texts'][7]='상위 후보 특징점 연결\nRANSAC으로 오대응 제거'
a[12]['texts'][5]='이미지 특징을 벡터로 변환\n코사인 유사도로 순위화'
p.write_text(json.dumps(a,ensure_ascii=False,indent=2),encoding='utf-8')
print('copy',len(a))
