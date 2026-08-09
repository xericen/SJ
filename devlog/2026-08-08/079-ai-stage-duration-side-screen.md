# AI 5·6단계 체류 시간·양쪽 전광판 확대 개선

- 원 요청: 9단계 분석 중 STEP 5·6을 더 오래 볼 수 있게 하고, 양옆 전광판 확대 시 사선이 아니라 중앙 전광판처럼 잘 보이도록 수정.
- 변경 파일: `react-app/src/components/GovernmentAiRecommendationCenter.tsx`, `react-app/src/game/renderers/VillageMapRenderer.ts`, `react-app/src/runtimeBuild.ts`, `react-app/scripts/runtimeWarnings.test.ts`, 운영 정적 자산, `devlog.md`, 본 상세 기록.
- 변경 내용: STEP 5와 STEP 6 자동 체류 시간을 각각 2.2초에서 5초로 연장했다. 좌우 전광판 확대 카메라를 각 화면의 법선 방향 정중앙에 배치하고 중앙 전광판과 동일한 거리·화각을 적용했다.
- 확인: 관련 회귀 테스트 포함 런타임 테스트 4건 통과, React TypeScript/Vite/서버 빌드와 성능 예산 검증 성공, WIZ `main` 빌드 성공, 운영 반영 확인.
- 남은 리스크: 화면 비율이 매우 좁은 모바일에서는 전광판 외곽 여백이 데스크톱보다 작게 보일 수 있다.
