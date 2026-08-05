# 동아리 거리제 포탈 위치 이동 버튼 이벤트 연결 수정

## 원문 요청사항

```text
내가 포탈 위치 바꿀 수 있게 해달라고 했는데, 현재 내가 동아리 거리제 맵에서 포탈 위치 옮기는 버튼 누르니까 실행이 안돼 수정해줘
```

## 변경 내용

- 동아리 거리제의 기존 포탈 편집 버튼이 수신자가 없는 레거시 이벤트를 보내던 문제를 확인했다.
- 버튼 클릭을 공용 포탈 편집 이벤트인 `world-portal-place-at-player`와 공동캠퍼스 목적지로 연결해 현재 캐릭터 위치로 즉시 이동하도록 수정했다.
- 동아리 거리제 포탈에 `positionEditable` 옵션을 추가해 레거시 편집 경로도 동작하도록 방어적으로 보강했다.
- 프런트 빌드 ID를 `20260805-club-portal-editor-v32`로 갱신하고 WIZ 정적 자산을 다시 빌드했다.

## 변경 파일

- `react-app/src/pages/GamePage.tsx`
- `react-app/src/game/renderers/VillageMapRenderer.ts`
- `react-app/index.html`
- `src/app/page.home/view.pug`
- `src/assets/jochwon-app/` 빌드 산출물

## 확인 결과

- 클라이언트 TypeScript 검사 통과
- 서버 TypeScript 검사 통과
- React 운영 빌드 및 성능 예산 검사 통과
- WIZ 프로젝트 빌드 성공
- 운영 정적 자산에서 빌드 ID `20260805-club-portal-editor-v32`와 최신 진입 번들 `index-uGqyoxT-.js` 반영 확인

## 운영 메모

- 버튼 클릭 시 현재 화면의 포탈 이동은 프런트에서 즉시 적용된다.
- 모든 사용자에게 동일 위치를 저장·전파하려면 운영 Node 실시간 서버에 공용 포탈 이벤트 구현을 배포하고 요청자 계정에 `portalEditor` 권한 또는 `PORTAL_EDITOR_USER_IDS` 허용 목록을 설정해야 한다.
