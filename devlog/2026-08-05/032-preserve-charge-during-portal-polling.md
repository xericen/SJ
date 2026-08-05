# 포탈 위치 주기 동기화로 인한 2.5초 충전 초기화 제거

## 사용자 원문 요청

> 포탈 위치 가만히 서있는데, 1,2, 하고 걍 꺼져버림 이 부분 해결해줘, 그리서 현재 세종호수 공원 맵에서 다른 맵으로 이동할 수가 없음.

## 원인

- 클라이언트가 2.5초마다 공용 포탈 위치를 다시 조회했습니다.
- 좌표가 전혀 바뀌지 않아도 `setPortalPosition()`이 충전 상태를 무조건 초기화해 3초 완료 전에 카운트가 사라졌습니다.

## 변경 파일

- `src/assets/jochwon-app/assets/WorldEngine-portal-v50.js`
  - 동기화된 포탈 좌표가 기존 좌표와 0.5 미만 차이면 위치 갱신과 충전 초기화를 건너뜁니다.
  - 실제 좌표가 변경된 경우에만 기존 충전을 취소하고 새 위치를 적용합니다.
  - v49의 3초 실시간 측정과 충전 대상 고정 로직을 유지합니다.
- `src/assets/jochwon-app/assets/GamePage-portal-v50.js`, `src/assets/jochwon-app/assets/index-portal-v50.js`
  - 수정된 엔진을 확실히 새로 받도록 전체 실행 체인을 v50으로 갱신했습니다.
- `src/assets/jochwon-app/index.html`, `src/app/page.home/view.pug`
  - 실제 실행 엔트리와 iframe 빌드 ID를 v50으로 전환했습니다.
- `react-app/src/game/renderers/VillageMapRenderer.ts`
  - 동일 좌표 동기화 무시, 실시간 3초 측정, 충전 대상 유지 및 5개 포탈의 140 활성 반경을 원본 렌더러에도 반영했습니다.

## 검증 결과

- 5개 목적지 각각에서 동일 포탈 좌표를 2.5초에 다시 적용해도 충전 시작 시각이 유지되고 3초 시점에 이동하는 회귀 검사를 통과했습니다.
- 실제 좌표 변경 시에만 충전이 초기화되는 것을 확인했습니다.
- 운영 API가 반환하는 세종호수공원 5개 좌표가 렌더러의 포탈 좌표와 모두 일치하는 것을 확인했습니다.
- 운영 URL의 v50 엔트리 체인, JavaScript 구문 검사 및 WIZ 일반 빌드를 확인했습니다.
- React 원본의 TypeScript 검사도 통과했습니다.
