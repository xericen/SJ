# 로컬 체험과 카카오 소셜 저장·복원 흐름 분리

## 사용자 원문 요청

> 로컬 -> 체험용을 의미하고, 쇼셜은 카카오톡 로그인을 통해서 한 것을 의미함,  로컬(데베 X, 웹 나가면 바로 데이터 소멸)-> 즉 로그인이 안되는 딱 체험 느낌인거지,, 소셜(데베 O) -> 다음 번에 또 같은 카카오톡으로 로그인하면 기존에 캐릭터가 저장되어있어서 새로 캐릭터를 안 만들어도됨.

## 변경 요약

- 로컬 체험 버튼이 더 이상 WIZ·Express DB 사용자를 만들지 않고 익명 브라우저 세션을 시작하도록 변경했다.
- 로컬 프로필·캐릭터는 `sessionStorage`와 현재 런타임 상태만 사용하고, 페이지를 나갈 때 계정·월드 체험 로컬 데이터를 제거하도록 했다.
- 로컬 체험 진입 시 WIZ 세션과 Express 인증 쿠키를 해제해 인증 기반 DB 쓰기를 차단했다.
- 카카오 로그인 후 WIZ DB의 저장 프로필을 조회하며, 기존 프로필이 있으면 캐릭터 생성 단계를 건너뛰고 월드로 복귀하도록 했다.
- 신규·수정 소셜 프로필은 WIZ `user.avatar` 필드에 검증된 전체 프로필 JSON으로 저장하도록 `account_profile` API를 추가했다.
- 로그인 화면과 로컬 프로필 편집 화면에서 로컬·소셜 저장 차이를 명시했다.
- 새 운영 번들과 캐시 식별자 `20260805-local-social-v74`를 반영했다.

## 변경 파일

- `react-app/src/App.tsx`
- `react-app/src/hooks/useSessionStorage.ts`
- `react-app/src/pages/LoginPage.tsx`
- `react-app/src/pages/LoginPage.css`
- `react-app/src/pages/CreateProfilePage.tsx`
- `react-app/src/services/accountData.ts`
- `react-app/src/services/accountProfile.ts`
- `react-app/src/runtimeBuild.ts`
- `react-app/server/src/routes/auth.ts`
- `react-app/scripts/localSocialAuth.test.ts`
- `src/app/page.home/api.py`
- `src/app/page.home/view.pug`
- `src/portal/season/route/auth/controller.py`
- `src/assets/jochwon-app/index.html`
- `src/assets/jochwon-app/assets/*` 신규 해시 번들
- `README.md`
- `devlog.md`
- `devlog/2026-08-05/060-separate-local-and-social-persistence.md`

## 검증 결과

- `python -m py_compile`로 WIZ 인증·프로필 Python 파일 문법 검증 통과.
- `npx tsc -b --pretty false`, `npx tsc -p server/tsconfig.json --pretty false` 통과.
- `npx tsx --test scripts/localSocialAuth.test.ts`: 3개 테스트 통과.
- `npm run build`: React, Vite, 성능 예산, Express TypeScript 빌드 통과.
- WIZ 클린 빌드와 후속 일반 빌드 통과.
- 개발 프로젝트 쿠키로 `/wiz/api/page.home/account_profile` 비로그인 401, `/auth/demo`의 `login=local` 리다이렉트·세션 삭제, 신규 엔트리 번들 HTTP 200을 확인했다.
- 검증 중 구버전 운영 라우트 호출로 생성된 임시 체험 사용자 1건은 즉시 회원 탈퇴 API로 삭제했다.
- `git diff --check` 통과.

## 남은 리스크

- 이번 변경 전에 전체 React 프로필이 WIZ DB에 저장되지 않았던 카카오 사용자는 복원할 데이터가 없으므로 최초 1회 캐릭터 설정이 필요하다. 이후 같은 카카오 계정 로그인부터는 저장 프로필을 복원한다.
- 실제 카카오 OAuth 왕복은 외부 계정 인증이 필요해 자동화하지 않았으며, 운영 계정으로 신규 저장 후 재로그인 시 캐릭터 생성 생략을 최종 확인해야 한다.
