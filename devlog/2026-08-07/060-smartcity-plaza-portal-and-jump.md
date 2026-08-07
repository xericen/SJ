# 060 스마트시티·중앙광장 하단 포탈·밝기·AI 원형 점프 보완

- 요청: 스마트시티 정부청사 귀환 포탈을 GLB 하단에 두고, 중앙광장 밝기·귀환 포탈 위치를 조정하며 AI 세종 추천센터 원형 플랫폼에 점프로 올라가고 내려오기.
- 변경 파일: `react-app/src/game/worldGuideEntryPoints.ts`, `src/app/page.home/api.py`, `react-app/src/game/renderers/VillageMapRenderer.ts`, `react-app/src/assets/jochwon-app/*` 빌드 산출물.
- 변경 내용: 중앙광장 귀환 포탈을 `(1200,1800)` 하단으로 이동, 스마트시티 카메라 추적을 GLB 하단 `(2800-35)`까지 확장, 중앙광장 노출·조명 값을 상향, AI 플랫폼 점프 단차를 명시했다. 기존 AI 플랫폼 전용 지면 샘플러가 점프 중 상판 착지와 이탈을 처리한다.
- 확인: `npm run build` 성공, `git diff --check` 통과, WIZ `main` 프로젝트 빌드 성공.
