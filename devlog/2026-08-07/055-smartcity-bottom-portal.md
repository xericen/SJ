# 055 스마트시티 하단 정부청사 포탈 및 전망대 3초 귀환

- 요청: 세종 스마트시티 국가시범도시의 정부청사 포탈을 맵 하단으로 이동하고, 전망대에서 정부청사로 이동하는 포탈을 3초 충전 방식으로 적용.
- 변경 파일: `react-app/src/game/worldGuideEntryPoints.ts`, `src/app/page.home/api.py`, `react-app/scripts/smartCityPortalPosition.test.ts`, `react-app/src/assets/jochwon-app/*` 빌드 산출물.
- 변경 내용: 스마트시티 정부청사 포탈 좌표를 `(1200, 1690)`에서 `(1200, 2680)`으로 변경하고 공용 WIZ 포탈 기본 좌표도 동일하게 맞춤. 전망대 귀환 포탈은 `chargeSeconds: 3` 설정을 유지.
- 확인: `npm run build` 성공, `git diff --check` 통과, WIZ `main` 프로젝트 빌드 성공.
