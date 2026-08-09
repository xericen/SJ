# 02 확정 코스 전용 03 저장 및 01·03 전광판 정면 확대

- 원 요청: 03에는 기존 AI 추천 코스가 아니라 02에서 완성·확정한 코스만 표시하고, 양쪽 01·03 전광판도 확대해서 보기 편하게 수정.
- 변경 파일: `react-app/src/components/GovernmentCentralPlazaWebUI.tsx`, `react-app/src/game/renderers/VillageMapRenderer.ts`, `src/assets/jochwon-app/index.html`, 최신 정적 번들, `src/app/page.home/view.pug`, `devlog.md`, 본 상세 기록.
- 변경 내용: 02 일정 확정 시 로그인 계정과 프로젝트명이 포함된 전용 확정 코스를 저장하고 03은 해당 저장소만 읽는다. 새 프로젝트를 불러오면 기존 03 코스를 비워 재확정 전 노출을 막는다. 01·03 확대 카메라는 각 패널 정면 법선과 중앙 화면 동일 거리·화각을 사용한다.
- 확인: React TypeScript/Vite/서버 빌드 및 성능 예산 검증 성공. 최신 `index-Bg9_yIZm.js` 정적 번들 동기화.
- 남은 리스크: 브라우저에 이전 iframe 문서가 열려 있으면 새로고침 1회가 필요할 수 있다.
