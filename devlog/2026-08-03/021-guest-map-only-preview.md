# 비로그인 16개 월드의 캐릭터 없는 맵 둘러보기 지원

## 사용자 원문 요청

> 로그인을 하지 않은 상태로, 16개의 실제 월드를 3D로 보고싶으면 체험하기 누르면 캐릭터 없이 맵만 볼 수 있게 해줘

## 변경 내용

- 비로그인 사용자가 16개 월드 카드의 입장 버튼을 누르면 로그인 화면 대신 전용 맵 둘러보기 화면으로 진입하도록 변경했다.
- 비로그인 상태의 월드 진입 버튼 문구를 `캐릭터 없이 맵 둘러보기`로 명확히 표시했다.
- 둘러보기 모드에서는 로컬·원격 캐릭터와 NPC를 로드하지 않고 Socket.IO 월드 참여 및 체험 기록 저장도 수행하지 않는다.
- WASD/Shift로 맵을 이동해 살펴볼 수 있으며, 상단에서 공간 안내로 돌아가거나 로그인 후 전체 체험으로 전환할 수 있다.
- 로그인 사용자의 기존 캐릭터 월드 진입과 인증 가드는 그대로 유지했다.

## 변경 파일

- `react-app/src/App.tsx`
- `react-app/src/pages/LandingPage.tsx`
- `react-app/src/game/GameCanvas.tsx`
- `react-app/src/game/renderers/VillageMapRenderer.ts`
- `react-app/src/game/scenes/WorldScene.ts`
- `react-app/src/pages/MapPreviewPage.tsx`
- `react-app/src/pages/MapPreviewPage.css`
- `devlog.md`
- `devlog/2026-08-03/021-guest-map-only-preview.md`

## 확인 결과

- `react-app`에서 `npm run build` 성공
- WIZ `main` 프로젝트 일반 빌드 성공
- `git diff --check` 통과
- 비로그인 미리보기 모드에서 캐릭터/NPC 옵션 비활성화, 소켓 월드 참여 및 이동 이벤트 전송 차단을 코드 경로로 확인

## 남은 리스크

- 실제 브라우저에서 16개 대용량 GLB를 각각 끝까지 로드하는 수동 회귀 검증은 수행하지 않았다.
