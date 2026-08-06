# 카카오 로그인 반환 시 런타임 이중 실행 및 캐릭터 설정 진입 오류 수정

## 사용자 원문 요청

> 현재 캌카오 로그인하니까 새 버전을 불러오지 못했습니다. 페이지를 새로고침해 주세요.index-D3Jn7mUZ.js?_b…-home-styles-v112:1 Uncaught ReferenceError: f is not defined 이렇게 뜨는데 문제 해결해줘,

## 변경 내용

- 운영 카카오 로그인 반환 URL을 브라우저에서 재현해, 해시 엔트리에 붙인 `_build` 쿼리와 지연 청크가 참조하는 쿼리 없는 엔트리가 서로 다른 ES 모듈로 인식되는 문제를 확인했다.
- 동일한 React 앱이 두 번 마운트되면서 런타임 참조 오류와 DOM 제거 오류가 발생하지 않도록, 해시 파일명만 캐시 키로 사용하고 엔트리·스타일 쿼리를 제거했다.
- 기본 Oxc 압축 대신 `esbuild` 압축과 `es2020` 타깃을 명시해 카카오 인증 반환 브라우저 간 런타임 호환성을 안정화했다.
- 신규 가입자의 인증 반환 직후 캐릭터 설정 청크를 먼저 준비한 뒤 화면을 전환하도록 로그인 콜백 흐름을 보강했다.
- 런타임 빌드를 `20260806-kakao-single-entry-v115`로 갱신하고 새 해시 산출물을 WIZ 정적 자산에 반영했다.

## 변경 파일

- `react-app/src/App.tsx`
- `react-app/src/runtimeBuild.ts`
- `react-app/vite.config.ts`
- `react-app/scripts/runtimeEntry.test.ts`
- `src/app/page.home/view.pug`
- `src/assets/jochwon-app/index.html`
- `src/assets/jochwon-app/assets/*` (v115 프로덕션 산출물)
- `devlog.md`
- `devlog/2026-08-06/018-fix-kakao-callback-runtime-entry.md`

## 확인 결과

- `npm run build`: 성공 (TypeScript, Vite 프로덕션 빌드, 성능 예산, 서버 TypeScript)
- `npm run test:runtime-entry`: 5/5 통과
- `npm run test:postmessage`: 2/2 통과
- 로컬 프로덕션 미리보기에서 인증 완료·신규 프로필 응답을 모의해 `캐릭터 설정 · 1/2` 렌더링, 엔트리 1회 요청, 브라우저 런타임 오류 0건을 확인
- WIZ `main` 프로젝트 일반 빌드(`clean: false`): 성공
- 운영 v115 HTML이 쿼리 없는 단일 해시 엔트리를 참조하고, 엔트리 응답이 HTTP 200 및 로컬 산출물과 동일한 SHA-256임을 확인
- 운영 브라우저에서 미인증 반환은 로그인 안내로, 인증 완료 신규 사용자 모의 반환은 `캐릭터 설정 · 1/2`로 이동하며 런타임 오류가 없음을 확인

## 남은 리스크

- 실제 카카오 계정의 동의·인증 입력은 자동화 환경에서 대신 수행할 수 없어, 운영 검증은 서버의 인증 완료 신규 사용자 응답을 브라우저에서 모의하는 방식으로 진행했다.
