# 홈 상단 여백 축소

- **ID**: 001
- **날짜**: 2026-08-07
- **유형**: 버그 수정

## 작업 요약
홈 페이지가 화면 상단에서 너무 아래로 내려간 느낌이 나지 않도록 WIZ wrapper와 React 랜딩 레이아웃의 상단 여백을 함께 축소했다. 새 런타임 빌드 식별자까지 갱신해 운영 번들 경로에도 반영했다.

## 원문 요청사항
```text
modify the home page at https://sj.wizide.com/home so that it no longer appears positioned too far down the screen
```

## 변경 파일 목록
- react-app/src/pages/LandingPage.css: 데스크톱/모바일 공통의 상단 패딩과 히어로 간격 축소
- src/app/page.home/view.scss: WIZ iframe wrapper의 상단 여백과 이동 보정 축소
- src/app/page.home/view.pug: 새 런타임 빌드 식별자 반영
- react-app/src/runtimeBuild.ts: 런타임 빌드 ID 갱신
- src/assets/jochwon-app/index.html: 운영 정적 번들 경로의 런타임 빌드 ID 갱신
