# 자료 정리와 보관 기준

이번 저장소는 기존 작업 파일을 새 폴더로 복사해 만든 스냅샷이다. 원본 작업 폴더·앱 데이터·스킬 설치 경로는 수정하거나 삭제하지 않았다.

## 포함 범위

| 원본 묶음 | 저장 위치 | 보관 내용 |
|---|---|---|
| `frame-location` | `apps/frame` | 화면·서버·실행기·도구·테스트·한국팩·원본 README/QA/자산 안내 |
| `geo-sleuth-review` | `vendor/geo-sleuth` | 원본 코드·지침·테스트·예시·LICENSE. Git 내부 이력 제외 |
| `geo_slueth_test` | `research/datasets` | 테스트 사진·정답표·출처·초기 intake |
| `geo_work_*` 7개 | `research/cases` | 보고서·후보·지도·참고사진·계산·검증·로컬 보조 코드 |
| Frame 실제 의뢰 5건 | `research/frame-runs` | 정제한 현재 리포트·요약·시도별 최종 결과·근거·중간 산출물 |
| `output/*.pptx` | `presentations/latest`, `history` | Office 잠금 파일을 제외한 13개 발표자료 |
| `ppt_*` 11개 | `presentations/build` | 최상위 제작·수정 코드, JSON 검사·매핑·변경 기록, 텍스트 |
| 기존 화면 캡처 | `docs/assets` | 홈·샘플 리포트·실패 복구 안내 |

## 제외한 파일

- `.git`, `node_modules`, 가상환경, uv·Hugging Face·지도 타일 캐시와 모델 가중치.
- 인증·환경 설정, 원시 Codex 이벤트·대화와 stderr 로그.
- Frame 의뢰의 원시 요청·작업 프롬프트, 세션·복구 체크포인트, 실행기 영수증과 PC 경로를 담은 자동 도구 목록.
- 중복 배포 tar.gz, 임시 ZIP, Office 잠금 파일.
- 발표 제작 폴더의 반복 렌더, 중간 `source.pptx`·`candidate.pptx`, node_modules 연결. 최종 산출물 13개와 제작 코드·검사 기록은 보관.

제외한 폴더는 원본 PC에 남아 있다. 사용자 사진과 근거·중간 계산은 포함했지만 원시 실행 환경 전체의 백업은 아니다.

## 원본과 새 문서의 구분

[archive-manifest.json](archive-manifest.json)은 복사한 파일의 원래 작업 묶음, 새 경로, 크기, SHA-256을 기록한다. 원본 경로는 개인 PC의 절대 경로 대신 작업 폴더 기준으로 적었다. [repository-files.json](repository-files.json)은 정리 과정에서 작성한 문서까지 포함하는 전체 파일 목록이다. 목록 자신과 Git 내부 파일은 해시 대상에서 제외한다.

Frame의 `report.json`은 현재 화면에 연결된 결과에서 이미지 경로를 보관 폴더로 바꾼 열람용 내보내기다. 원시 state 전체를 복사하거나 앱에 바로 가져오는 백업 형식은 아니다. 해당 결과의 실제 근거는 `evidence/`, 당시 작업 파일은 `artifacts/<시도>/`, 구조화된 최종 응답은 `attempts/`에 둔다.

과거 자료에는 당시 PC의 절대 경로나 설정, 이미 알려진 주의점이 남아 있다. 과거 기록은 재작성하지 않았으므로 현재 상태는 최상위 README·현황 문서와 구분해 읽는다. 역사적 제작 스크립트는 원래의 작업 폴더와 당시 artifact-tool 환경을 참조하므로 모든 경로가 즉시 실행 가능한 형태는 아니다.

외부 지도·참고사진은 연구 증거 보존용이며 재배포 조건이 확인된 범용 데이터셋으로 취급하지 않는다. 출처와 라이선스는 [권리 구분](../THIRD_PARTY_NOTICES.md)을 참고한다.
