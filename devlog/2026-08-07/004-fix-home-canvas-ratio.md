# 홈 데스크톱 캔버스 1320×880 비율 고정

- **ID**: 004
- **날짜**: 2026-08-07
- **유형**: 버그 수정
- **리뷰 ID**: nmzgknprmocskmxxhwqmgokmgqtzhxlu

## 작업 요약
첨부 스크린샷의 1440×900 화면을 기준으로 홈 카드의 기준 크기를 1320×880, 3:2 비율로 고정했다.
큰 화면에서는 기준 크기 이상 늘어나지 않고 중앙에 유지되며, 작은 데스크톱에서는 가로와 세로가 동일 비율로 축소되도록 변경했다.

## 원문 요청사항
```text
홈 페이지 비율이 공용 파일 처럼 보이는데 너무 어색한 느낌이 들어서 중간에 홈페이지는 현재 스크린샷 화면 크기로 고정해주면 좋을 거 같아, 화면에 따라서 늘어나니까 이상해져
```

## 변경 파일 목록
- `react-app/src/pages/LandingPage.css`
  - 데스크톱 홈 캔버스를 1320×880(3:2) 기준으로 제한
  - 화면 중앙 정렬 및 작은 데스크톱의 비례 축소 적용
- `react-app/scripts/desktopPageLayout.test.ts`
  - 고정 캔버스 크기와 3:2 비율 회귀 검증 추가
- `react-app/src/runtimeBuild.ts`
  - 런타임 빌드 ID를 `20260807-fixed-home-canvas-v193`로 갱신
- `src/app/page.home/view.pug`
  - iframe 빌드 쿼리를 v193으로 갱신
- `src/assets/jochwon-app/**`
  - v193 React 프로덕션 산출물 동기화
- `devlog.md`
  - 작업 요약 행 추가
- `devlog/2026-08-07/004-fix-home-canvas-ratio.md`
  - 작업 상세 기록 추가

## 확인 결과
- `npm run build`: 성공
- `npm run test:desktop-page-layout`: 3/3 통과
- `npm run test:runtime-entry`: 6/6 통과
- WIZ 일반 빌드(`clean: false`) 성공
- 운영 URL에서 v193 엔트리와 고정 비율 CSS가 HTTP 200으로 제공되는 것을 확인

## 남은 리스크
- 900px 이하 화면은 기존 모바일·태블릿 반응형 레이아웃을 유지한다.
