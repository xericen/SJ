# 홈 외곽 카드를 로그인 페이지 크기로 확대

- **ID**: 006
- **날짜**: 2026-08-07
- **유형**: 버그 수정
- **리뷰 ID**: nmzgknprmocskmxxhwqmgokmgqtzhxlu

## 작업 요약
홈과 로그인 화면의 외곽 카드 크기가 달라 화면 전환 시 프레임이 작아 보이던 문제를 수정했다.
홈 데스크톱 카드에 로그인 화면과 동일한 좌우 24px 여백, 최대 1480px 너비, 뷰포트 높이에서 48px을 뺀 높이를 적용했다.

## 원문 요청사항
```text
홈페이지랑 로그인 페이지랑 전체 네모  크기가 다른데 로그인 페이지에 맞춰서 홈 페이지 크기 키워주면 좋을 거 같아
```

## 변경 파일 목록
- `react-app/src/pages/LandingPage.css`
  - 홈 외곽 프레임을 로그인 카드 크기 규칙과 통일
- `react-app/scripts/desktopPageLayout.test.ts`
  - 홈의 로그인 크기 프레임 회귀 검증 갱신
- `react-app/src/runtimeBuild.ts`
  - 런타임 빌드 ID를 `20260807-login-sized-home-v194`로 갱신
- `src/app/page.home/view.pug`
  - iframe 빌드 쿼리를 v194로 갱신
- `src/assets/jochwon-app/**`
  - v194 React 프로덕션 산출물 동기화
- `devlog.md`
  - 작업 요약 행 추가
- `devlog/2026-08-07/006-match-home-login-frame.md`
  - 작업 상세 기록 추가

## 확인 결과
- `npm run build`: 성공
- `npm run test:desktop-page-layout`: 3/3 통과
- `npm run test:runtime-entry`: 6/6 통과
- WIZ 일반 빌드(`clean: false`) 성공
- 운영 URL에서 v194 엔트리와 새 CSS가 HTTP 200으로 제공되는 것을 확인

## 남은 리스크
- 로그인 페이지는 콘텐츠가 길면 세로로 확장될 수 있지만, 기본 진입 화면의 외곽 프레임은 홈과 동일하다.
