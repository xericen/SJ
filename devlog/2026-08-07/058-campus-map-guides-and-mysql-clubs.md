# 058 주요 맵 1회 진입 안내·동아리 MySQL 등록·이동 환경 개선

- 요청: 공동캠퍼스와 주요 건물·정부청사 맵 진입 설명문, 프로젝트실 원형 포탈, 동아리 생성 MySQL 저장, 공동캠퍼스 충돌 개선, 정부청사 보행, 베어트리파크 밝기 개선.
- 변경 파일: `react-app/src/components/CampusMapIntro.tsx`, `react-app/src/components/ClubStreetExperience.tsx`, `react-app/src/game/renderers/VillageMapRenderer.ts`, `react-app/src/assets/jochwon-app/*` 빌드 산출물.
- 변경 내용: 공동캠퍼스·모집센터·동아리거리제·학생회관·프로젝트실·정부청사·전망대·스마트시티·중앙광장 설명문을 맵별 최초 진입 시 한 번만 표시. 프로젝트실 귀환 포탈을 원형으로 변경. 동아리 생성 payload에 필수 ID를 포함하고 운영 WIZ MySQL API로 저장. 정부청사 충돌을 공동캠퍼스와 같은 보행 모드로 변경하고 베어트리파크 조명값을 공동캠퍼스 수준으로 조정.
- 확인: `npm run build` 성공, `git diff --check` 통과, WIZ `main` 프로젝트 빌드 성공.
