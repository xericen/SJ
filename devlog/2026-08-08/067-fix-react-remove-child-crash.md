# 로그인 복구 오버레이와 React 루트 DOM 충돌 수정

- 원본 요청: 로그인하면 `removeChild` NotFoundError가 발생하고 화면이 다시 준비 화면으로 바뀜
- 리뷰 ID: ryiqkvrfnnzenehhisukfuqipechlhcb
- 변경 파일: `src/assets/jochwon-app/index.html`, `devlog.md`, 본 상세 기록
- 변경 내용: 런타임 오류 복구 UI가 React가 관리하는 `#root`를 직접 교체하지 않고 별도 고정 오버레이를 `body`에 추가하도록 변경했으며, 엔트리 캐시 버전을 갱신함.
- 확인: WIZ `main` 프로젝트 빌드 성공 여부를 확인함.
