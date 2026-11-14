# SANTA ♥ ORION 1주년 사이트

## 어떤 파일을 쓰나요
- **embed.html** — 사이트 빌더의 "HTML/코드 임베드" 칸에 **내용 전체를 복사해서 붙여넣기**. (iframe 한 줄짜리 코드라 스크립트가 막히는 임베드 칸에서도 작동, 높이 자동 맞춤)
- **index.html** — 호스팅(GitHub Pages·Netlify 등)에 올려서 직접 열거나 `<iframe src="…/index.html">`로 넣을 때.
- **firestore.rules** — Firebase 콘솔 → Firestore → 규칙에 붙여넣고 게시.

## 수정할 때
- 문구·날짜·프로필·소개서: `config.js`
- 나머지: style.css / fonts.css / 각 .js
- 수정 후 `python3 build.py` → index.html, embed.html 다시 생성
- `dev.html`은 수정 중 미리보기용 (같은 폴더의 css/js를 불러옴)
