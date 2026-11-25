// Public, read-only examples. These records never enter the investigation queue.
// Reports and annotated evidence retain their original source links and limitations.
export const SHOWCASE = [
  {
    "id": "FR-DEMO-CAMPUS",
    "title": "학교 캠퍼스 사진 위치 찾기",
    "caption": "한신대학교 경기캠퍼스",
    "sourceRequestId": "FR-20261103-976876",
    "isShowcase": true,
    "status": "review",
    "mode": "original",
    "region": "경기도 오산시 양산동, 한신대길 137",
    "purpose": "사진 촬영",
    "brief": "사진 속 장소와 촬영 위치·방향을 확인해 주세요.",
    "constraints": "",
    "date": "",
    "createdAt": "2026-11-04T00:00:00Z",
    "updatedAt": "2026-11-04T00:00:00Z",
    "reference": {
      "name": "demo-campus.jpg",
      "type": "image/jpeg",
      "url": "./assets/demo-campus.jpg"
    },
    "report": {
      "schema_version": 1,
      "title": "학교 캠퍼스 사진 위치 찾기",
      "place_name": "한신대학교 경기캠퍼스 장준하통일관(18번 건물) 전면 창가 추정",
      "region": "경기도 오산시 양산동, 한신대길 137",
      "summary": "장준하통일관 중앙 출입구에서 남동쪽으로 이어지는 전면 창가가 유력합니다. 북동쪽 약 42도를 바라본 구도입니다. 정확한 창과 촬영 층수는 확인되지 않았습니다.",
      "lat": 37.1926194,
      "lon": 127.0277161,
      "radius_m": 35,
      "heading": 42,
      "coordinate_type": "camera_estimate",
      "hfov": 46,
      "radius_basis": "원본 GPS를 곡선 화단·횡단보도·도로 표시 배치와 대조했습니다. GPS와 외벽의 차이 및 남동쪽 전면의 여러 창 후보를 포함하는 실용적 추정 반경 35m입니다. 통계적 신뢰구간은 아닙니다.",
      "heading_basis": "GPS 위치에서 흰색 도로 표시까지의 방위각을 사진 내 가로 위치로 보정하면 약 41~42도입니다. 기준점 판독과 실제 창 위치에 따라 약 10도 차이가 가능하며 정밀 측량값은 아닙니다.",
      "confidence_levels": {
        "city": {
          "level": "high",
          "reason": "원본 GPS, HANSHIN 배너, 공식 경기캠퍼스 주소가 오산시로 일치합니다."
        },
        "area": {
          "level": "high",
          "reason": "공식 건물 사진과 위성영상에서 장준하통일관 및 출입구 주변 배치를 확인했습니다."
        },
        "road": {
          "level": "medium",
          "reason": "전면 도로의 곡선 화단·횡단보도·도로 표시가 대응합니다. 동일 방향 로드뷰는 확보하지 못했습니다."
        },
        "camera": {
          "level": "medium",
          "reason": "GPS와 전면 배치는 남동쪽 창가 범위를 지지하지만 정확한 창·층·높이는 미확정입니다."
        }
      },
      "confidence": "medium",
      "composition": "장준하통일관 중앙 출입구의 남동쪽 전면 창가를 확인하세요. 곡선 석재 화단과 배너 두 장이 달린 가로등을 아래 중앙에, 횡단보도를 오른쪽에 두고 북동쪽을 향하면 비슷한 구도가 됩니다. 동일 창과 층은 현장 대조가 필요합니다.",
      "best_time": "원본 EXIF는 2026년 11월 3일 13:49(KST)입니다. 비슷한 단풍과 빛을 원하면 11월 초 맑은 날 13~14시가 참고 조건입니다.",
      "access": "캠퍼스 주소는 한신대길 137입니다. 장준하통일관 실내와 해당 창가의 외부인 출입·촬영 가능 여부 및 개방 시간은 확인되지 않았습니다.",
      "lens": "원본은 Galaxy S24, 환산 23mm, 디지털 줌 1배입니다. 세로 9:16 구도이며 가로 화각 약 46도는 메타데이터와 화면 비율에 따른 추정값입니다.",
      "clues": [
        {
          "title": "학교 표식과 원본 GPS",
          "description": "배너 뒷면에 HANSHIN UNIVERSITY가 보이며 원본 GPS는 장준하통일관 안쪽을 가리킵니다. 주변 배치와 대조하여 확인했습니다.",
          "kind": "근거"
        },
        {
          "title": "전면 배치의 대응",
          "description": "중앙 출입구 양옆의 곡선 화단, 전면 주차열, 남동쪽 횡단보도, 흰색 도로 표시의 관계가 사진과 일치합니다.",
          "kind": "근거"
        },
        {
          "title": "층수는 미확정",
          "description": "공개 1·2층 평면도와 외관을 확인했지만 촬영 창과 연결되는 표식이 없습니다. EXIF 고도 78m와 불안정한 자세 계산으로 층수를 환산하지 않았습니다.",
          "kind": "근거"
        }
      ],
      "caveats": [
        "정확한 촬영 층수와 호실은 확인되지 않았습니다. 근거가 부족해 임의의 층수를 제시하지 않습니다.",
        "좌표는 건물 POI가 아닌 원본 GPS 기반 촬영 위치 추정입니다. 실내 GPS 오차와 창가 이동을 고려해야 합니다.",
        "자세 계산의 높이·반경 결과는 기각했으며 최종 위치의 정밀도 근거로 사용하지 않았습니다.",
        "위성영상과 외부 사진의 촬영 시기가 원본과 달라 수목·주차 상태가 다릅니다.",
        "거리사진 대조의 실행·산출물 확인이 완료되지 않았습니다. Google 조회는 정상 응답에 파노라마가 없었습니다. 카카오 로드뷰는 브라우저 사용이 비활성화되어 열지 못했습니다. 한국 거리영상 전체가 없다는 뜻은 아닙니다.",
        "후보 이미지 순위화의 실행·산출물 확인이 완료되지 않았습니다. 공식 외관 사진 17장을 DINOv2와 SIFT로 비교했습니다. 장준하통일관이 전역 유사도 1위였으나 특징점 일치는 성립하지 않았습니다. 상위 사진의 외관과 전면 배치를 수동 대조했습니다.",
        "촬영 위치·방향 기하 검증의 실행·산출물 확인이 완료되지 않았습니다. 방위각 계산, 5개 기준점의 자세 추정·재투영, GPS 고정 높이 후보 비교를 수행했습니다. 재투영 오차 122px와 하늘 구도에 맞지 않는 자세 때문에 높이 해를 기각했습니다. 지형 고도와 공개 평면도만으로는 층수를 판정할 수 없었습니다.",
        "Codex가 자동 생성한 조사 결과입니다. 촬영지 방문·허가·최신 현장 상태는 별도로 확인해 주세요."
      ],
      "alternatives": [
        {
          "name": "장준하통일관 중앙 출입구 축의 창",
          "reason": "같은 건물의 대안입니다. 창에서 가로등과 횡단보도의 상대 위치를 확인해야 구별됩니다. GPS와 화단 배치는 남동쪽 전면을 더 지지합니다."
        },
        {
          "name": "장준하통일관 북서쪽 전면 창",
          "reason": "다른 곡선 화단 후보로 검토했으나 횡단보도가 오른쪽에 놓이는 배치와 GPS가 덜 맞습니다. 동일 방향 실내 사진은 확보하지 못했습니다."
        }
      ],
      "sources": [
        {
          "title": "한신대학교 공식 캠퍼스투어",
          "url": "https://www.hs.ac.kr/kor/4891/subview.do"
        },
        {
          "title": "한신대학교 공식 장준하통일관 외관 사진",
          "url": "https://www.hs.ac.kr/sites/kor/atchmnfl/imgMap/102/temp_1504856738294100.tmp"
        },
        {
          "title": "한신대학교 SW중심대학사업단 건물 사진",
          "url": "https://swuniv.hs.ac.kr/images/sub/01/sub01_05_img01.jpg"
        },
        {
          "title": "Google 위성영상 — 모자이크 내 실제 타일 출처",
          "url": "https://mt1.google.com/vt/lyrs=s&x=447141&y=203716&z=19"
        },
        {
          "title": "나라장터 공개 교내 평면도 — 33·34쪽",
          "url": "https://www.g2b.go.kr/pn/pnp/pnpe/UntyAtchFile/downloadFile.do?bidPbancNo=R25BK01229961&bidPbancOrd=000&fileSeq=6&fileType=&prcmBsneSeCd=07"
        }
      ],
      "evidence": [
        {
          "name": "위치 및 비교 근거",
          "description": "추정 촬영 위치·시야와 원본/위성영상, 원본/공식 외관의 두 비교 패널입니다.",
          "url": "./assets/demo-campus-evidence.jpg"
        },
        {
          "name": "원본 위성 모자이크",
          "description": "Google 북쪽이 위인 WGS84 z19 영상입니다. camera-satellite.json에 원점 타일·크기가 보존되어 있으며 실패 타일은 0개입니다.",
          "url": "./assets/demo-campus-map.jpg"
        }
      ],
      "map_image": {
        "zoom": 19,
        "origin_tile": [
          447139,
          203714
        ],
        "size": [
          1280,
          1280
        ],
        "url": "./assets/demo-campus-map.jpg",
        "attribution": "Google · 위성영상. 원 출처는 아래 확인 자료와 출처 참고"
      }
    }
  },
  {
    "id": "FR-DEMO-HANOK",
    "title": "한옥마을 사진 찍기",
    "caption": "서울 북촌한옥마을",
    "sourceRequestId": "FR-20261103-3711BC",
    "isShowcase": true,
    "status": "review",
    "mode": "original",
    "region": "서울특별시 종로구 가회동",
    "purpose": "사진 촬영",
    "brief": "사진 속 장소와 촬영 위치·방향을 확인해 주세요.",
    "constraints": "",
    "date": "",
    "createdAt": "2026-11-04T00:00:00Z",
    "updatedAt": "2026-11-04T00:00:00Z",
    "reference": {
      "name": "demo-hanok.jpg",
      "type": "image/jpeg",
      "url": "./assets/demo-hanok.jpg"
    },
    "report": {
      "schema_version": 1,
      "title": "한옥마을 사진 찍기",
      "place_name": "북촌한옥마을 북촌로11가길 상단 내리막 골목",
      "region": "서울특별시 종로구 가회동",
      "summary": "북촌로11가길 상단에서 남남동쪽으로 내려다본 장면입니다. 촬영점은 아래 좌표 주변 약 25m로 추정합니다. 요청일인 2026년 11월 15일은 일요일로, 서울시 공식 지도상 ‘골목길 쉬는 날’입니다.",
      "lat": 37.583326,
      "lon": 126.983396,
      "radius_m": 25,
      "heading": 155,
      "coordinate_type": "camera_estimate",
      "hfov": null,
      "radius_basis": "실제 상단 파노라마 위치를 기준점으로 사용했습니다. 남쪽 인접 파노라마까지 14.8m이며 북쪽 역사 파노라마도 약 10m 이내입니다. 지붕·담장·골목 끝 대문의 대응으로 상단 구간을 지지합니다. 25m는 보행 위치와 파노라마 좌표 오차를 포함한 현장 탐색 범위이며 통계적 신뢰구간은 아닙니다.",
      "heading_basis": "150~165도 방향의 파노라마 렌더와 원본 구도를 비교한 약 155도 추정입니다. 계산한 골목 중심선 방위는 164.1~166.2도입니다. 광축 방향은 대략 10도 수준의 불확실성이 있으며 화각은 미확정입니다.",
      "confidence_levels": {
        "city": {
          "level": "high",
          "reason": "역이미지 검색의 동일 사진, 북촌 공식 자료와 실제 좌표가 있는 거리 파노라마가 일치합니다."
        },
        "area": {
          "level": "high",
          "reason": "한옥 밀집 배치가 정상 수신한 z19 위성 지도 및 거리 사진과 대응합니다."
        },
        "road": {
          "level": "high",
          "reason": "박공지붕 목구조, 연속 기와선, 담장 띠무늬와 골목 끝 대문의 배열을 대조했습니다."
        },
        "camera": {
          "level": "medium",
          "reason": "상단의 짧은 촬영 구간은 지지되지만 보도 쪽 이동과 렌즈 차이를 분리하지 못했습니다. 정확한 발 위치는 미확정입니다."
        }
      },
      "confidence": "medium",
      "composition": "추정점 주변에서 내리막을 향해 오른쪽 담장 가까이 서되 통행을 확보하세요. 왼쪽 박공지붕과 이어지는 기와선, 오른쪽 처마를 세로 프레임에 넣고 몇 걸음씩 이동하며 구도를 맞추면 됩니다.",
      "best_time": "다른 월~토요일 15:00~16:30을 촬영 시작 시간으로 제안합니다. 원본 촬영 시각은 확인되지 않았습니다. 공식 지도는 방문 허용시간 10:00~17:00, 일요일 골목길 쉬는 날로 안내합니다.",
      "access": "공개 보행 골목이지만 주민 생활 공간입니다. 요청일 2026-11-15는 일요일이므로 다른 요일로 변경하는 것이 좋습니다. 대문 앞을 막지 말고 현장 방문시간 안내를 따르세요.",
      "lens": "세로 구도로 표준 줌에서 망원 쪽까지 조절해 보세요. EXIF가 없어 원본 초점거리와 화각은 확인되지 않았습니다.",
      "clues": [
        {
          "title": "전경 구조의 대응",
          "description": "왼쪽 박공지붕과 목재 가새, 연속적으로 낮아지는 기와지붕, 붉은색·흰색 담장 띠무늬가 거리 사진에서 대응합니다.",
          "kind": "근거"
        },
        {
          "title": "내리막과 골목 끝 대문",
          "description": "남남동 방향의 좁은 골목과 끝 대문의 배치가 비교 자료와 일관됩니다.",
          "kind": "근거"
        },
        {
          "title": "촬영 정보의 한계",
          "description": "원본에는 촬영 좌표·초점거리 정보가 없습니다. 작은 주소판의 전체 문구와 번호도 확정 근거로 사용하지 않았습니다.",
          "kind": "근거"
        }
      ],
      "caveats": [
        "좌표는 촬영 구간을 찾기 위한 추정 기준점이며 정확한 발 위치는 미확정입니다.",
        "거리 자료는 주로 2015년이며 담장·설비·포장 상태가 달라졌을 수 있습니다.",
        "하늘 색과 채도는 위치·촬영 시각의 검증 근거로 사용하지 않았습니다.",
        "기존 위성 파일은 25개 타일 실패로 무효 처리했습니다. 최종 지도는 새로 받은 정상 파일입니다.",
        "거리사진 대조의 실행·산출물 확인이 완료되지 않았습니다. 주변 파노라마 80곳의 남향 화면 160개를 비교하고 상위 10개를 열어 고정 구조를 확인했습니다. 상단 기준점의 2015-01 메타데이터와 역방향 화면도 확인했습니다. 좁은 반경 조회의 NO_DATA는 넓힌 조회 및 실제 이미지 렌더 성공으로 보완했습니다.",
        "후보 이미지 순위화의 실행·산출물 확인이 완료되지 않았습니다. DINOv2로 160개 화면을 순위화하고 SIFT로 상위 15개를 비교했습니다. 건축 부분을 잘라 32개 방향·화각 조합도 재검사했습니다. 상단·인접 후보가 상위에 올랐지만 SIFT 15점 이상인 결과가 없어 자동 기하 일치 확정으로 취급하지 않았습니다.",
        "촬영 위치·방향 기하 검증의 실행·산출물 확인이 완료되지 않았습니다. 골목 방위 164.1~166.2도와 거리 14.8m·73.1m를 계산했습니다. DEM 고도는 상단 71m, 중간 70m, 하단 64m입니다. 고정 위치 투영도 실행했으나 신뢰할 수 있는 수평선·측량 기준점이 없어 피치·화각과 정확한 카메라 위치를 독립적으로 확정하지 못했습니다.",
        "자료 검사 실패 (gsv-upper25.json): Extra data: line 283 column 1 (char 4280)",
        "자료 검사 실패 (geometry-road-bearing.txt): unsupported verification file format",
        "자료 검사 실패 (geometry-long-bearing.txt): unsupported verification file format",
        "자료 검사 실패 (terrain-camera.txt): unsupported verification file format",
        "자료 검사 실패 (terrain-mid.txt): unsupported verification file format",
        "자료 검사 실패 (terrain-lower.txt): unsupported verification file format",
        "자료 검사 실패 (pose-projection.txt): unsupported verification file format",
        "근거 이미지 설정의 촬영 방향이 결과와 일치하는지 확인하지 못했습니다.",
        "Codex가 자동 생성한 조사 결과입니다. 촬영지 방문·허가·최신 현장 상태는 별도로 확인해 주세요."
      ],
      "alternatives": [
        {
          "name": "같은 골목에서 약 15m 남쪽 지점",
          "reason": "건축 부분 재비교에서 높은 유사도를 보였습니다. 첫 박공지붕이 프레임에 들어오는 정도가 달라 낮게 평가했습니다. 현장에서 렌즈와 보행 위치를 바꿔 구분할 수 있습니다."
        },
        {
          "name": "약 10m 북쪽 교차 골목 부근",
          "reason": "역사 파노라마에 비슷한 지붕 배열이 보입니다. 추가 전경 지붕과 담장 비율이 달라 낮게 평가했지만 완전히 배제하지 않았습니다."
        },
        {
          "name": "북촌로11다길 및 북촌로11길 접근 구간",
          "reason": "주변 도로 후보로 비교했으나 길의 굽음과 전경 배열이 달라 낮게 평가했습니다. 전 구간을 측량하여 제외한 것은 아닙니다."
        }
      ],
      "sources": [
        {
          "title": "Google 거리 파노라마 — 상단 기준점",
          "url": "https://www.google.com/maps/@?api=1&map_action=pano&pano=iji2OHIKbyYu1lSo0NIzdA&heading=155"
        },
        {
          "title": "Google 거리 파노라마 — 남쪽 인접 지점",
          "url": "https://www.google.com/maps/@?api=1&map_action=pano&pano=LRbVXEQiWAQQhqXko-1Svw&heading=165"
        },
        {
          "title": "Google 위성 지도 — 조사 구간",
          "url": "https://www.google.com/maps/@37.583326,126.983396,19z/data=!3m1!1e3"
        },
        {
          "title": "서울시 공식 북촌 산책 지도 — 골목 위치·방문 안내",
          "url": "https://english.seoul.go.kr/wp-content/themes/seoul-e/assets/images/hanok/img/hanok-map-2.pdf"
        },
        {
          "title": "한국관광공사 — 북촌로11가길 포토존 안내",
          "url": "https://english.visitkorea.or.kr/svc/contents/contentsView.do?vcontsId=224643"
        }
      ],
      "evidence": [
        {
          "name": "지도와 거리 사진 비교",
          "description": "실제 위성 지도, 약 25m 추정 범위 표기와 두 개의 거리 사진 비교 패널입니다. 분홍 선은 추정 촬영 방향이며 화각 부채꼴은 표시하지 않았습니다.",
          "url": "./assets/demo-hanok-evidence.jpg"
        },
        {
          "name": "원본 위성 모자이크",
          "description": "북쪽 위 WGS84 Google 위성 지도입니다. z19, 1280×1280, failed_tiles=0이며 satellite.json을 함께 보존했습니다.",
          "url": "./assets/demo-hanok-map.jpg"
        }
      ],
      "map_image": {
        "zoom": 19,
        "origin_tile": [
          447074,
          203000
        ],
        "size": [
          1280,
          1280
        ],
        "url": "./assets/demo-hanok-map.jpg",
        "attribution": "Google · 위성영상. 원 출처는 아래 확인 자료와 출처 참고"
      }
    }
  },
  {
    "id": "FR-DEMO-BEACH",
    "title": "야간 해변 촬영",
    "caption": "강릉 사근진해변",
    "sourceRequestId": "FR-20261102-C4ABF2",
    "isShowcase": true,
    "status": "review",
    "mode": "original",
    "region": "강원특별자치도 강릉시 안현동 사근진해변",
    "purpose": "사진 촬영",
    "brief": "사진 속 장소와 촬영 위치·방향을 확인해 주세요.",
    "constraints": "",
    "date": "",
    "createdAt": "2026-11-04T00:00:00Z",
    "updatedAt": "2026-11-04T00:00:00Z",
    "reference": {
      "name": "demo-beach.jpg",
      "type": "image/jpeg",
      "url": "./assets/demo-beach.jpg"
    },
    "report": {
      "schema_version": 1,
      "title": "야간 해변 촬영",
      "place_name": "사근진 해중공원 전망대 북서쪽 곡선 석축",
      "region": "강원특별자치도 강릉시 안현동 사근진해변",
      "summary": "사근진 해중공원 전망대의 북서쪽 안쪽 해안에서 촬영한 사진으로 판단됩니다. 전망대에서 서쪽 약 70m 지점을 촬영 후보로 제시하며, 정확한 발판은 미확인입니다.",
      "lat": 37.81419,
      "lon": 128.89747,
      "radius_m": 50,
      "heading": 103,
      "coordinate_type": "camera_estimate",
      "hfov": null,
      "radius_basis": "전망대의 측면 살, 상부 이중 곡선 보, 파스텔 방파블록, 아치형 시설을 공개 지상 사진과 대조하고 위성사진의 북서쪽 곡선 해안에 배치했습니다. 반경 50m는 해당 해안 구간과 발판 불확실성을 포함한 탐색 범위이며 통계적 오차가 아닙니다.",
      "heading_basis": "후보점에서 전망대와 사진 오른쪽의 스카이베이로 추정되는 건물의 화면상 위치를 조건부 계산하면 약 103.5°입니다. 동남동 방향의 대략값이며 독립적으로 측정한 방위가 아닙니다. 실제 화각은 확정하지 않았습니다.",
      "confidence_levels": {
        "city": {
          "level": "high",
          "reason": "사근진의 독특한 전망대와 컬러 방파블록 조합이 공개 사진과 일치합니다."
        },
        "area": {
          "level": "high",
          "reason": "전망대의 형태, 방파블록, 아치형 시설과 보호된 수역 배치가 일치합니다."
        },
        "road": {
          "level": "medium",
          "reason": "전망대 북서쪽 곡선 해안에서 구조물 좌우 순서와 방향이 부합합니다. 동일 석축의 근접 외부 사진은 확보하지 못했습니다."
        },
        "camera": {
          "level": "low",
          "reason": "좌표는 유력 해안 구간의 추정점입니다. 발판 일치나 독립적인 다중 시선 교차로 확정하지 못했습니다."
        }
      },
      "confidence": "medium",
      "composition": "물과 컬러 방파제를 왼쪽에, 흰 전망대를 중앙 왼쪽에 두고 곡선 석축을 전경에 담는 구도입니다.",
      "best_time": "원본과 같은 분위기는 야간입니다. 촬영 날짜와 정확한 시각은 확인되지 않았습니다.",
      "access": "해안로604번길의 사근진해변에서 전망대 북서쪽 안쪽 해안을 확인하세요. 현장 통제와 파도 상태에 따라 접근 가능 범위가 달라질 수 있습니다.",
      "lens": "EXIF가 없어 렌즈와 초점거리는 확인할 수 없습니다.",
      "clues": [
        {
          "title": "흰색 전망대",
          "description": "날개형 상부 보와 층층이 돌출된 측면 살이 공개 사진과 일치합니다.",
          "kind": "근거"
        },
        {
          "title": "컬러 방파블록과 아치",
          "description": "파스텔색 방파블록 및 전망대 옆 아치형 시설이 일치합니다.",
          "kind": "근거"
        },
        {
          "title": "안쪽 곡선 해안",
          "description": "왼쪽 보호 수역과 오른쪽으로 올라가는 석축 구도가 전망대 북서쪽 해안과 부합합니다.",
          "kind": "근거"
        }
      ],
      "caveats": [
        "장소 식별 신뢰도와 촬영 좌표 신뢰도는 다릅니다. 표기 좌표는 검증된 카메라 위치가 아닙니다.",
        "공개 사진 및 위성사진과 원본 사이에 모래 피복·해안 시설 차이가 있어 석축의 정확한 발판은 확인하지 못했습니다.",
        "방향은 후보점에 의존하는 추정값이며 화각은 미상입니다. 근거 이미지에는 화각 부채꼴 대신 방향선만 표시했습니다.",
        "요청 날짜 2026-11-08은 원본 촬영일의 근거로 사용하지 않았습니다.",
        "거리사진 대조의 실행·산출물 확인이 완료되지 않았습니다. 2018년 도로 파노라마 15개 방향과 북쪽 도로 5개 방향을 확인했습니다. 당시 해변 건물에 가려 석축 촬영 위치를 검증하지 못했습니다.",
        "후보 이미지 순위화의 실행·산출물 확인이 완료되지 않았습니다. DINOv2와 SIFT로 공개 이미지 28개 및 도로 렌더 15개를 순위화하고 상위 결과를 확인했습니다. 자동 기하 일치 기준 15개 인라이어에 도달하지 못했습니다. 육안으로 전망대 고정 구조는 일치하나 동일 촬영점은 미확인입니다.",
        "촬영 위치·방향 기하 검증의 실행·산출물 확인이 완료되지 않았습니다. geo.py 화면 방위 검사와 조건부 수평 투영을 수행했습니다. DEM은 약 2m입니다. pose.py 투영은 구조물 높이와 수평선 가정에 의존하고 수평선 진단의 부호 불일치도 있어 정확한 자세 검증으로 채택하지 않았습니다.",
        "근거 이미지 설정의 촬영 방향이 결과와 일치하는지 확인하지 못했습니다.",
        "Codex가 자동 생성한 조사 결과입니다. 촬영지 방문·허가·최신 현장 상태는 별도로 확인해 주세요."
      ],
      "alternatives": [
        {
          "name": "전망대 북쪽 해변의 더 먼 지점",
          "reason": "같은 구조물을 볼 수 있으나 원본의 석축 곡선과 크기 관계에는 지지가 약합니다. 같은 방향의 근접 지상 사진이 필요합니다."
        },
        {
          "name": "전망대 남쪽 해변",
          "reason": "공개 반대편 사진에서는 방파블록과 아치 시설의 좌우 순서가 원본과 달라 낮게 평가했습니다. 공식적으로 배제하지는 않았습니다."
        }
      ],
      "sources": [
        {
          "title": "바다온 사근진해중공원 전망대 안내",
          "url": "https://www.badaon.or.kr/seantour_map/travel/destination/detail.do?destId=DEST025127"
        },
        {
          "title": "전망대 북쪽 측면 비교 사진",
          "url": "https://cdn.ardentnews.co.kr/news/photo/202505/6215_29265_1831.jpg"
        },
        {
          "title": "중앙일보·강릉시 제공 컬러 방파제 사진",
          "url": "https://v.daum.net/v/20210702060042825"
        },
        {
          "title": "한국관광공사 전망대 정면 사진",
          "url": "https://tong.visitkorea.or.kr/cms/resource/41/2921941_image2_1.jpg"
        },
        {
          "title": "Google 위성영상·지도",
          "url": "https://www.google.com/maps/@37.81419,128.89747,19z/data=!3m1!1e3"
        }
      ],
      "evidence": [
        {
          "name": "위치·구조물 비교",
          "description": "실제 Google 위성영상 위 추정점·방향선과 원본 및 외부 지상 사진의 고정 구조물 비교입니다.",
          "url": "./assets/demo-beach-evidence.jpg"
        },
        {
          "name": "원본 위성 모자이크",
          "description": "북쪽이 위인 WGS84, 줌 19 실제 위성영상입니다. 동일 이름의 satellite-north.json에 타일 원점과 크기를 보존했습니다.",
          "url": "./assets/demo-beach-map.jpg"
        }
      ],
      "map_image": {
        "zoom": 19,
        "origin_tile": [
          449862,
          202573
        ],
        "size": [
          1792,
          1792
        ],
        "url": "./assets/demo-beach-map.jpg",
        "attribution": "Google · 위성영상. 원 출처는 아래 확인 자료와 출처 참고"
      }
    }
  }
];
