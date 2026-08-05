# 수목원 도착 좌표 강제 적용 및 축제 포탈 테스트 복구

- **ID**: 076
- **날짜**: 2026-08-05
- **유형**: 버그 수정
- **리뷰 ID**: qnsfeqwkrjjnwhwccrlgfajrtruuaaep

## 작업 요약

설정 객체에만 있던 수목원 도착 방향 보정을 실제 월드 씬 전환 경로의 명시적 좌표로 승격했다.
베어트리파크에서 수목원으로 이동하면 `(1200, 1400)`을 강제로 사용하고 첫 렌더 프레임에도 같은 안전 좌표를 다시 적용한다. 현재 포탈 편집 제외 정책과 어긋난 축제 포탈 테스트 기대값도 갱신했다.

## 원문 요청사항

```text
변경 요약
베어트리파크→수목원 이동 시 도착 위치를 포탈 아래쪽 (1200, 1400)으로 보정했습니다.
v86 정적 번들과 devlog 073을 반영했습니다.
확인한 내용
관련 테스트 5개 통과
React 전체 빌드 및 WIZ 일반 빌드 성공
런타임 엔트리 테스트 2개 통과
React/WIZ 정적 번들 일치 확인
남은 리스크
실제 브라우저에서의 수동 3D 이동 검증은 수행하지 않았습니다.
기존 축제 포탈 테스트 1건은 오래된 UI 기대값 때문에 실패하며 이번 변경과는 무관합니다. 이거 도착 위치를 포탈 아래쪽으로 해달라했는데 수정 안됨. 다시 확인해줘. 그리고 기존 축제 포탈 테스크 이거 해결해줘
```

## 변경 파일 목록

- `react-app/src/game/worldPortalArrivals.ts`: 베어트리파크→수목원 전용 도착 좌표 `(1200, 1400)` 정의
- `react-app/src/game/scenes/WorldScene.ts`: 맵 전환 시 경로별 강제 도착 좌표를 실제 씬 재시작 값으로 사용
- `react-app/src/game/renderers/VillageMapRenderer.ts`: 강제 도착 좌표를 안전 지형에 해석하고 첫 프레임에 재적용
- `react-app/scripts/bearTreePortals.test.ts`: 실제 경로 오버라이드 함수·씬 연결·첫 프레임 재적용 회귀 검증
- `react-app/scripts/festivalPortal.test.ts`: 현재 포탈 편집 제외 목록에 맞춰 오래된 기대값 수정
- `react-app/src/runtimeBuild.ts`: 런타임 빌드 ID를 `20260805-garden-arrival-v89`로 갱신
- `src/app/page.home/view.pug`: iframe 빌드 쿼리를 v89로 갱신
- `src/assets/jochwon-app/`: v89 React 프로덕션 번들 동기화
- `devlog.md`, `devlog/2026-08-05/076-enforce-garden-arrival-and-fix-festival-test.md`: 작업 이력 기록

## 확인 결과

- `npm run test:bear-tree-portals` 성공: 6개 테스트 통과
- `npm run test:festival-portal` 성공: 4개 테스트 통과
- `npm run build` 성공: 클라이언트 TypeScript, Vite 번들, 성능 예산, 서버 TypeScript 통과
- 성능 예산 통과: 초기 엔트리 286 KiB, 최대 JS gzip 310 KiB, 최대 3D 자산 21.64 MiB
- WIZ 일반 빌드(`clean=false`) 성공
- `npm run test:runtime-entry` 성공: 2개 테스트 통과
- React `dist`와 WIZ 정적 번들 전체 비교 일치
- 운영 WIZ 포탈 API에서 수목원 귀환 포탈 `(1200, 1260)` 확인
- 운영 정적 엔트리가 v89와 `index-DVrI9Uz5.js`를 응답하는 것을 확인
- 운영 GamePage 청크에서 `(1200, 1400)` 강제 좌표와 베어트리파크→수목원 분기 호출 확인
- `git diff --check` 통과

## 남은 리스크

- 현재 CLI 환경에는 브라우저 자동화 실행기가 없어 실제 캐릭터를 키보드로 움직이는 수동 3D 조작 검증은 수행하지 못했다.
