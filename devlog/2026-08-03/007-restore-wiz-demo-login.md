# 운영 WIZ 체험용 로그인 복구

## 사용자 요청

> 체험용이나 이런 거 있어야하는데 이 부분 다시 해줘;; 다 안 가져온 거 같음

## 변경 내용

- 개발 환경에서만 렌더링되던 `체험용으로 시작하기` 버튼을 운영 WIZ 빌드에도 표시하도록 변경했다.
- 체험 로그인 주소를 별도 Express `/api/auth/demo` 대신 WIZ `page.home/login?provider=demo`로 연결했다.
- WIZ API가 브라우저 세션별로 분리된 체험 사용자를 MySQL에 생성하거나 재사용하고 로그인 세션을 설정하도록 구현했다.
- iframe 안에서 로그인할 때 최상위 WIZ 화면으로 안전하게 이동하도록 카카오 로그인과 동일한 탐색 방식을 적용했다.
- 최신 React 빌드 결과를 WIZ 정적 자산에 다시 동기화했다.

## 변경 파일

- `react-app/src/App.tsx`
- `react-app/src/pages/LoginPage.tsx`
- `src/app/page.home/api.py`
- `src/assets/jochwon-app/`
- `devlog.md`
- `devlog/2026-08-03/005-restore-wiz-demo-login.md`

## 확인 결과

- React·Vite·Express 전체 빌드 성공
- 백엔드 자동 테스트 41개 통과
- 운영 번들에서 체험 로그인 버튼과 WIZ demo URL 포함 확인
- WIZ `main` 프로젝트 일반 빌드 성공
- 공개 체험 로그인 API 302 성공 리다이렉트 확인
- 발급된 세션으로 `page.home/me` 조회 시 `체험 탐험가` 사용자 반환 확인

## 남은 사항

- 체험 사용자는 브라우저 세션별 MySQL 계정으로 생성되므로 장기 운영 시 만료된 체험 계정 정리 정책이 필요하다.
- React의 일부 프로필·커뮤니티 API는 여전히 별도 Express `/api` 배포 또는 WIZ API 이식이 필요하다.
