# 정부청사 이동 최적화 및 완료 프로젝트 기반 일정·인라인 지도 연결

- 원 요청: 정부청사 렉 완화와 이동 속도 2/3 조정, 프로젝트실 완료 프로젝트 불러오기, AI 코스 최적화 및 03 일정·지도 흐름 수정.
- 변경 파일: `react-app/src/game/scenes/WorldScene.ts`, `react-app/src/game/renderers/VillageMapRenderer.ts`, `react-app/src/components/GovernmentCentralPlazaWebUI.tsx`, `react-app/src/components/GovernmentThreeStage.css`, `devlog.md`.
- 변경 내용: 정부청사 렌더링을 30fps·낮은 픽셀 비율·간소화 충돌 샘플링으로 조정하고 해당 맵 이동 속도를 2/3로 낮췄다. 01·02에서 실제 `completed` 프로젝트실 데이터를 불러오며, QR과 새 창 링크를 제거하고 03에 인라인 카카오지도 iframe을 추가했다.
- 확인: 런타임 회귀 테스트 5건 통과, React/Vite/서버 빌드 및 성능 예산 검증 성공.
- 남은 리스크: 운영 프로젝트 데이터가 아직 `completed` 상태가 아니면 01에 표시되지 않는다. 카카오 지도 제공 정책에 따라 iframe 표시가 제한될 수 있다.
