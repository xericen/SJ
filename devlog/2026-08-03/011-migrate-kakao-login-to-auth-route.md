# 카카오 로그인을 WIZ 공용 인증 라우트와 서버 세션으로 이전

- **ID**: 011
- **날짜**: 2026-08-03
- **유형**: 버그 수정

## 작업 요약

카카오 로그인 버튼이 WIZ App API 캐시에 남은 이전 `login` 함수를 호출해 400 응답을 받던 흐름을 제거했다.
카카오 OAuth 시작·콜백을 이미 운영 중인 Season `/auth` 라우트로 이전하고, 카카오 계정 식별 정보와 WIZ 사용자 세션을 서버에서 생성하도록 연결했다.
취향·캐릭터 진행상태 일부는 기존처럼 브라우저 `localStorage`에 남지만, 이것은 로그인 버튼 실패 원인이 아니며 카카오 인증 세션은 서버에서 관리한다.

## 원문 요청사항

```text
현재 카카오톡 로그인하기 누르면 정상적으로 되어야하는데 안됨. 내가 기록했던 것들이 컴퓨터 로컬에 저장이 되어서 그런건지 잘 모르겠음
```

## 변경 파일 목록

- `react-app/src/App.tsx`: 카카오·체험 로그인 요청을 `/auth/kakao`, `/auth/demo`로 변경
- `src/portal/season/route/auth/controller.py`: 카카오 OAuth 시작·콜백, state 검증, 사용자 생성 및 서버 세션 연결 추가
- `src/app/page.home/api.py`: App API 캐시에 의존하던 카카오·체험 로그인 우회 코드 제거
- `src/assets/jochwon-app/`: 수정된 React 프로덕션 번들 동기화
- `devlog.md`: 작업 요약 행 추가
- `devlog/2026-08-03/011-migrate-kakao-login-to-auth-route.md`: 상세 작업 기록

## 확인 결과

- Python 문법 검사 성공
- React·Vite·Express 전체 빌드 성공
- WIZ 일반 빌드 및 클린 빌드 성공
- OAuth 시작 URL·state·콜백 오류 복귀 단위 검증 성공
- 카카오 인증 서버가 운영 Redirect URI를 오류 없이 로그인 화면으로 수락하는 것 확인
- `git diff --check` 성공
- 실행 중 운영 WIZ 라우트는 아직 이전 컨트롤러를 유지하여 `/auth/kakao`가 `/`로 리다이렉트되는 상태 확인

## 남은 리스크

- WIZ API 프로세스에 새 인증 라우트 코드가 반영된 뒤 실제 카카오 계정 왕복 로그인을 1회 확인해야 한다.
- 취향·캐릭터·여정 진행상태 일부는 여전히 브라우저 `localStorage` 기반이라 다른 기기와 자동 동기화되지 않는다.
