# 카카오 로그인 성공 팝업의 빈 화면을 원본 화면 복귀 방식으로 수정

- **ID**: 015
- **날짜**: 2026-08-03
- **유형**: 버그 수정

## 작업 요약

카카오 인증과 서버 세션 생성은 성공했지만, ReviewOps sandbox를 상속한 새 창이 React 성공 URL에서 브라우저 저장소에 접근하며 렌더링 전에 중단되는 문제를 수정했다.
로그인 창이 성공·실패 결과를 `postMessage`로 원래 서비스 화면에 전달하고 자동으로 닫히도록 콜백 응답을 변경했다.
원래 서비스 화면은 전달받은 결과로 기존 로그인 완료 처리를 다시 실행해 가입 흐름을 이어간다.

## 원문 요청사항

```text
https://sj.wizide.com/assets/jochwon-app/index.html?login=success&userId=5018328866&nickname=%EC%B9%B4%EC%B9%B4%EC%98%A4+%EC%82%AC%EC%9A%A9%EC%9E%90&profileImage=&_build=20260803-respawn-v3 카카오톡 시작하기 누르면 이 화면이 뜬느데, 아무것도 안 보여
```

## 변경 파일 목록

- `react-app/src/pages/LoginPage.tsx`: 카카오 로그인 창의 opener 연결을 유지하는 전용 창 이름과 링크 관계 적용
- `react-app/src/App.tsx`: 로그인 창의 성공·실패 메시지를 받아 기존 로그인 완료 URL로 전환하는 수신 처리 추가
- `src/app/page.home/api.py`: OAuth 콜백을 빈 React 성공 화면 대신 결과 전달·자동 닫기 HTML로 응답
- `src/assets/jochwon-app/`: 수정된 React 프로덕션 번들 동기화
- `devlog.md`: 작업 요약 행 추가
- `devlog/2026-08-03/015-relay-kakao-popup-result.md`: 상세 작업 기록

## 확인 결과

- Python 구문 검사 성공
- React·Vite·Express 전체 빌드 성공
- WIZ 일반 빌드 성공
- 운영 번들에서 전용 카카오 로그인 창, `rel="opener"`, 결과 메시지 수신 코드 확인
- 운영 OAuth 콜백이 302 빈 화면 이동 대신 `text/html` 200 결과 전달 페이지를 응답하는 것 확인
- 콜백 HTML에서 `window.opener.postMessage`와 자동 닫기 처리 확인
- `/auth/kakao`가 등록된 콜백 주소를 포함해 카카오 인증 서버로 이동하는 것 확인
- `git diff --check` 성공

## 남은 리스크

- 실제 카카오 계정으로 성공 콜백 후 원래 창 자동 복귀까지 최종 1회 확인이 필요하다.
- 브라우저가 opener 연결을 별도 보안 설정으로 차단하면 결과 창에 fallback 화면이 표시된다.
