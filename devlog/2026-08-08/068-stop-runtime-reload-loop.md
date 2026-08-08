# iframe 런타임 오류 시 무한 자동 새로고침 차단

- 원본 요청: 계속 혼자 새로고침하는데 왜이러는 거야
- 리뷰 ID: ryiqkvrfnnzenehhisukfuqipechlhcb
- 변경 파일: `src/assets/jochwon-app/index.html`, `devlog.md`, 본 상세 기록
- 변경 내용: 런타임 오류 복구 시 자동 `location.replace()`를 제거하고 현재 문서에 1회 안내 오버레이만 표시하도록 수정했으며, 빌드 식별자도 정규화·복구 로직 간 동일하게 맞춤.
- 확인: WIZ `main` 프로젝트 빌드 성공 여부와 자동 페이지 이동 코드 제거를 확인함.
