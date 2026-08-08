# 카카오 로그인 후 홈 iframe 정적 번들 경로 수정

- 원본 요청: 카카오로그인해서 들어갔는데 화면 이렇게 떠 해결해줘
- 리뷰 ID: ryiqkvrfnnzenehhisukfuqipechlhcb
- 변경 파일: `src/assets/jochwon-app/index.html`, `devlog.md`, 본 상세 기록
- 변경 내용: 로그인 후 iframe 엔트리의 CSS/JS/modulepreload 경로를 인증 라우트 경유 경로에서 실제 정적 자산 경로(`/assets/jochwon-app/assets/...`)로 수정하고 런타임 캐시 버전을 갱신함.
- 확인: WIZ `main` 프로젝트 일반 빌드 성공(`EsBuild complete`, errors 없음).
