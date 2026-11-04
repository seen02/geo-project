import json
from pathlib import Path
p=Path(__file__).parent/'korean_copy.json'
a=json.loads(p.read_text(encoding='utf-8'))
a[15]['texts'][1]='2026.10.28 테스트 결과: 경기도 오산시 독산성·보적사 북동쪽 진입로 주변'
a[25]['table'][-1][2]='기준점 대응과 고정한 위치가 옳은지'
a[26]['table'][-1][2]='이번 사진은 외부 역검색으로 전송하지 않음'
a[27]['texts'][-1]='실제 좌표는 사용자 제공값이며, 12.6m는 기존 보고 대표점과의 사후 비교값입니다'
p.write_text(json.dumps(a,ensure_ascii=False,indent=2),encoding='utf-8')
