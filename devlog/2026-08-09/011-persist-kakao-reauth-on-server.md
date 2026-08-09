# 서버 기반 카카오 재인증 플래그 적용

## 사용자 요청

> 이전 수정으로 해결되지 않았습니다. 로그아웃 후 다시 카카오 로그인하면 인증 없이 세종호수공원으로 들어가는 원인을 다시 찾아 수정해 주세요.

## 원인

- React 앱이 iframe 안에서 저장한 재인증 플래그는 OAuth가 상위 창을 이동하고 iframe을 다시 만드는 과정에서 유실될 수 있었습니다.
- 그 결과 `/kakao_start`가 일반 로그인 요청으로 처리되어 기존 카카오 세션으로 즉시 인증되고 저장 프로필을 통해 게임으로 복귀했습니다.

## 변경 내용

- WIZ 로그아웃 API가 세션을 비운 뒤 서버 세션에 `kakao_reauth_required`를 기록합니다.
- 카카오 로그인 시작 API는 클라이언트 쿼리가 없어도 서버 플래그를 확인해 `prompt=login`을 적용합니다.
- 재인증 시작 시 기존 WIZ 인증 상태를 다시 비우고 새 OAuth state만 발급합니다.

## 변경 파일

- `src/app/page.home/api.py`
- `react-app/scripts/kakaoRelogin.test.ts`
- `src/app/page.home/view.pug`
- `src/assets/jochwon-app/index.html`
- `devlog.md`
- `devlog/2026-08-09/011-persist-kakao-reauth-on-server.md`

## 확인 결과

- 카카오 재로그인 회귀 테스트 2건 통과
- React TypeScript, Vite, 서버 빌드 및 성능 예산 검사 성공
- WIZ 런타임 재기동 후 운영 로그아웃 API HTTP 200 확인
- 같은 쿠키로 운영 카카오 로그인 시작 API 호출 시 HTTP 302 및 OAuth URL의 `prompt=login` 포함 확인
