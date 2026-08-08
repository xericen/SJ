# AI 여행 시작 홈 복귀

- 원 요청: `세종 여행 시작하기`를 누르면 정부청사로 이동하지 않고 홈 화면으로 나오도록 변경.
- 변경 파일: `react-app/src/components/GovernmentAiRecommendationCenter.tsx`, `react-app/src/pages/GamePage.tsx`
- 변경 내용: AI 추천 일정 저장 후 `onExit` 콜백으로 게임 화면을 종료하도록 연결하고 정부청사 `travel-to-map` 호출을 제거.
- 확인: React/Vite 빌드 성공, 성능 예산 검사 성공, WIZ `main` 프로젝트 빌드 성공.
