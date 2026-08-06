# 마이홈 정원 버튼 제거 및 정원 현황 상단 이동

- **ID**: 039
- **날짜**: 2026-08-06
- **유형**: UX 개선
- **리뷰 ID**: eomekrwtkcejfkvaamszzecababygiyc

## 작업 요약

마이홈 상단의 비활성 `마이홈 정원` 버튼을 제거하고, 기존에 아래쪽 별도 줄로 표시되던 정원 진행 현황을 해당 위치로 올렸다. 상단은 정원 현황, `맵 이동`, `나가기`가 한 줄에 이어지며 작은 화면에서는 현황을 축약해 두 이동 버튼과 겹치지 않도록 조정했다.

## 원문 요청사항

```text
마미홈 정원 버튼을 없애고 그 위치에 마미홈 심기 전원현황을 올려줘
```

## 변경 파일 목록

- `react-app/src/pages/GamePage.tsx`, `react-app/src/pages/GamePage.css`
  - `마이홈 정원` 버튼을 제거하고 `맵 이동`, `나가기`만 남겼다.
  - 상단 메뉴를 2열 모바일 레이아웃으로 조정했다.
- `react-app/src/components/PersonalFarmProgressExperience.tsx`, `react-app/src/components/PersonalFarmProgressExperience.css`
  - 현황 제목을 `마이홈 정원 현황`으로 명확히 표시했다.
  - 정원 현황을 제거된 버튼 위치와 같은 상단 높이로 이동하고 작은 화면에서는 핵심 단계만 보이도록 축약했다.
- `react-app/scripts/personalFarmInteractions.test.ts`
  - 정원 버튼 제거와 현황 상단 배치를 검증하도록 회귀 테스트를 갱신했다.
- `react-app/src/runtimeBuild.ts`, `src/app/page.home/view.pug`
  - 운영 런타임 빌드 ID를 `20260806-my-home-garden-status-v136`으로 갱신했다.
- `src/assets/jochwon-app/`
  - 최신 React 프로덕션 산출물로 교체하고 이전 해시 번들을 정리했다.

## 확인 결과

- 마이홈 상호작용 회귀 테스트 성공: 9개 통과
- TypeScript 증분 검사 성공
- `npm run build` 성공: 클라이언트 TypeScript, Vite 번들, 성능 예산, 서버 TypeScript 통과
- 성능 예산 통과: 초기 엔트리 246 KiB, 최대 JS gzip 324 KiB, 최대 3D 자산 21.64 MiB
- 런타임 엔트리 테스트 성공: 6개 통과
- React `dist`와 WIZ `src/assets/jochwon-app` 전체 파일 일치 확인
- WIZ 일반 빌드(`clean: false`) 성공
- `git diff --check` 통과

## 남은 리스크

- 실제 브라우저의 다양한 화면 너비에서 상단 현황과 두 버튼의 시각 배치를 확인하는 수동 검증은 수행하지 않았다.
