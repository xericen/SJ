# 수목원·베어트리파크 카메라 각도 고정

- 날짜: 2026-08-07
- ID: 017
- 리뷰 ID: rftazmwmdgilhtqsqmhtmxidaeroraqs

## 사용자 요청

수목원, 베어트리파크 카메라 각도 픽스해줘.

## 변경 파일

- `react-app/src/game/worldNavigationProfile.ts`
- `react-app/src/components/WorldCameraEditor.tsx`
- `react-app/src/game/GameCanvas.tsx`
- `react-app/src/game/renderers/VillageMapRenderer.ts`

## 변경 내용

- 수목원, 베어트리파크, 곰 체험소를 카메라 프로필 잠금 대상 목록으로 묶었습니다.
- 잠금 대상에서는 카메라 조절 UI를 숨기고, 저장된 공용/세션 카메라 프로필이 렌더러에 적용되지 않도록 차단했습니다.
- 렌더러의 `applyWorldCameraProfile`에도 잠금 맵 방어 로직을 추가했습니다.

## verification

- `npm run test:world-camera-editor`
- `npm run test:world-navigation`
- `npm run build`
