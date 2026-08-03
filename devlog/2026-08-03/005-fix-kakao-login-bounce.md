# 로그인 버튼의 WIZ 카카오 OAuth 연결 및 iframe 이탈 수정

- **ID**: 005
- **날짜**: 2026-08-03
- **유형**: 버그 수정

## 작업 요약

정적 React 앱이 배포되지 않은 Express 인증 주소로 이동하면서 첫 화면으로 되돌아오던 문제를 수정했다.
기존 WIZ `page.home/login` API에서 카카오 OAuth 시작과 콜백을 처리하고, iframe 밖에서 인증한 뒤 원래 화면으로 결과를 전달하도록 연결했다.
인증 실패 시 튕긴 것처럼 보이지 않도록 로그인 화면에 오류 안내도 추가했다.

## 원문 요청사항

```text
로그인을 눌러서 시작해야하는데 자꾸 튕김, 이 부분 수정해줘
```

## 변경 파일 목록

- `react-app/src/App.tsx`: 카카오 로그인 요청을 WIZ 로그인 API로 변경하고 상위 창 이동 및 콜백 오류 처리를 추가
- `react-app/src/pages/LoginPage.tsx`: 로그인 실패 안내 영역 추가
- `react-app/src/pages/LoginPage.css`: 로그인 실패 안내 스타일 추가
- `src/app/page.home/api.py`: 카카오 OAuth 시작·콜백, CSRF state 검증, 사용자 세션 연결 추가
- `src/app/page.home/view.ts`, `view.pug`: OAuth 결과 쿼리를 React iframe에 전달
- `src/assets/jochwon-app/`: 수정된 React 프로덕션 번들 동기화
- `devlog.md`: 작업 요약 행 추가
- `devlog/2026-08-03/005-fix-kakao-login-bounce.md`: 상세 작업 기록

## 확인 결과

- `python3 -m py_compile src/app/page.home/api.py` 성공
- React·Vite·Express 전체 빌드 성공
- React `dist`와 WIZ 정적 번들 파일 수 128개로 일치
- WIZ 클린 빌드 및 후속 일반 빌드 성공
- `git diff --check` 성공
- 운영 정적 번들이 신규 해시 파일로 제공되는 것 확인
- 실행 중 WIZ 프로세스는 기존 API 함수 구현을 유지하고 있어, 서버 재시작 금지 지침에 따라 실제 카카오 왕복 로그인은 완료 검증하지 못함

## 남은 리스크

- 카카오 Developers 콘솔에 `https://sj.wizide.com/wiz/api/page.home/login` Redirect URI가 정확히 등록되어 있어야 OAuth 콜백이 성공한다.
- 실행 중 WIZ API 캐시가 자동 갱신된 뒤 운영 환경에서 카카오 계정 1회 왕복 확인이 필요하다.
