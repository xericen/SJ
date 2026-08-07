# 061 전망대 3초 귀환·정부청사 캐릭터 upright·스마트시티 포탈 위치 보정

- 요청: 전망대→정부청사 3초 이동 미적용 원인 수정, 정부청사 캐릭터 확대, 맵 기울어짐 수정, 스마트시티 귀환 포탈을 조금 위로 이동.
- 원인: 전망대 포탈 설정에 `chargeSeconds`가 누락되어 키 상호작용 경로로 처리되고 있었고, 캐릭터 회전에 GLB 바닥 법선을 적용해 경사면에서 몸이 기울어졌다.
- 변경 파일: `react-app/src/game/renderers/VillageMapRenderer.ts`, `react-app/src/game/worldGuideEntryPoints.ts`, `src/app/page.home/api.py`, `react-app/src/assets/jochwon-app/*` 빌드 산출물.
- 변경 내용: 전망대 포탈에 `chargeSeconds:3` 추가, 정부청사 캐릭터 높이를 165로 조정, 캐릭터 회전은 항상 수직으로 유지하면서 발 높이는 지면을 따르도록 수정, 스마트시티 포탈 좌표를 `(1200,2500)`으로 상향.
- 확인: `npm run build` 성공, `git diff --check` 통과, WIZ `main` 프로젝트 빌드 성공.
