# SANTA ♥ ORION — 1주년 기념 픽셀 사이트

## 파일
- `dist/anniversary.html` — 한 파일 완성본 (호스팅/임베드용)
- `src/` — 수정용 원본
  - `fonts.css` 눈누 폰트 (@noonnu npm 미러 → jsDelivr)
  - `style.css` 전체 스타일
  - `js/config.js` 날짜·대사·프로필·소개서·Firebase 설정  ← 문구는 여기서
  - `js/core.js` 사운드 · 픽셀 폰트 · 입력
  - `js/widgets.js` 직접 만든 컬러피커 · 셀렉트 · 스테퍼 · 모달
  - `js/sprites.js` 스티커 / 종이접기 쪽지 픽셀아트
  - `js/maker.js` 캐릭터 메이커 (산타·오리온 프리셋 포함)
  - `js/intro.js` 입장 인트로 · STAGE 1 · 프로필/소개서
  - `js/games.js` 가로형 콘솔 + 미니게임 4종
  - `js/polaroid.js` 폴라로이드 에디터
  - `js/bottle.js` 쪽지 병 방명록 (Firestore)
  - `js/main.js` 스테이지 전환
- `build.py` — `src/` 수정 후 `python3 build.py` → `dist/anniversary.html` 재생성
- `firestore.rules` — 방명록 보안 규칙 (이번 버전에서 shape/color/font 필드 추가됨 → 다시 게시 필요)

## Firebase
1. Firestore Database → 규칙 탭에 `firestore.rules` 붙여넣고 게시
2. `guestbook` 컬렉션은 첫 쪽지가 들어올 때 자동 생성
- 쪽지 삭제는 Firestore 콘솔에서 직접

## 폰트 (눈누)
갈무리11/14 · Neo둥근모 · 양진체 · 프리텐다드 · 마루 부리 · 손편지체 · 교보손글씨 2020 박도연 · Y이드스트릿 · 달무리
— 전부 눈누 등록 무료 폰트, 각 폰트 라이선스(OFL 등)에 따라 웹 사용 가능

## 임베드
`<iframe src="…/anniversary.html" style="width:100%;max-width:860px;height:1400px;border:0" allow="clipboard-write"></iframe>`
