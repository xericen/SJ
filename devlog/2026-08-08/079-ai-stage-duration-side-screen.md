# AI 5·6단계 체류 시간·양쪽 전광판 확대 개선

- 원 요청: 9단계 분석 중 STEP 5·6을 더 오래 볼 수 있게 하고, 양옆 전광판 확대 시 사선이 아니라 중앙 전광판처럼 잘 보이도록 수정.
- 변경 파일: `src/app/page.home/view.pug`, `src/assets/jochwon-app/index.html`, `src/assets/jochwon-app/assets/*`, `devlog.md`, 본 상세 기록. React 원본은 `/opt/app/SJ/react-app/src/components/GovernmentAiRecommendationCenter.tsx`, `src/game/renderers/VillageMapRenderer.ts`, 런타임 식별자와 회귀 테스트.
- 변경 내용: STEP 5·6 자동 체류 시간을 각각 2.2초에서 5초로 연장하고, 좌우 전광판 확대 카메라를 각 화면 정면에 배치해 중앙 전광판과 동일한 거리·화각으로 표시했다.
- 확인: 런타임 회귀 테스트 4건 통과, React TypeScript/Vite/서버 빌드와 성능 예산 검증 성공, WIZ `main` 빌드 성공, 운영 반영 확인.
- 남은 리스크: 매우 좁은 모바일 화면에서는 전광판 외곽 여백이 데스크톱보다 작게 보일 수 있다.
