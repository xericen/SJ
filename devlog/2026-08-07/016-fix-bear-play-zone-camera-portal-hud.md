# 곰 체험소 카메라·포탈·HUD 보정

- 날짜: 2026-08-07
- ID: 016
- 리뷰 ID: rftazmwmdgilhtqsqmhtmxidaeroraqs

## 사용자 요청

곰체험소에서 카메라 각도 픽스랑, 베어트리파크로가는 포탈 위치 픽스해줘서 위에 조절하는 바랑, 위치 변경 포탈 없애줘, 그리고 왼쪽 상단에 현재 위치만 뜨는데 현재활동중도 넣어줘

## 변경 파일

- `react-app/src/game/worldNavigationProfile.ts`
- `react-app/src/components/WorldCameraEditor.tsx`
- `react-app/src/game/GameCanvas.tsx`
- `react-app/src/game/renderers/VillageMapRenderer.ts`
- `react-app/src/pages/GamePage.tsx`
- `project/main/src/app/page.home/api.py`

## 변경 내용

- 곰 체험소 전용 카메라 기본 프로필을 추가해 고정 각도와 캐릭터 크기를 적용했습니다.
- 곰 체험소에서는 카메라 조절 바를 숨기고 저장된 카메라 프로필도 렌더러에 적용하지 않도록 했습니다.
- 곰 체험소의 베어트리파크 귀환 포탈은 기본 좌표만 사용하도록 클라이언트와 WIZ API의 포탈 위치 변경 경로를 차단했습니다.
- 좌측 상단 HUD에 `현재 활동 중` 상태를 추가했습니다.

## verification

- `npm run test:world-camera-editor`
- `npm run test:world-navigation`
- `npm run build`
