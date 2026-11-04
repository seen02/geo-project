# 이 저장소에서 실행하기

원본 앱의 README와 QA는 당시 작업 기록을 그대로 보존했다. 저장소 전체 안내는 [최상위 README](../../README.md), 현재 구조는 [기술 설명](../../docs/architecture.md)을 참고한다.

이 폴더에서 PowerShell로 실행한다.

```powershell
$env:FRAME_GEO_SKILL = (Resolve-Path ../../vendor/geo-sleuth/skills/geo-sleuth).Path
npm run dev
```

Node.js 18+, Python 3.10+, uv와 로그인된 Codex CLI가 필요하다. `dist/`는 실제 HTML/CSS/JS 화면이며 빌드 부산물로 삭제하면 안 된다. 조사 도구의 Python 의존성과 모델은 최초 사용 시 내려받을 수 있다.

`npm run check`, `npm test`는 실제 유료 모델을 호출하지 않는다. 실사진 조사는 계정 사용량과 외부 서비스에 의존한다. 저장 데이터는 `.local-data/`에 새로 생성하고 Git에서 제외한다.

기존 로컬 의뢰 데이터는 앱 코드와 분리했다. 보관한 실제 결과는 [research/frame-runs](../../research/frame-runs/README.md)의 열람용 내보내기다.
