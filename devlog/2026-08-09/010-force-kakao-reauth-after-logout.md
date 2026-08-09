# 로그아웃 후 카카오 재인증 복구

## 사용자 요청

> 카카오로그인 로그아웃하고 다시 카카오로그인하기 누르면 카카오 인증한 후에 로그인되어야하는데 현재 캐시든 기록이 남아서인지 바로 로그인없이 세종호수 공원입장함 이거 수정해줘

## 변경 내용

- 로그아웃 시 브라우저의 카카오 사용자 ID, 프로필 이미지, 온보딩 완료 및 세션 프로필 복원 키를 제거했습니다.
- WIZ와 Node 인증 서버의 로그아웃 요청이 모두 끝난 뒤 로그아웃 화면으로 전환합니다.
- 명시적으로 로그아웃한 다음 카카오 로그인을 누른 경우에만 `reauth=1`을 전달합니다.
- 서버는 해당 요청에서 기존 WIZ 세션을 먼저 비우고 카카오 OAuth에 `prompt=login`을 전달해 인증 화면을 다시 표시합니다.
- 최초 로그인과 일반 QR 로그인에는 재인증 강제 옵션을 적용하지 않습니다.

## 변경 파일

- `react-app/src/App.tsx`
- `react-app/scripts/kakaoRelogin.test.ts`
- `src/app/page.home/api.py`
- `src/app/page.home/view.pug`
- `src/assets/jochwon-app/index.html`
- `src/assets/jochwon-app/assets/*` (빌드 산출물)
- `devlog.md`
- `devlog/2026-08-09/010-force-kakao-reauth-after-logout.md`

## 확인 결과

- 카카오 재로그인 회귀 테스트 2건 통과
- React TypeScript, Vite, 서버 빌드 및 성능 예산 검사 성공
