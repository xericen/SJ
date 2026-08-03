# 직접 서비스 카카오 로그인을 현재 창 연속 흐름으로 변경

- **ID**: 018
- **날짜**: 2026-08-03
- **유형**: UX·버그 수정

## 작업 요약

직접 서비스의 카카오 로그인 버튼이 새 창을 만들지 않고 현재 브라우저 탭의 최상위 창에서 OAuth를 이어가도록 변경했다.
동일 출처의 `/home`에서는 현재 창으로 카카오 로그인을 진행하고, 상위 창 이동 권한이 없는 ReviewOps 제한 iframe에서만 기존 팝업 방식을 안전한 대체 경로로 유지한다.

## 원문 요청사항

```text
새 창이 열리던데, 그렇게하지말고, 한창에서만 계속  하게 해줘
```

## 변경 파일 목록

- `react-app/src/pages/LoginPage.tsx`: 동일 출처 최상위 창에서 카카오 OAuth 주소로 현재 창 이동
- `src/assets/jochwon-app/`: 수정된 React 프로덕션 번들 동기화
- `devlog.md`: 작업 요약 행 추가
- `devlog/2026-08-03/018-use-single-window-kakao-login.md`: 상세 작업 기록

## 확인 결과

- React 프로덕션 빌드 성공
- WIZ 일반 빌드 성공
- 실제 Chromium에서 `/home`의 카카오 버튼 클릭 후 브라우저 페이지 수가 1개로 유지되고 최상위 창이 `/auth/kakao`로 이동하는 것 확인
- 실제 카카오 연결 테스트에서도 같은 페이지가 `accounts.kakao.com` 카카오 로그인 주소로 이동하는 것 확인
- `git diff --check` 성공

## 남은 리스크

- ReviewOps iframe은 `allow-top-navigation-by-user-activation` 권한이 없고 카카오 응답도 `X-Frame-Options: DENY`이므로, ReviewOps 화면 안에서만은 한 창 OAuth가 불가능하다. 이 환경에서는 로그인이 막히지 않도록 팝업 대체 경로가 유지된다.
