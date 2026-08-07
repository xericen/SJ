# 동아리 생성 API 경로·모집글 추천·모집센터 원형 포탈 수정

- 사용자 요청: 동아리 창설부스에서 새 동아리를 만들 수 있게 하고, 충녕이의 모집 찾기가 프로젝트가 아닌 모집글을 추천하도록 변경하며, 모집센터에서 공동캠퍼스로 돌아가는 포탈을 원형으로 변경한다.
- 원인: `CommunityPage`가 공통 `/api` 기본 경로 뒤에 `/api`를 중복으로 붙여 `/api/api/clubs`를 요청했고, 모집 찾기 버튼은 원격 프로젝트 추천 응답으로 바로 연결됐다. 모집센터 귀환 포탈은 `energy-rift` 모양이었다.
- 변경 파일: `react-app/src/pages/CommunityPage.tsx`, `react-app/src/components/RecruitmentCenterDesk.tsx`, `react-app/src/game/renderers/VillageMapRenderer.ts`, 배포 정적 자산 `src/assets/jochwon-app/`.
- 변경 내용: 커뮤니티·동아리 API 경로를 `/api/community`, `/api/clubs`로 정규화했다. 모집 찾기 요청은 공개 모집글을 동기화해 모집글 카드로 추천하도록 변경했고, 모집센터 귀환 포탈을 `white-circle`로 통일했다.
- 확인: React/Vite 빌드 및 성능 검사 통과, `git diff --check` 통과, WIZ `main` 프로젝트 빌드 성공.
