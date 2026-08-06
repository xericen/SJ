# 수목원 마이홈·베어트리파크 포탈 공용 좌표 고정

- **ID**: 052
- **날짜**: 2026-08-06
- **유형**: UX·공용 상태 고정
- **리뷰 ID**: wjsgarhsznylkbbudnfdilmfjoelfoct

## 작업 요약

운영 WIZ 공용 API에서 요청자가 저장한 수목원 포탈 두 개의 좌표를 확인해 React·WIZ·실시간 서버의 기준 좌표로 통일했다. 수목원 화면의 포탈 위치 이동 버튼을 제거하고, 브라우저 이벤트·WIZ API·Socket.IO·서버 저장소·기존 DB 복원 경로에서도 추가 좌표 변경을 차단했다.

## 원문 요청사항

```text
수목원에 내가 현재 마이홈으로 가는 포탈, 베어트리파크로 가는 포탈 위치 정해뒀는데 그 부분 픽스해줘 다른 분들도 그렇게 보일 수 있게, 그리고 위치 이동하는 버튼 없애줘
```

## 변경 파일 목록

- `react-app/shared/world-portals.ts`: 수목원→베어트리파크 `(1218,1585)`, 수목원→마이홈 `(1196,258)` 공용 기본 좌표 반영
- `react-app/src/game/worldGuideEntryPoints.ts`, `react-app/src/game/renderers/VillageMapRenderer.ts`: 수목원 렌더러의 고정 포탈 좌표 적용 및 실시간 덮어쓰기 차단
- `react-app/src/pages/GamePage.tsx`, `react-app/src/game/GameCanvas.tsx`: 수목원 포탈 위치 이동 UI와 클라이언트 저장 이벤트 차단
- `react-app/server/src/rooms/roomStore.ts`, `react-app/server/src/socket/registerSocketHandlers.ts`, `react-app/server/src/models/WorldPortalPosition.ts`: Socket.IO·메모리·MySQL 저장 우회 차단 및 기준 좌표 강제
- `src/app/page.home/api.py`: WIZ 공용 기본값 반영, 수목원 고정 맵·고정 키 등록
- `react-app/scripts/bearTreePortals.test.ts`, `react-app/scripts/campusPortals.test.ts`: 수목원 좌표·UI·저장 차단 회귀 검증 추가 및 기존 기대값 갱신
- `react-app/src/runtimeBuild.ts`, `src/app/page.home/view.pug`: 런타임 빌드 ID를 `20260806-fixed-garden-portals-v147`로 갱신
- `src/assets/jochwon-app/`: 최신 React 프로덕션 번들 동기화 및 이전 해시 JavaScript 정리
- `devlog.md`, `devlog/2026-08-06/052-freeze-garden-portals.md`: 작업 이력 기록

## 확인 결과

- 변경 전 운영 WIZ API에서 요청자 저장 좌표 `(1218,1585)`, `(1196,258)` 확인
- 변경 후 운영 WIZ API가 동일한 수목원 포탈 두 좌표를 공용 값으로 반환하는 것을 확인
- `npm run test:bear-tree-portals` 성공: 수목원 고정 좌표·편집 차단 포함 10개 통과
- `npm run test:campus-portals` 성공: 기존 공용 포탈 회귀 9개 통과
- `npm run test:runtime-entry` 성공: 운영 엔트리·캐시·스타일 검증 6개 통과
- `npm run build` 성공: React TypeScript, Vite 프로덕션 번들, 성능 예산, Express TypeScript 통과
- `src/app/page.home/api.py` Python 구문 검사 및 WIZ 일반 빌드 성공
- `react-app/dist/`와 `src/assets/jochwon-app/` 전체 파일·내용 일치 확인

## 남은 리스크

- 이미 수목원 화면을 열어 둔 사용자는 새로고침해야 고정 좌표와 위치 이동 버튼 제거를 확인할 수 있다.
- 여러 사용자 계정을 동시에 접속시킨 수동 시각 검증은 수행하지 않았다.
