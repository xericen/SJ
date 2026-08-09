# 체험용 자연 맵 포탈·카메라 편집 및 포탈 제목 확대

## 사용자 요청

> 현재 체험용에서 세종호수 공원에 있는 포탈 위치 다 변경할 수 있게 해주라. 공동캠퍼스, 베어트리파크, 먹거리부스, 그리고 카메라 각도 조절하는 바 만들어줘, 그리고, 각 포탈 제목있잖아, 세종호수공원에 있는 포탈 제목, 베어트리파크에 있는 포탈 제목 총 5개 + 3개 총 8개 제목 크기 1.5배 키워주고, 세종추천코스 게시판은 없애줘

## 변경 내용

- 체험용 권한에서 세종호수공원 5개와 베어트리파크 3개 포탈을 캐릭터의 현재 위치로 이동하고 공용 저장할 수 있게 했다.
- 두 맵에서 카메라 상하·좌우 각도, 거리, 높이, 시야 범위를 조절하는 기존 공용 카메라 바를 함께 노출했다.
- 카메라 바 아래에 포탈 편집 버튼을 배치해 조작 UI가 겹치지 않게 했다.
- 두 맵의 포탈 제목을 기존 대비 1.5배 확대했다.
- 세종호수공원 월드의 세종 추천 코스 게시판 체험 지점을 제거했다.

## 변경 파일

- `react-app/src/game/lakeParkPortals.ts`
- `react-app/src/game/renderers/VillageMapRenderer.ts`
- `react-app/src/pages/GamePage.tsx`
- `react-app/src/pages/GamePage.css`
- `react-app/src/pages/LandingPage.tsx`
- `react-app/server/src/rooms/roomStore.ts`
- `react-app/server/src/models/WorldPortalPosition.ts`
- `src/app/page.home/api.py`
- `react-app/scripts/experiencePortalCustomizer.test.ts`
- `react-app/scripts/festivalPortal.test.ts`
- `react-app/scripts/worldPortalVisual.test.ts`

## 확인 결과

- 관련 포탈 회귀 테스트 20건 통과
- React TypeScript, Vite, Node 서버 빌드 성공
- 성능 예산 검사 통과
