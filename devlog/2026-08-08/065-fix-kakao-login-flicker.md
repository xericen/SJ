# 카카오 로그인 후 iframe 빌드 식별자 불일치로 인한 깜빡임 수정

- 원본 요청: 카카오로그인하면 자꾸 깜빡거리는데 문제해결해줘,,
- 리뷰 ID: ryiqkvrfnnzenehhisukfuqipechlhcb
- 변경 파일: `src/assets/jochwon-app/index.html`, `devlog.md`, 본 상세 기록
- 변경 내용: 엔트리 URL 정규화 스크립트의 빌드 식별자를 런타임 복구 로직과 동일하게 맞춰 로그인 후 불필요한 history URL 갱신·복구 재진입을 제거함.
- 확인: WIZ `main` 프로젝트 빌드 성공 여부를 확인하고 엔트리의 두 빌드 식별자가 동일한지 검사함.
