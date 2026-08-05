# 공동캠퍼스 포탈 5개 공용 좌표 고정

- **ID**: 078
- **날짜**: 2026-08-05
- **유형**: UX·공용 상태 고정
- **리뷰 ID**: ubhnpywyyudignpzxnhbzznfezhtzgax

## 작업 요약

운영 WIZ 공용 API에서 요청자가 저장한 공동캠퍼스 포탈 5개의 좌표를 확인해 React·WIZ·Node 서버의 기준 좌표로 통일했다. 공동캠퍼스 화면의 위치 이동 버튼과 브라우저별 좌표 저장 경로를 제거하고, WIZ API·Socket.IO·메모리 저장소·DB 정규화에서도 추가 변경을 차단했다.

## 원문 요청사항

```text
공동캠퍼스에 내가 5개 포탈 위치 지정해뒀는데 이것도 다른 사람들도 이 위치로 ㅍ픽스될 수 있게 고정해주고, 위치 옮기는 버튼 없애줘.
```

## 변경 파일 목록

- `react-app/shared/world-portals.ts`: 공동캠퍼스 포탈 5개 공용 좌표 반영
- `react-app/src/game/renderers/VillageMapRenderer.ts`: 캠퍼스 시설 포탈의 로컬 좌표 복원 및 실시간 덮어쓰기 차단
- `react-app/src/game/GameCanvas.tsx`: 캠퍼스 포탈 위치 이동·저장 이벤트 제거
- `react-app/src/pages/GamePage.tsx`: 공동캠퍼스 전용·공용 위치 이동 버튼 제거
- `react-app/server/src/models/CampusFeaturePortal.ts`, `react-app/server/src/models/WorldPortalPosition.ts`: 과거 DB 값 대신 확정 좌표 강제
- `react-app/server/src/rooms/roomStore.ts`, `react-app/server/src/socket/registerSocketHandlers.ts`: 직접 위치 변경 요청 차단
- `src/app/page.home/api.py`: WIZ 공용 기본 좌표 반영 및 공동캠퍼스 저장 차단
- `react-app/scripts/campusPortals.test.ts`, `react-app/scripts/bearTreePortals.test.ts`, `react-app/scripts/festivalPortal.test.ts`, `react-app/package.json`: 고정 정책 회귀 테스트 추가·보정
- `react-app/src/runtimeBuild.ts`, `src/app/page.home/view.pug`: 런타임 빌드 ID를 `20260805-fixed-campus-portals-v92`로 갱신
- `src/assets/jochwon-app/`: 최신 React 프로덕션 번들 동기화 및 이전 해시 JavaScript 정리

## 확인 결과

- 운영 WIZ 공용 API에서 공동캠퍼스 5개 좌표가 `(1120,1731)`, `(881,950)`, `(1537,499)`, `(817,1318)`, `(1590,1543)`으로 반환되는 것을 확인
- `npm run test:campus-portals` 3개 통과: 기준 좌표, UI·로컬 저장 제거, 클라이언트·서버 우회 차단
- 베어트리파크 6개, 축제 포탈 4개, 런타임 엔트리 2개 회귀 테스트 통과
- `npm run build` 성공: 클라이언트 TypeScript, Vite 프로덕션 번들, 성능 예산, 서버 TypeScript 통과
- `src/app/page.home/api.py` Python 구문 검사 및 WIZ 일반 빌드 성공
- React `dist`와 WIZ 정적 자산 파일 목록·내용 일치, `git diff --check` 통과

## 남은 리스크

- 이미 이전 번들을 열어 둔 사용자는 새로고침해야 위치 이동 버튼 제거와 고정 좌표를 확인할 수 있다.
- 여러 사용자 계정을 동시에 접속시킨 수동 시각 검증은 수행하지 않았다.
