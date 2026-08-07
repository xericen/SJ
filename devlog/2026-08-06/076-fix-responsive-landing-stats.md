# 작은 화면 홈 추천 문구 반응형 정렬 수정

- 날짜: 2026-08-06
- ID: 076
- 리뷰 ID: `mecvnhcnxwvdbqtvascztasvufgoawkz`

## 사용자 원문

> 화면을 줄이면, 취향 기반
> 추천 이유가 보이는 만남
> 인공지능 코스
> 대화를 실제 방문 계획으로 이게 밑으로 내려가서 깨져있는 거 처럼 보이는데 이 부분 해결해줘

## 변경 내용

- 홈 소개 영역의 두 추천 항목을 가변 flex 대신 동일 폭의 2열 그리드로 변경했다.
- 각 항목을 독립된 반응형 카드로 구성하고 아이콘·제목·설명의 최소 너비와 행 배치를 고정했다.
- 제목과 설명이 창 너비에 따라 불규칙하게 줄바꿈되지 않도록 말줄임과 한 줄 표시를 적용했다.
- 600px 이하에서는 카드 간격, 아이콘 열, 글자 크기를 별도로 축소해 두 항목이 한 줄에 안정적으로 유지되도록 했다.
- 캐시 갱신용 런타임 식별자를 `20260806-responsive-landing-stats-v173`로 변경하고 신규 정적 번들을 배포했다.

## 변경 파일

- `react-app/src/pages/LandingPage.css`
- `react-app/scripts/landingResponsiveStats.test.ts`
- `react-app/src/runtimeBuild.ts`
- `src/app/page.home/view.pug`
- `src/assets/jochwon-app/`
- `devlog.md`
- `devlog/2026-08-06/076-fix-responsive-landing-stats.md`

## 확인 결과

- 홈 반응형 통계 및 런타임 회귀 테스트 8건이 모두 통과했다.
- `npm run build`의 TypeScript, Vite, 성능 예산, 서버 TypeScript 검사가 모두 통과했다.
- React `dist`와 WIZ 정적 자산 디렉터리가 완전히 일치함을 확인했다.
- WIZ 일반 빌드(`clean=false`)가 오류 없이 완료됐다.
- 운영 URL에서 v173 런타임과 신규 CSS를 확인했으며, CSS에 2열 그리드·모바일 전용 규칙이 포함된 것을 확인했다.

## 남은 리스크

- 리뷰 화면 캡처가 제한되어 실제 브라우저 창을 직접 줄이며 시각 검증하지는 못했다.
- 매우 좁은 비표준 화면에서는 문구가 카드 폭을 넘지 않도록 말줄임표가 표시될 수 있다.
