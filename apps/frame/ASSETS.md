# 사용 자산

## 공개 조사 사례

메인 화면에 사용하는 아래 사진은 기존 조사 사진을 웹 화면용으로 축소한 JPEG입니다. 이미지 방향은 반영하고 EXIF·GPS 메타데이터는 제거했습니다. 사진의 기존 권리는 유지되며 프로젝트 코드의 라이선스가 별도로 부여되는 것은 아닙니다.

| 순서 | 파일 | 조사 사례 |
|---|---|---|
| 1 | `dist/assets/demo-campus.jpg` | 학교 캠퍼스 사진 위치 찾기 · `FR-20261103-976876` |
| 2 | `dist/assets/demo-hanok.jpg` | 한옥마을 사진 찍기 · `FR-20261103-3711BC` |
| 3 | `dist/assets/demo-beach.jpg` | 야간 해변 촬영 · `FR-20261102-C4ABF2` |

`dist/lib/showcase.js`에는 저장소 `research/frame-runs/`의 공개용 리포트에서 발췌한 결과와 출처를 포함합니다. 원시 실행 로그·사용자 환경·내부 대화는 포함하지 않습니다. 각 사례의 `demo-*-evidence.jpg`는 기존 조사에서 만든 촬영 방향·반경 및 사진 비교 설명 이미지를 그대로 복구한 파일입니다. `demo-*-map.jpg`는 SVG 방향·반경 표시의 배경 지도이며, 원래 픽셀 크기와 타일 원점을 유지합니다. Google 위성영상·거리사진, 한신대학교 공식 사진, 강릉시·중앙일보 및 Ardent News 비교 사진의 출처는 리포트의 sources와 이미지 안의 표기에 보존했습니다. 이들 외부 자료의 권리는 각 제공자에게 있으며 MIT 라이선스 적용 대상이 아닙니다. 원 출처 링크도 함께 유지합니다. 공개 예시는 읽기 전용이며 실제 의뢰 저장소나 모델 실행 큐에 등록되지 않습니다.

## 화면 구성용 샘플

사진은 Unsplash 이미지 CDN에서 받아 프로젝트에 로컬로 저장했습니다. 정확한 촬영지를 분석한 자료가 아니며, 샘플 리포트에서는 실제 분석 결과와 구분해 표시합니다.

| 파일 | 원본 |
|---|---|
| `dist/assets/lake.jpg` | https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1 |
| `dist/assets/mountain.jpg` | https://images.unsplash.com/photo-1464822759023-fed622ff2c3b |
| `dist/assets/coast.jpg` | https://images.unsplash.com/photo-1518837695005-2083093ee35b |

Unsplash 라이선스: https://unsplash.com/license

한글 글꼴: Pretendard Variable v1.3.9, SIL Open Font License 1.1.

- 원본: https://github.com/orioncactus/pretendard
- 다운로드: https://cdn.jsdelivr.net/npm/pretendard@1.3.9/dist/web/variable/woff2/PretendardVariable.woff2
- 라이선스: `dist/assets/OFL.txt`

브랜드 마크·아이콘·사진 위 단서 표시와 방향 나침반은 이 시제품의 코드로 작성했습니다.
