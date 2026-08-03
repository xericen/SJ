# 카카오 OAuth 콜백을 등록된 WIZ API 주소로 재통일

- **ID**: 012
- **날짜**: 2026-08-03
- **유형**: 버그 수정

## 작업 요약

카카오 콘솔에 등록된 `https://sj.wizide.com/wiz/api/page.home/login`과 직전 코드가 사용하던 `https://sj.wizide.com/auth/kakao/callback`이 달라 인증 오류가 발생한 원인을 확인했다.
사용자가 이미 등록한 WIZ API 주소를 OAuth 시작 요청과 토큰 교환 요청의 단일 Redirect URI로 다시 통일했다.
로그인 시작은 기존 `/auth/kakao` 라우트가 담당하고, 등록된 `page.home/login` API가 콜백 검증·사용자 생성·세션 저장을 담당하도록 역할을 정리했다.

## 원문 요청사항

```text
아까 너가 카카오톡 로그인 https://sj.wizide.com/wiz/api/page.home/login등록하면 된다해서 등록했는데 왜 카카오톡 로그인 에러떠 다시 확인하고 해결해줘
```

## 변경 파일 목록

- `src/portal/season/route/auth/controller.py`: 카카오 승인 요청의 Redirect URI를 등록된 WIZ API 주소로 변경
- `src/app/page.home/api.py`: 등록된 주소에서 OAuth 콜백·state 검증·토큰 교환·사용자 세션 생성을 처리하도록 복구
- `devlog.md`: 작업 요약 행 추가
- `devlog/2026-08-03/012-align-kakao-registered-callback.md`: 상세 작업 기록

## 확인 결과

- Python 문법 검사 성공
- 카카오 인증 서버에서 등록된 Redirect URI로 로그인 화면 진입 확인
- KOE 계열 Redirect URI 오류 없음 확인
- WIZ 클린 빌드 성공
- `git diff --check` 성공
- 현재 실행 중 WIZ 프로세스는 아직 직전 콜백 주소와 이전 App API 함수를 유지하는 상태 확인

## 남은 리스크

- WIZ 운영 프로세스에 이번 빌드가 배포된 뒤 실제 카카오 계정으로 승인·콜백·서비스 복귀를 1회 확인해야 한다.
