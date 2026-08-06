# 마이홈 상단 메뉴·이전 맵 복귀 및 실내 카메라 개선

- **ID**: 025
- **날짜**: 2026-08-06
- **유형**: UX 개선
- **리뷰 ID**: eomekrwtkcejfkvaamszzecababygiyc

## 작업 요약

마이홈에 입장하면 상단에 `마이홈 정원`, `맵 이동`, `나가기` 메뉴가 표시되도록 구성했다. 16개 월드 중 마이홈으로 들어오기 직전 맵을 세션에 기억하고 `맵 이동`을 누르면 해당 맵으로 복귀하도록 연결했다. 정원 진행 현황과 꽃 심기 UI를 데스크톱·모바일 화면 폭에 맞게 재배치하고, 집 내부 카메라 거리를 늘렸다.

## 원문 요청사항

```text
마이홈 들어가면, 마이홈 정원 , 맵 이동 나가기 이렇게 버튼 만들어주라, 그리고 마이홈 정원 그 css 화면에 맞게 수정해줘,, 맵 이동으로 누르면 기존 마이홈 오기 전에 해당 16개의 맵에서 마이홈으로 이동했을 거 아냐, 그 부분으로 다시 이동할 수 있게 해줘, 즉 원래 있던 맵에서 마이홈버튼을 통해서 마이홈으로 들어옴 -> 맵 이동하면 다시 원래 있던 맵으로 이동하는 방식, 그리고 집으로 들어갔을 때 캐릭터와 카메라 거리 너무 가까우니까 좀 더 카메라 멀리해줘
```

## 변경 파일 목록

- `react-app/src/pages/GamePage.tsx`, `react-app/src/pages/GamePage.css`
  - 마이홈 전용 상단 3개 메뉴를 추가하고 기존 마이홈·나가기 버튼 중복을 제거했다.
  - 마이홈 진입 직전 맵 저장과 `맵 이동` 복귀를 연결했다.
  - 데스크톱·모바일 너비에 맞는 상단 메뉴 레이아웃을 추가했다.
- `react-app/src/game/personalFarmReturnMap.ts`
  - 마이홈을 제외한 16개 월드만 안전한 복귀 대상으로 저장·복원하도록 구현했다.
- `react-app/src/components/PersonalFarmProgressExperience.css`
  - 정원 현황, 오류 안내, 꽃 심기 카드를 화면 폭에 맞게 반응형으로 재배치했다.
- `react-app/src/game/worldNavigationProfile.ts`
  - 마이홈 실내 카메라 거리를 1120에서 1400으로 늘렸다.
- `react-app/scripts/personalFarmInteractions.test.ts`
  - 16개 이전 맵 복귀, 상단 메뉴·반응형 CSS, 실내 카메라 거리 회귀 검증을 추가했다.
- `react-app/src/runtimeBuild.ts`, `src/app/page.home/view.pug`
  - 운영 런타임 빌드 ID를 `20260806-my-home-return-menu-v122`로 갱신했다.
- `src/assets/jochwon-app/`
  - 최신 React 프로덕션 산출물로 교체하고 이전 해시 번들을 정리했다.

## 확인 결과

- 마이홈 상호작용 회귀 테스트 성공: 8개 통과
- 16개 복귀 대상 수와 수목원 저장·복원 동작 확인
- TypeScript 증분 검사 성공
- `npm run build` 성공: 클라이언트 TypeScript, Vite 번들, 성능 예산, 서버 TypeScript 통과
- 성능 예산 통과: 초기 엔트리 246 KiB, 최대 JS gzip 324 KiB, 최대 3D 자산 21.64 MiB
- 런타임 엔트리 테스트 성공: 5개 통과
- React `dist`와 WIZ `src/assets/jochwon-app` 전체 파일 일치 확인
- WIZ 일반 빌드(`clean: false`) 성공
- `git diff --check` 통과

## 남은 리스크

- 실제 브라우저에서 16개 맵 각각의 왕복과 화면 크기별 배치를 확인하는 수동 검증은 수행하지 않았다.
- `맵 이동`은 이전 맵의 표준 입장 지점으로 복귀하며, 마이홈 진입 직전의 세부 좌표까지 복원하지는 않는다.
