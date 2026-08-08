# 카카오 로그인 직후 프로필 조회 500의 화면 복귀 방지

- 원본 요청: 카카오로그인하면 자꾸 깜빡거리는데 문제해결해줘,,
- 리뷰 ID: ryiqkvrfnnzenehhisukfuqipechlhcb
- 변경 파일: `src/app/page.home/api.py`, `devlog.md`, 본 상세 기록
- 변경 내용: 카카오 로그인 직후 사용자·프로필 저장소의 일시적 조회 예외를 HTTP 500으로 반환하지 않고 기본 프로필 작성 단계(`profile: null`)로 연결함.
- 확인: WIZ `main` 프로젝트 빌드 성공 및 정적 자산 참조 상태를 확인함.
