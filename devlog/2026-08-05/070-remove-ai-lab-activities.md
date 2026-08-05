# AI 탐험 연구소 곰 조사·서식지 설계 활동 제거

- **ID**: 070
- **날짜**: 2026-08-05
- **유형**: UX 정리
- **리뷰 ID**: hivjcosuvpllmtbmeuwdeskzwjexzfeu

## 작업 요약

AI 탐험 연구소에서 노출되던 불곰·반달가슴곰 조사 표식과 곰 서식지 설계 활동 UI를 제거했다. 연구소 맵, 배경 곰 오브젝트, 베어트리파크 귀환 포털은 유지하고 관련 안내·진행 단계는 자유 관람 기준으로 정리했다.

## 원문 요청사항

```text
ai탐험 연구소에 있는 현재 활동들 다 없애줘, 곰 서식지 하는 그거 없애줘
```

## 변경 파일 목록

- `react-app/src/game/GameCanvas.tsx`
  - 곰 서식지 설계 컴포넌트 렌더링과 곰 활동 진행 이벤트 연결을 제거했다.
  - AI 탐험 연구소 로딩 문구를 활동 안내가 아닌 자유 관람 안내로 변경했다.
- `react-app/src/game/renderers/VillageMapRenderer.ts`
  - 불곰·반달가슴곰 조사 표식과 AI 활동 포털 강조 상태를 제거했다.
  - 연구소의 배경 곰 오브젝트와 베어트리파크 귀환 포털은 유지했다.
- `react-app/src/components/NatureDiscoveryGuide.tsx`
  - 자연 체험 여정에서 AI 생태 탐험 단계를 제거하고 수목원·포토존 2단계로 정리했다.
- `react-app/src/pages/LandingPage.tsx`
  - AI 탐험 연구소 소개를 조사·퀴즈 체험에서 자유 관람 안내로 변경했다.
- `react-app/scripts/bearTreePortals.test.ts`
  - AI 연구소 조사 표식·서식지 UI·진행 이벤트 제거를 검증하는 회귀 조건을 추가했다.
- `react-app/src/runtimeBuild.ts`, `src/app/page.home/view.pug`
  - 런타임 빌드 ID를 `20260805-remove-ai-lab-activities-v83`으로 갱신했다.
- `src/assets/jochwon-app/`
  - 최신 React 프로덕션 산출물로 교체했다.

## 확인 결과

- `npm run test:bear-tree-portals` 성공: 4개 통과
- `npm run test:bear-photo-zone` 성공: 3개 통과
- `npm run test:festival-portal` 성공: 4개 통과
- `npm run test:runtime-entry` 성공: 2개 통과
- `npm run build` 성공: 클라이언트 TypeScript, Vite 번들, 성능 예산, 서버 TypeScript 통과
- 성능 예산 통과: 초기 엔트리 286 KiB, 최대 JS gzip 319 KiB, 최대 3D 자산 21.64 MiB
- React `dist`와 WIZ `src/assets/jochwon-app` 전체 파일 일치 확인
- WIZ 일반 빌드(`clean: false`) 성공
- `git diff --check` 통과

## 남은 리스크

- 이미 이전 버전 화면을 열어 둔 사용자는 새로고침해야 제거된 활동 UI와 조사 표식이 사라진다.
- 실제 3D 공간에서 조사 표식이 사라지고 귀환 포털·배경 곰이 유지되는지 직접 이동하며 확인하는 수동 시각 검증은 수행하지 않았다.
