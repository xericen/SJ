# 작은 화면 로그인 하단 잘림 및 진입 스크롤 위치 수정

## 사용자 원문 요청

> 화면 작게봤을 때 로그인 페이지 아래부분 잘려서 보이는데 이 문제 해결해줘

## 변경 내용

- 고정된 로그인 카드 높이와 `overflow: hidden` 때문에 1024×600에서 1,836px 높이의 내부 콘텐츠가 780px 카드 아래로 잘리던 문제를 수정했다.
- 로그인 카드 높이를 콘텐츠에 따라 자동 확장하고, 화면 높이를 최소 기준으로만 사용해 iframe 문서에서 전체 내용을 세로 스크롤할 수 있도록 변경했다.
- 모바일·태블릿에서는 동적 뷰포트 단위(`dvh`)를 적용해 브라우저 UI 높이 변화에도 하단이 잘리지 않도록 보강했다.
- 홈에서 스크롤한 상태로 로그인 화면에 들어가도 이전 위치가 유지되지 않도록 로그인 페이지 마운트 시 스크롤을 상단으로 초기화했다.
- 런타임 빌드를 `20260806-responsive-login-v185`로 갱신하고 최신 산출물을 WIZ에 반영했다.

## 변경 파일

- `react-app/src/pages/LoginPage.tsx`
- `react-app/src/pages/LoginPage.css`
- `react-app/src/runtimeBuild.ts`
- `src/app/page.home/view.pug`
- `src/assets/jochwon-app/index.html`
- `src/assets/jochwon-app/assets/*` (v185 프로덕션 산출물)
- `devlog.md`
- `devlog/2026-08-06/089-fix-responsive-login-clipping.md`

## 확인 결과

- `npm run build`: 성공 (클라이언트 TypeScript, Vite 프로덕션 빌드, 성능 예산, 서버 TypeScript)
- `npm run test:runtime-entry`: 6/6 통과
- `npm run test:postmessage`: 2/2 통과
- WIZ `main` 프로젝트 일반 빌드(`clean: false`): 성공
- 로컬 프로덕션 화면의 1280×600, 1024×600, 768×600, 390×667 뷰포트에서 로그인 진입 시 스크롤 위치가 0이고 마지막 안내 문구가 문서 스크롤 범위 안에 있음을 확인
- 운영 `/home` iframe의 1024×600 및 390×667 뷰포트에서 카드 내부 높이와 스크롤 높이가 일치하고 하단 요소가 접근 가능함을 확인
- 운영 v185 JavaScript와 CSS가 HTTP 200으로 제공되고 브라우저 런타임 오류가 없음을 확인

## 남은 리스크

- 실제 모바일 브라우저의 주소창 확장·축소 동작은 기기별 차이가 있으나, `vh`와 `dvh` 폴백을 함께 적용해 대응했다.
