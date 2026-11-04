import json,pathlib
r=json.loads(pathlib.Path('result.template.json').read_text(encoding='utf-8'))
r.update({
'place_name':'경기도 오산시 독산성 일대(유력 후보·촬영점 미확정)',
'region':'경기도 오산시 지곶동',
'summary':'독산성의 보적사 부근 동쪽 조망 구간이 가장 유력합니다. 공개 독산성 사진에서 동탄 메타폴리스 네 타워의 형태·간격이 참고 사진과 부합합니다. 좌표는 보적사의 대표 위치이며, 같은 벚나무 아래의 촬영점은 확인하지 못했습니다.',
'lat':37.1837772,'lon':127.0195036,'radius_m':None,'heading':None,'coordinate_type':'landmark','confidence':'medium',
'composition':'보적사 부근 동쪽 공개 탐방로에서 메타폴리스를 찾고, 가지를 왼쪽 위에 넣어 숲과 도심을 함께 담는 구도를 시험하세요. 원본의 정확한 서 있는 위치와 방향은 미확정입니다.',
'best_time':'원본과 같은 꽃 풍경은 봄 벚꽃 개화기의 맑은 낮에 시도하세요. 예정일인 2026년 11월 7일에는 봄 벚꽃 풍경을 재현하기 어렵습니다.',
'access':'오산시 공식 안내 위치는 지곶동 155입니다. 보적사·독산성의 공개 탐방로를 답사 출발점으로 삼을 수 있습니다. 당일 출입·공사 상황은 오산시 안내 전화 031-8036-7605로 확인하세요. 운영시간과 주차요금은 이번 조사에서 확인하지 못했습니다.',
'lens':'재현 시 환산 24~35mm 광각에서 시작해 가지와 도심 비율을 조절하는 것을 제안합니다. 원본 초점거리는 메타데이터가 없어 확인할 수 없습니다.',
'clues':[
{'title':'메타폴리스 네 타워와 부합','description':'높은 외곽 두 동, 낮은 안쪽 두 동, 가운데 넓은 간격과 옥상 형태가 공개 독산성 조망 사진과 유사합니다. 타워 간격 비율도 수작업 픽셀 측정으로 재확인했습니다.'},
{'title':'동쪽 조망 구간의 공개 기록','description':'방문 기록은 보적사 인근 나무와 동쪽 성곽에서 동탄이 보인다고 설명합니다. 이는 답사 구간을 좁히는 자료이며 같은 나무의 확인은 아닙니다.'},
{'title':'대표 위치와 거리 계산','description':'오픈스트리트맵에서 보적사 위치를 확인했습니다. 독산성 대표점에서 메타폴리스 대표점까지 계산한 거리는 약 4.9km, 방위는 약 63도입니다. 원본 카메라 방향을 확정한 값은 아닙니다.'}
],
'evidence':[{'name':'위성지도와 공개 전망 사진 비교','file':'evidence.jpg','description':'실제 내려받은 위성지도에 보적사 대표 위치를 표시했습니다. 하단에는 제공 사진의 확대 부분, 까망 포레스트의 독산성 사진, 경기문화재단에 실린 유승혜 작가의 전망 사진을 구분해 배치했습니다. 촬영점 표시는 없습니다.'}],
'alternatives':[{'name':'화성 융건릉·서봉산','reason':'초기 조망 후보입니다. 동일 구도 비교를 완료하지 못해 배제하지 않았습니다. 가까운 아파트와 골프연습장까지 대응하는 추가 사진이 필요합니다.'},{'name':'대구권','reason':'역이미지검색으로 연결된 여행 기사에는 대구라는 캡션이 있습니다. 독산성 사진의 건물 형태 대조와 충돌하여 낮은 우선순위로 남겼으며, 원본 제공처의 위치 기록이 필요합니다.'}],
'caveats':[
'독산성 일대라는 판단은 중간 신뢰도의 후보입니다. 같은 벚나무·근거리 건물까지 대응하는 지상 사진이나 두 시선의 교차 검증이 없어 원본 촬영점은 확정하지 않았습니다.',
'위도·경도는 보적사 영역의 대표점입니다. 촬영점 오차반경과 원본 촬영 방향은 산정할 근거가 부족해 비워 두었습니다.',
'이미지에는 GPS·촬영일·렌즈 정보가 없고 OCR에서도 문자를 읽지 못했습니다. 자동 검색의 서울 라벨과 여행 기사의 대구 캡션은 확정 근거로 사용하지 않았습니다.',
'Getty 원문은 접근 차단되었고 Baidu 변형 이미지 검색 일부는 시간 초과되었습니다. 지도 스크립트의 통신 오류는 별도 다운로드로 보완했으나 원본 출처의 촬영 위치는 확보하지 못했습니다.',
'후보 점수는 조사 기록의 상대 순위이며 실제 정답 확률이 아닙니다. 나머지 후보의 비교와 현장 답사가 필요합니다.'
],
'sources':[
{'title':'오산시 공식 안내: 독산성과 세마대지','url':'https://www.osan.go.kr/depart/contents.do?mId=0902010000'},
{'title':'까망 포레스트: 독산성 전망·메타폴리스 사진','url':'https://blackforest.tistory.com/421'},
{'title':'경기문화재단: 독산성 전망 사진과 탐방 기록','url':'https://ggc.ggcf.kr/p/654ad78777e5f81f54e4a703'},
{'title':'꽃뿌니네: 보적사 인근 나무와 동쪽 성곽 조망 기록','url':'https://only-flower.tistory.com/90'},
{'title':'오픈스트리트맵: 보적사 영역의 대표 위치','url':'https://www.openstreetmap.org/way/1252249907'},
{'title':'위성지도 출처: 에스리 월드 이미지 서비스','url':'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer'},
{'title':'여행 기사의 대구 캡션: 위치 정보 충돌 자료','url':'https://www.tripsavvy.com/one-week-in-korea-4802523'}
]})
schema=json.loads(pathlib.Path('report.schema.json').read_text(encoding='utf-8'))
assert set(r)==set(schema['required'])
assert r['request_id']=='FR-20261102-B180EC'
assert all(pathlib.Path(e['file']).is_file() for e in r['evidence'])
pathlib.Path('result.json').write_text(json.dumps(r,ensure_ascii=False,indent=2),encoding='utf-8')
print('Result fields and evidence paths checked; result.json written.')
