# 동아리 거리제 포탈 공용 저장 안정화 및 창설 부스 맨 앞 고정

- **ID**: 005
- **날짜**: 2026-08-06
- **유형**: 버그 수정
- **리뷰 ID**: xwohvcbxwjiuunmvapjvkzrazxfjkzgq

## 작업 요약

동아리 거리제의 공동캠퍼스 포탈이 WIZ 공용 좌표와 브라우저 로컬 좌표를 함께 사용하고, 별도 Node 세션의 권한 값이 WIZ 편집 권한을 덮어쓸 수 있던 충돌을 제거했다. 포탈 저장 실패 시 WIZ 원본 좌표를 즉시 다시 불러오고 오류 메시지를 표시하도록 보강했으며, 동아리 창설 부스는 이동 가능한 포탈과 무관하게 남쪽 입구의 첫 부스에 항상 배치되도록 고정했다.

## 원문 요청사항

```text
동아리 거리제맵에서 공동캠퍼스로 가는 포탈 위치를 조정하려고 하는데 계속 원점으로 돌아가는 현상이 있음, 내가 위치를 변경할 수 있게 해주고, 동아리 창설 부스가 너무 뒤쪽에 있음, 맨 앞에 부조건 있어야함. 이 부분은 픽스임
```

## 변경 파일 목록

- `react-app/src/game/renderers/VillageMapRenderer.ts`
  - 동아리 거리제 귀환 포탈을 브라우저 로컬 편집 대상이 아닌 WIZ 공용 좌표 대상으로 명시했다.
  - 창설 부스가 남쪽 입구의 `L5` 부스에 고정되도록 부스 앵커 순서를 앞쪽부터 선언하고, 이동 가능한 포탈 기준 재정렬을 제거했다.
- `react-app/src/pages/GamePage.tsx`
  - WIZ 세션의 포탈 편집 권한만 권위값으로 사용하고, 권한 사용자에게만 동아리 거리제 전용 이동 버튼을 노출했다.
  - 전용 버튼과 범용 편집 버튼의 중복 노출을 제거했다.
- `react-app/src/game/GameCanvas.tsx`
  - 포탈 공용 저장 실패 시 WIZ 저장 좌표를 즉시 재동기화하고 실패 사유를 사용자에게 전달하도록 보강했다.
- `react-app/scripts/clubStreetFestival.test.ts`, `react-app/package.json`
  - 포탈 권한·공용 저장 경로와 창설 부스 앞쪽 고정을 검증하는 회귀 테스트 2건을 추가했다.
- `react-app/src/runtimeBuild.ts`, `src/app/page.home/view.pug`
  - 런타임 빌드 ID를 `20260806-club-street-layout-v101`로 갱신했다.
- `src/assets/jochwon-app/`
  - 최신 React 운영 빌드를 WIZ 정적 자산에 동기화하고 이전 해시 번들을 정리했다.
- `devlog.md`, `devlog/2026-08-06/005-fix-club-street-portal-and-creator-booth.md`
  - 변경 내용과 검증 결과를 기록했다.

## 확인 결과

- `npm run test:club-street` 통과: 2건
- `npm run test:campus-portals` 통과: 4건
- `npm run test:runtime-entry` 통과: 2건
- `npm run build` 성공: 클라이언트 TypeScript, Vite 운영 번들, 성능 예산, 서버 TypeScript 통과
- React `dist`와 WIZ `src/assets/jochwon-app` 파일 내용 일치
- WIZ 일반 빌드(`clean: false`) 성공
- 운영 `/home` HTTP 200 확인
- 운영 정적 앱에서 빌드 ID `v101`과 엔트리 `index-B8mHekkK.js` 반영 확인

## 남은 리스크

- 요청자 계정의 기존 `portal_editor` 역할이 운영 사용자 테이블에서 유지되어야 편집 버튼이 노출된다.
- 실제 요청자 로그인 브라우저에서 원하는 최종 좌표를 지정하는 수동 조작은 수행하지 않았다.
