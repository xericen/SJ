# 자연 맵 8개 포탈 위치 고정·편집 UI 제거 및 제목 크기 통일

## 사용자 요청

> 현재 내가 정한 위치로 픽스해주고, 위치 옮기는 버튼, 조절하는 바 사라지게 해줘, (8개모두) 그리고 세종호수 공원에 있는 포탈 제목 크기가 세종예술의전당, 축제부스 크기가 너무 큰데, 먹거리부스 제목 크기랑 맞춰줘.

## 변경 내용

- 체험 세션에서 정한 세종호수공원 5개·베어트리파크 3개 포탈 위치와 카메라 값을 브라우저 고정 저장소로 승격했다.
- 두 맵에서는 포탈 위치 이동 버튼과 카메라 조절 바가 더 이상 표시되지 않게 했다.
- `세종예술의전당`, `축제부스` 제목을 먹거리 부스와 같은 소형 제목 규격으로 통일했다.

## 변경 파일

- `react-app/src/pages/GamePage.tsx`
- `react-app/src/services/worldPortalPositions.ts`
- `react-app/src/services/worldCameraProfiles.ts`
- `react-app/src/game/renderers/VillageMapRenderer.ts`
- `react-app/scripts/experiencePortalCustomizer.test.ts`

## 확인 결과

- 관련 회귀 테스트 21건 통과
- React TypeScript, Vite, Node 서버 빌드 성공
- 성능 예산 검사 통과
