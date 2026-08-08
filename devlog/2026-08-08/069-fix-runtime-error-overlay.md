# React 런타임 오류를 로딩 실패 화면으로 오인하는 핸들러 제거

- 원본 요청: 카카오 로그인하면 복구 화면이 표시되어 카카오 로그인부터 프로필 생성까지 확인 요청
- 리뷰 ID: ryiqkvrfnnzenehhisukfuqipechlhcb
- 변경 파일: `src/assets/jochwon-app/index.html`, `devlog.md`, 본 상세 기록
- 변경 내용: 엔트리 번들 내부의 일반 JavaScript/React 오류까지 자산 로딩 실패로 처리하던 전역 `error` 이벤트 핸들러를 제거함. JS/CSS 태그의 명시적인 `onerror` 복구만 유지함.
- 확인: 운영 URL의 엔트리·JS·CSS·이미지·폰트 응답이 모두 HTTP 200임을 확인함.
