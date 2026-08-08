# 카카오 QR 로그인 강제 재로그인 옵션 제거

- 원본 요청: 카카오로그인을 눌러서 큐알로그인을 했는데 로그인이 안됨, 문제 찾고 해결해줘
- 리뷰 ID: ryiqkvrfnnzenehhisukfuqipechlhcb
- 변경 파일: `src/app/page.home/api.py`, `src/portal/season/route/auth/controller.py`, `devlog.md`, 본 상세 기록
- 변경 내용: 카카오 인증 시작 요청에서 `prompt=login`을 제거해 QR 인증 완료 시 기존 카카오 세션과 표준 OAuth 콜백을 사용하도록 수정함.
- 확인: 운영 인증 시작 URL의 HTTPS redirect URI와 state 생성이 정상이며 WIZ 빌드 성공 여부를 확인함.
