# 모집센터 공동캠퍼스 귀환 포탈 공용 좌표 고정 및 편집 제거

- **ID**: 035
- **날짜**: 2026-08-06
- **유형**: UX·공용 상태 고정
- **리뷰 ID**: udcvbdywmlrnmptjpkcatbtxawfyzjay

## 작업 요약

운영 WIZ 공용 API에서 요청자가 저장한 모집센터의 공동캠퍼스 귀환 포탈 좌표 `(1200, 2014)`를 확인해 React·WIZ·Node 서버의 고정 기준으로 반영했다. 모집센터의 명시적 편집 버튼과 공용 편집 목록 노출을 제거하고, API·실시간 저장소·DB 정규화·클라이언트 동기화에서도 해당 포탈의 추가 변경을 차단했다.

## 원문 요청사항

```text
공동캠퍼스로 가는 포탈 위치 내가 정해뒀는데 거기로 픽스해줘 다른 사용자들도 그곳으로 포탈 보일 수 있게, 그리고 위치 옮기는 버튼 삭제해줘
```

## 변경 파일 목록

- `react-app/shared/world-portals.ts`, `react-app/src/game/worldGuideEntryPoints.ts`
  - 모집센터 공동캠퍼스 포탈 기준 좌표를 `(1200, 2014)`로 통일했다.
- `react-app/src/pages/GamePage.tsx`
  - 모집센터 전용 위치 이동 버튼을 삭제하고 공용 편집 목록에서도 모집센터를 제외했다.
- `react-app/src/game/renderers/VillageMapRenderer.ts`
  - 외부 실시간 좌표 동기화가 모집센터 고정 좌표를 덮어쓰지 못하도록 차단했다.
- `react-app/server/src/rooms/roomStore.ts`, `react-app/server/src/models/WorldPortalPosition.ts`, `react-app/server/src/socket/registerSocketHandlers.ts`
  - 메모리 저장, DB 로드·저장 정규화, Socket.IO 저장 요청에서 모집센터 포탈을 고정했다.
- `src/app/page.home/api.py`
  - WIZ 기본 좌표를 갱신하고 모집센터 포탈 키를 canonical 고정 목록에 추가했다.
- `react-app/scripts/campusPortals.test.ts`
  - 고정 좌표, UI 제거, 모든 저장 우회 차단을 검증하도록 회귀 테스트를 전환했다.
- `react-app/src/runtimeBuild.ts`, `src/app/page.home/view.pug`
  - 런타임 빌드 ID를 `20260806-fixed-recruitment-campus-portal-v132`로 갱신했다.
- `src/assets/jochwon-app/`
  - 최신 React 프로덕션 빌드 143개 파일을 WIZ 정적 자산에 동기화했다.
- `devlog.md`, `devlog/2026-08-06/035-freeze-recruitment-campus-portal.md`
  - 변경 및 검증 결과를 기록했다.

## 확인 결과

- 운영 WIZ 공용 API에서 `recruitment-center → campus = (1200, 2014)` 확인
- 공동캠퍼스·축제·정부청사·동아리 거리제·런타임 회귀 테스트 21건 통과
- `npm run build` 성공: 클라이언트 TypeScript, Vite 운영 번들, 성능 예산, 서버 TypeScript 통과
- React `dist`와 WIZ `src/assets/jochwon-app` 143개 파일 일치
- WIZ 일반 빌드(`clean: false`) 성공
- 운영 정적 앱과 엔트리 JavaScript HTTP 200 확인
- 운영 빌드 ID `20260806-fixed-recruitment-campus-portal-v132` 반영 확인
- 운영 번들에서 모집센터 포탈 위치 이동 버튼 문구 제거 확인
- Python 구문 검사 및 `git diff --check` 통과

## 남은 리스크

- 이미 이전 번들을 열어 둔 사용자는 새 고정 좌표와 버튼 제거를 확인하려면 새로고침해야 한다.
- 요청자·일반 사용자 두 계정을 동시에 접속시킨 수동 시각 검증은 수행하지 않았다.
