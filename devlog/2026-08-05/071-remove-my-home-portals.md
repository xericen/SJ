# 마이홈 외부 포탈 제거 및 미션 상태 재배치

- **ID**: 071
- **날짜**: 2026-08-05
- **유형**: UX 정리
- **리뷰 ID**: eomekrwtkcejfkvaamszzecababygiyc

## 작업 요약

마이홈에 있던 세종호수공원·베어트리파크·세종수목원 이동 포탈을 모두 제거했다. 마이홈에서는 관리자 권한이 있어도 포탈 위치 이동 버튼이 나타나지 않도록 차단하고, 마이홈 미션 상태를 상단 `나가기` 버튼의 왼쪽으로 옮겼다.

## 원문 요청사항

```text
마이홈에 있는 세종호수 공원, 베어트리파크, 세종 수목원 포탈 다 없애주고, 위치 이동하는 버튼도 없애줘, 그리고 마이홈 미션 진행중 위치리를 나가기 왼쪽에 있게 해줘
```

## 변경 파일 목록

- `react-app/src/game/renderers/VillageMapRenderer.ts`
  - 마이홈의 세종호수공원 기본 포탈과 베어트리파크·세종수목원 고정 포탈 구성을 제거했다.
- `react-app/shared/world-portals.ts`
  - 마이홈에서 출발하는 세 포탈을 공용 기본 좌표 목록에서 제거했다.
- `react-app/src/pages/GamePage.tsx`
  - 마이홈을 공용 포탈 위치 이동 UI 제외 대상에 명시적으로 추가했다.
- `react-app/src/components/PersonalFarmProgressExperience.css`
  - 마이홈 미션 상태를 `나가기` 버튼 왼쪽 상단으로 이동하고 작은 화면에서 진행 수치를 접도록 보정했다.
- `react-app/scripts/personalFarmPortals.test.ts`, `react-app/scripts/bearTreePortals.test.ts`
  - 마이홈 포탈·위치 이동 UI 제거와 미션 상태 위치를 검증하는 회귀 테스트를 추가하고 관련 기존 검증식을 갱신했다.
- `react-app/src/runtimeBuild.ts`, `src/app/page.home/view.pug`
  - 런타임 빌드 ID를 `20260805-remove-my-home-portals-v84`로 갱신했다.
- `src/assets/jochwon-app/`
  - 최신 React 프로덕션 산출물로 교체했다.

## 확인 결과

- 마이홈·베어트리파크 포탈 회귀 테스트 성공: 7개 통과
- 런타임 엔트리 테스트 성공: 2개 통과
- `npm run build` 성공: 클라이언트 TypeScript, Vite 번들, 성능 예산, 서버 TypeScript 통과
- 성능 예산 통과: 초기 엔트리 286 KiB, 최대 JS gzip 319 KiB, 최대 3D 자산 21.64 MiB
- React `dist`와 WIZ `src/assets/jochwon-app` 전체 파일 일치 확인
- WIZ 일반 빌드(`clean: false`) 성공
- `git diff --check` 통과

## 남은 리스크

- 기존에 마이홈을 열어 둔 사용자는 새로고침해야 포탈 제거와 새 미션 상태 위치가 반영된다.
- 실제 브라우저의 1440×900 화면에서 포탈 부재와 상단 UI 간격을 직접 확인하는 수동 시각 검증은 수행하지 않았다.
