# 홈 화면 스타일 선로딩 및 로컬 폰트 전환

## 사용자 원문 요청

> 웹디자인이 이상해짐 다시 바꿔줘

## 변경 내용

- 제한된 iframe에서 메인 CSS보다 React 엔트리가 먼저 실행되어 기본 브라우저 스타일이 노출될 수 있던 순서를 바로잡았다.
- 메인 스타일시트에 빌드 ID를 붙이고 런타임 엔트리보다 앞에서 로드되도록 Vite HTML 변환 로직을 보강했다.
- 메인 CSS 또는 엔트리 로드가 실패하면 기존 캐시 복구 경로를 공통으로 사용하도록 연결했다.
- 외부 Google Fonts `@import`를 제거하고 WIZ가 직접 제공하는 로컬 SUIT woff2 폰트를 400~900 굵기로 연결했다.
- 홈 iframe과 정적 런타임을 `20260806-stable-home-styles-v112`로 갱신하고 새 프로덕션 산출물을 WIZ 자산에 반영했다.

## 변경 파일

- `react-app/src/styles.css`
- `react-app/src/runtimeBuild.ts`
- `react-app/vite.config.ts`
- `react-app/scripts/runtimeEntry.test.ts`
- `src/app/page.home/view.pug`
- `src/assets/jochwon-app/index.html`
- `src/assets/jochwon-app/assets/*` (v112 프로덕션 산출물)
- `devlog.md`
- `devlog/2026-08-06/016-stabilize-home-styles.md`

## 확인 결과

- `npm run build`: 성공 (클라이언트 TypeScript, Vite 프로덕션 빌드, 성능 예산, 서버 TypeScript)
- `npm run test:runtime-entry`: 5/5 통과
- `npm run test:postmessage`: 2/2 통과
- WIZ `main` 프로젝트 일반 빌드(`clean: false`): 성공
- 배포 HTML에서 메인 CSS가 런타임 엔트리보다 앞에 위치하고 양쪽 모두 v112 빌드 ID를 사용하는 것을 확인
- 운영 v112 HTML, 메인 CSS, 엔트리 JavaScript, SUIT 폰트가 모두 HTTP 200과 올바른 Content-Type으로 제공되는 것을 확인
- React `dist/index.html`과 WIZ 정적 `index.html`, 참조된 메인 CSS·엔트리 파일이 각각 일치함을 확인
- 대상 파일 `git diff --check` 통과

## 남은 리스크

- 현재 실행 환경에는 브라우저 자동화 실행 파일이 없어 운영 화면의 픽셀 단위 스크린샷 비교는 수행하지 못했다.
