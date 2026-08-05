# AI 탐험 연구소 명칭을 곰 체험소로 전체 통일

- **ID**: 074
- **날짜**: 2026-08-05
- **유형**: UX 문구 변경
- **리뷰 ID**: hivjcosuvpllmtbmeuwdeskzwjexzfeu

## 작업 요약

기존 `AI 탐험 연구소`와 `AI 생태 연구소` 명칭을 사용자 화면 전반에서 `곰 체험소`로 통일했다. 공간 안내, 포털, 맵 로딩·현재 위치, 미리보기, 프로필 기록, 튜토리얼에 동일한 명칭이 노출되도록 정리했다.

## 원문 요청사항

```text
ai 탐험연구소를 -> 곰 체험소로 이름 변경하고 공간안내나 다 이름 변경해줘
```

## 변경 파일 목록

- `react-app/shared/world-portals.ts`
  - 공용 월드 이름을 `곰 체험소`로 변경했다.
- `react-app/src/game/GameCanvas.tsx`, `react-app/src/game/scenes/WorldScene.ts`
  - 맵 로딩 화면과 현재 위치 이벤트 명칭을 변경했다.
- `react-app/src/game/renderers/VillageMapRenderer.ts`
  - 베어트리파크 포털 라벨·버튼과 대상 맵 이름을 변경했다.
- `react-app/src/pages/LandingPage.tsx`, `react-app/src/pages/MapPreviewPage.tsx`
  - 공간 안내 카드와 맵 미리보기 명칭·설명을 변경했다.
- `react-app/src/pages/GamePage.tsx`
  - 현재 위치 칩, 자연 공간 레이아웃 판정, 발견 라벨을 `곰 체험소` 기준으로 변경했다.
- `react-app/src/services/experienceHarness.ts`, `react-app/src/services/profileProgress.ts`
  - 체험 기록·프로필 구역의 명칭을 변경했다.
- `react-app/src/components/BearTreeParkTutorial.tsx`, `react-app/src/components/BearHabitatDesignExperience.tsx`, `react-app/src/components/BearTravelStyleExperience.tsx`
  - 관련 안내 문구의 기존 연구소 명칭을 변경했다.
- `react-app/scripts/bearTreePortals.test.ts`
  - 주요 화면과 공간 안내의 명칭 통일 회귀 검증을 추가했다.
- `react-app/src/runtimeBuild.ts`, `src/app/page.home/view.pug`
  - 런타임 빌드 ID를 `20260805-rename-bear-experience-v87`로 갱신했다.
- `src/assets/jochwon-app/`
  - 최신 React 프로덕션 산출물로 교체했다.

## 확인 결과

- `npm run test:bear-tree-portals` 성공: 6개 통과
- `npm run test:runtime-entry` 성공: 2개 통과
- `npm run build` 성공: 클라이언트 TypeScript, Vite 번들, 성능 예산, 서버 TypeScript 통과
- 성능 예산 통과: 초기 엔트리 286 KiB, 최대 JS gzip 310 KiB, 최대 3D 자산 21.64 MiB
- React `src`, `shared`, `dist`에서 기존 연구소 명칭 미포함 확인
- React `dist`와 WIZ `src/assets/jochwon-app` 전체 파일 일치 확인
- WIZ 일반 빌드(`clean: false`) 성공
- `git diff --check` 통과

## 남은 리스크

- 이미 이전 버전 화면을 열어 둔 사용자는 새로고침해야 `곰 체험소` 명칭이 반영된다.
- 실제 브라우저의 공간 안내 카드와 3D 포털 라벨을 직접 확인하는 수동 시각 검증은 수행하지 않았다.
