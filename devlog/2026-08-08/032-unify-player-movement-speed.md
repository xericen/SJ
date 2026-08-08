# 세종예술의전당 기준 플레이어 이동 속도 전 맵 통일

- 원 요청: 맵마다 다른 플레이어 이동 속도를 세종예술의전당 기준으로 통일.
- 기준값: 걷기 180, 달리기 280.
- 변경 파일: `react-app/src/game/worldNavigationProfile.ts`, `react-app/src/game/scenes/WorldScene.ts`.
- 변경 내용: 예술의전당 이동값을 공통 `PLAYER_MOVEMENT_SPEED`로 명시하고 모든 맵의 실제 플레이어 이동 계산이 이 상수를 사용하도록 고정.
- 확인: React 빌드 및 WIZ 운영 배포 후 운영 번들에 공통 속도 로직 포함 확인.
