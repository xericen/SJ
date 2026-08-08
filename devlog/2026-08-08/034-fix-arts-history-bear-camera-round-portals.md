# 예술의전당 활동 중복 정리·베어트리 카메라·원형 포탈 통일

- 원 요청: 예술의전당 관심 포스터와 최근활동 연결 보정, 베어트리파크 카메라 거리 1.5배, 전 맵 포탈 원형 통일.
- 변경 파일: `react-app/src/services/experienceHarness.ts`, `react-app/src/game/worldNavigationProfile.ts`, `react-app/src/game/worldPortalVisual.ts`.
- 변경 내용: 예술의전당 활동은 공연 제목 기준으로 중복 병합하고, 베어트리 카메라 거리를 1200에서 1800으로 확대했으며, 포탈 외형을 모든 맵에서 white-circle로 강제했습니다.
- 확인: React 빌드 및 WIZ 운영 배포 후 운영 번들 정적 응답 확인.
