# Chrome `/home` 빈 화면의 iframe 빌드 전환 제거

## 사용자 원문 요청

> 크롬에 https://sj.wizide.com/home 들어갔는데 왜 아무 화면도 안 뜨지?

## 원인

- WIZ `/home` iframe이 build ID 없는 정적 진입점을 먼저 연 뒤, 내부 스크립트가 최신 build ID 쿼리를 붙여 다시 이동하고 있었다.
- 이전 해시 번들이 남은 Chrome 세션에서는 이 재이동 구간이 빈 화면으로 고착될 가능성이 있었다.

## 변경 내용

- WIZ `page.home` iframe 주소에 현재 build ID `20260803-guest-map-v1`을 직접 지정했다.
- iframe 최초 요청부터 최신 번들을 로드하도록 해 중간 `location.replace` 전환을 제거했다.

## 변경 파일

- `src/app/page.home/view.pug`
- `devlog.md`
- `devlog/2026-08-03/024-fix-home-blank-build-redirect.md`

## 확인 결과

- 수정 전 실제 Chromium에서 `/home`과 내부 iframe DOM 및 화면 렌더링 상태 확인
- 공개 React 진입점, 최신 JS/CSS 및 지연 로드 번들 HTTP 200 확인
- WIZ `main` 프로젝트 일반 빌드 성공
- 수정 후 실제 Chromium에서 `/home` 화면 렌더링 및 iframe 최신 build ID 직접 진입 확인
- 브라우저 콘솔에 애플리케이션 JavaScript 예외와 자산 404가 없음을 확인
- `git diff --check` 통과

## 남은 리스크

- ReviewOps SDK의 중단 요청과 origin 경고는 화면 렌더링과 무관하게 개발자 콘솔에 남을 수 있다.
