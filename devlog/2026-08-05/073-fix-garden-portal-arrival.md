# 수목원 포탈 도착 위치 보정

- **ID**: 073
- **날짜**: 2026-08-05
- **유형**: 버그 수정
- **리뷰 ID**: qnsfeqwkrjjnwhwccrlgfajrtruuaaep

## 작업 요약

베어트리파크에서 수목원으로 이동할 때 캐릭터가 기억나무 쪽에 겹치던 도착 방향을 반대로 보정했다.
수목원 귀환 포탈 `(1200, 1260)`을 기준으로 화면 아래쪽 안전 지점 `(1200, 1400)`에 도착하도록 설정하고 회귀 테스트를 추가했다.

## 원문 요청사항

```text
캐릭터가 기억나무 위에 올라가 있어서 움직일 수가 없는데, 베어트리파크에서 수목원으로 왔을 때 포탈보다 조금 더 아래에  들어올 수 있게 해줘
```

## 변경 파일 목록

- `react-app/src/game/renderers/VillageMapRenderer.ts`: 수목원 베어트리파크 귀환 포탈에 아래쪽 도착 방향 지정
- `react-app/scripts/bearTreePortals.test.ts`: 수목원 도착 방향과 예상 좌표 `(1200, 1400)` 회귀 검증 추가
- `react-app/src/runtimeBuild.ts`: 런타임 빌드 ID를 `20260805-garden-arrival-v86`으로 갱신
- `src/app/page.home/view.pug`: iframe 빌드 쿼리를 v86으로 갱신
- `src/assets/jochwon-app/`: v86 React 프로덕션 번들 동기화
- `devlog.md`, `devlog/2026-08-05/073-fix-garden-portal-arrival.md`: 작업 이력 기록

## 확인 결과

- `npm run test:bear-tree-portals` 성공: 5개 테스트 통과
- `npm run build` 성공: 클라이언트 TypeScript, Vite 번들, 성능 예산, 서버 TypeScript 통과
- 성능 예산 통과: 초기 엔트리 286 KiB, 최대 JS gzip 310 KiB, 최대 3D 자산 21.64 MiB
- WIZ 일반 빌드(`clean=false`) 성공
- `npm run test:runtime-entry` 성공: 2개 테스트 통과
- React `dist`와 WIZ 정적 번들 전체 비교 일치
- 배포 GamePage 청크에 `arrivalDirection` 설정 포함 확인
- `git diff --check` 통과
- 참고: 기존 `npm run test:festival-portal`은 현재 포탈 편집 UI 조건과 오래된 정규식 기대값 불일치로 4개 중 1개 실패하며, 이번 도착 위치 변경과는 무관하다.

## 남은 리스크

- 실제 브라우저에서 베어트리파크 포탈을 통과한 뒤 수목원 지형 위 도착과 이동 가능 여부를 직접 조작하는 수동 3D 검증은 수행하지 않았다.
- 축제 포탈 회귀 테스트의 오래된 UI 기대값은 별도 정리가 필요하다.
