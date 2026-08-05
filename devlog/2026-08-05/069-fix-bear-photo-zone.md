# 베어트리파크 곰 형상 제거 및 포토존 공용 위치 고정

- **ID**: 069
- **날짜**: 2026-08-05
- **유형**: UX 개선
- **리뷰 ID**: fcxythrwehrrelwteeqgegazjvkxooaz

## 작업 요약

베어트리파크에 별도로 배치했던 곰 형상 세 개를 제거했다. 요청자의 최신 저장 좌표를 확인해 곰 가족 포토존을 `(1478, 1479)`에 공용 고정하고, 사용자별 로컬 좌표 적용과 위치 변경 버튼을 제거했다.

## 원문 요청사항

```text
베어트리파크에 곰형상이 남아있는데 이거 지워주라,, 그리고 포토존 위치 도 지금으로 픽스해줘서 다른 사람도 이 위치로 보일 수 있게 수정해주고, 위치 바꾸는 버튼 없애줘
```

## 변경 파일 목록

- `react-app/src/game/renderers/VillageMapRenderer.ts`
  - 베어트리파크 전용 곰 resident 형상과 장식 형상을 제거했다.
  - 포토존 로컬 좌표 불러오기·저장 및 위치 변경 이벤트를 제거했다.
- `react-app/src/game/bearPhotoZonePosition.ts`
  - 포토존 공용 좌표를 `(1478, 1479)`로 확정했다.
- `react-app/src/pages/GamePage.tsx`, `react-app/src/pages/GamePage.css`
  - 베어트리파크 포토존 위치 변경 버튼과 전용 스타일을 제거했다.
- `react-app/server/src/rooms/roomStore.ts`
  - 실시간 서버가 전달하는 포토존 기준 좌표를 동일한 공용 좌표로 맞췄다.
- `react-app/src/pages/LandingPage.tsx`
  - 제거된 곰 관찰 표현을 포토존·숲길 안내로 교체했다.
- `react-app/scripts/bearPhotoZone.test.ts`
  - 공용 좌표, 편집 경로 제거, 베어트리파크 곰 형상 제거 회귀 검증으로 갱신했다.
- `react-app/src/runtimeBuild.ts`, `src/app/page.home/view.pug`
  - 런타임 빌드 ID를 `20260805-fix-bear-photo-zone-v82`로 갱신했다.
- `src/assets/jochwon-app/`
  - 최신 React 프로덕션 산출물로 동기화했다.

## 확인 결과

- 인증 사용자 행동 상태에서 최신 `bear-photo-zone-position` 값이 `(1478, 1479)`임을 읽기 전용으로 확인했다.
- `npm run test:bear-photo-zone` 성공: 3개 통과
- `npm run test:bear-tree-portals` 성공: 4개 통과
- `npm run test:festival-portal` 성공: 4개 통과
- `npm run test:runtime-entry` 성공: 2개 통과
- `npm run build` 성공: 클라이언트 TypeScript, Vite 번들, 성능 예산, 서버 TypeScript 통과
- 성능 예산 통과: 초기 엔트리 286 KiB, 최대 JS gzip 310 KiB, 최대 3D 자산 21.64 MiB
- React `dist`와 WIZ `src/assets/jochwon-app` 전체 파일 일치 확인
- WIZ 일반 빌드(`clean: false`) 성공
- 운영 엔트리와 GamePage 청크 HTTP 200 확인
- 운영 렌더러 청크에서 공용 좌표 `(1478, 1479)` 반영 및 위치 편집 이벤트·문구 미포함 확인
- `git diff --check` 통과

## 남은 리스크

- 기존 브라우저 탭은 이전 번들을 유지할 수 있어 새로고침이 필요하다.
- 실제 3D 공간에서 곰 형상 제거와 포토존 진입 원 위치를 직접 걸어가며 확인하는 수동 시각 검증은 수행하지 않았다.
