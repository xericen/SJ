# 세 자연 맵 카메라 잠금 직접 검증

- 날짜: 2026-08-07
- ID: 018
- 리뷰 ID: rftazmwmdgilhtqsqmhtmxidaeroraqs

## 사용자 요청

수목원, 베어트리파크 , 곰체험소 카메라 각도 픽스해줘. 안됐는데 직접 베어트리파크 맵이랑, 수목원 맵, 곰 체험소 맵 들어가서 수정됐는지 확인까지 해줘

## 변경 파일

- `react-app/src/App.tsx`
- `react-app/src/game/worldNavigationProfile.ts`
- `react-app/src/components/WorldCameraEditor.tsx`
- `react-app/src/game/GameCanvas.tsx`
- `react-app/src/game/renderers/VillageMapRenderer.ts`

## 변경 내용

- `?previewMap=` 진입 경로를 추가해 비로그인 상태에서도 특정 공간 안내 맵을 직접 열 수 있게 했습니다.
- 수목원, 베어트리파크, 곰 체험소 카메라 잠금 목록을 유지하고, 저장 카메라 프로필 적용 경로를 재확인했습니다.
- 로컬 WIZ base 경로를 매핑한 정적 서버에서 세 맵을 직접 열어 GLB 렌더링과 카메라 편집 바 미노출을 확인했습니다.

## verification

- `npm run test:world-camera-editor`
- `npm run test:world-navigation`
- `npm run build`
- Chromium screenshot:
  - `http://127.0.0.1:4180/?previewMap=garden`
  - `http://127.0.0.1:4180/?previewMap=bear-tree-park`
  - `http://127.0.0.1:4180/?previewMap=bear-play-zone`
