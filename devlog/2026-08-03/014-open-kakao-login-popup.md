# ReviewOps 제한 환경에서 카카오 로그인을 새 창으로 실행하도록 수정

- **ID**: 014
- **날짜**: 2026-08-03
- **유형**: 버그 수정

## 작업 요약

ReviewOps가 서비스 화면을 `allow-popups`만 허용하고 상위 이동은 허용하지 않는 sandbox iframe으로 실행해, 기존 `target="_top"` 카카오 로그인 링크가 브라우저에 차단되는 원인을 확인했다.
카카오 시작 버튼을 사용자 클릭 기반의 새 창 링크로 변경해 제한된 iframe 밖에서 카카오 인증 화면이 열리도록 했다.
운영 React 번들과 WIZ 카카오 인증 시작 경로 및 등록된 콜백 주소를 다시 검증했다.

## 원문 요청사항

```text
카카오톡 시작하기 버튼을 누르면 카카오톡 로그인하는 거 떠야하는데 안 뜨고, 걍 아무 화면도 안 떠 이 부분 해결해줘.
```

## 변경 파일 목록

- `react-app/src/pages/LoginPage.tsx`: 카카오 로그인 링크를 `target="_blank"` 새 창 방식으로 변경하고 접근성 설명 추가
- `src/assets/jochwon-app/`: 수정된 React 프로덕션 번들 동기화
- `devlog.md`: 작업 요약 행 추가
- `devlog/2026-08-03/014-open-kakao-login-popup.md`: 상세 작업 기록

## 확인 결과

- ReviewOps 실행 iframe에 `allow-popups`는 있고 상위 이동 허용 토큰은 없는 것 확인
- React·Vite·Express 전체 빌드 성공
- WIZ 일반 빌드 성공
- 운영 번들에서 새 창 카카오 로그인 링크와 `/auth/kakao` 확인
- `/auth/kakao`가 카카오 인증 서버로 302 이동하는 것 확인
- OAuth 요청이 등록된 `https://sj.wizide.com/wiz/api/page.home/login` 콜백을 사용하는 것 확인
- `git diff --check` 성공

## 남은 리스크

- 브라우저에서 팝업을 전면 차단하도록 설정한 사용자는 주소창의 팝업 허용이 필요할 수 있다.
- 실제 카카오 계정의 동의 완료와 토큰 교환은 사용자 계정으로 최종 1회 확인이 필요하다.
