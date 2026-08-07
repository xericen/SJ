# 053 주요 맵 진입 안내문 및 정부청사 원형 포탈·전망대 3초 이동

- 요청: 공동캠퍼스, 모집센터, 동아리거리제, 프로젝트실, 학생회관 진입 설명문 추가; 공동캠퍼스·정부청사 포탈 원형 디자인 적용; 전망대에서 정부청사로 돌아가는 포탈을 E 키가 아닌 3초 충전 이동으로 변경.
- 변경 파일: `react-app/src/components/CampusMapIntro.tsx`, `react-app/src/components/CampusMapIntro.css`, `react-app/src/pages/GamePage.tsx`, `react-app/src/game/renderers/VillageMapRenderer.ts`, `react-app/src/assets/jochwon-app/*` 빌드 산출물.
- 확인: `npm run build` 성공(타입체크·Vite 빌드·성능 예산·서버 타입체크 포함), `git diff --check` 통과, WIZ 프로젝트 `main` 빌드 성공.
- 참고: 기존 포탈 테스트 스크립트는 저장소의 서버 경로 별칭을 Node 직접 실행으로 해석하지 못해 별도 실행은 불가했으며, 전체 애플리케이션 빌드로 컴파일 검증을 완료했다.
