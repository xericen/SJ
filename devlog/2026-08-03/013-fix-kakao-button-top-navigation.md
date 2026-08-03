# 제한된 iframe에서 카카오 시작 버튼 상위 이동 차단 수정

- **ID**: 013
- **날짜**: 2026-08-03
- **유형**: 버그 수정

## 작업 요약

카카오 시작 버튼이 제한된 iframe 환경에서 `window.parent.location.assign()`으로 상위 문서를 이동하려다 브라우저 정책에 차단되는 문제를 수정했다.
카카오·체험 시작 버튼을 사용자 클릭 기반의 네이티브 링크와 `target="_top"`으로 변경해 인증 화면으로 직접 이동하도록 했다.
운영 React 번들에서 새 링크를 확인하고 카카오 승인 URL 및 등록된 콜백 복귀 경로까지 검증했다.

## 원문 요청사항

```text
카카오톡 시작하기 누르면 안 넘어가는데 해결해줘
```

## 변경 파일 목록

- `react-app/src/App.tsx`: 스크립트 기반 상위 창 이동 함수 제거, 로그인 URL을 컴포넌트에 전달
- `react-app/src/pages/LoginPage.tsx`: 카카오·체험 버튼을 `target="_top"` 네이티브 링크로 변경
- `react-app/src/pages/LoginPage.css`: 링크가 기존 버튼과 동일하게 표시되도록 크기·정렬·장식 보정
- `src/assets/jochwon-app/`: 수정된 React 프로덕션 번들 동기화
- `devlog.md`: 작업 요약 행 추가
- `devlog/2026-08-03/013-fix-kakao-button-top-navigation.md`: 상세 작업 기록

## 확인 결과

- React·Vite·Express 전체 빌드 성공
- WIZ 일반 빌드 성공
- 운영 번들에서 `/auth/kakao` 및 `target="_top"` 링크 확인
- `/auth/kakao`가 카카오 인증 서버로 302 이동하는 것 확인
- OAuth 요청이 등록된 `https://sj.wizide.com/wiz/api/page.home/login` 콜백을 사용하는 것 확인
- 로그인 취소 콜백이 오류 안내와 함께 React 앱으로 302 복귀하는 것 확인
- `git diff --check` 성공

## 남은 리스크

- 실제 카카오 계정의 동의 완료와 토큰 교환은 사용자 계정으로 최종 1회 확인이 필요하다.
