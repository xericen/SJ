# ReviewOps·WIZ 런타임 재연결

- 원 요청: ReviewOps와 WIZ 연동 상태 확인, 웹 수정이 반영되지 않는 원인 조사 및 재연결.
- 원인: 페이지 외부 iframe이 오래된 `_build` 식별자(`v210`)를 고정 사용해 리뷰 캡처와 내부 런타임의 버전 식별이 분리되어 있었음.
- 변경 파일: `src/app/page.home/view.pug`, `src/assets/jochwon-app/index.html`
- 변경 내용: 외부 iframe과 내부 런타임을 `20260808-reviewops-wiz-reconnect-v1`로 통일.
- 확인: WIZ 소스 동기화 및 빌드 성공. 운영 `/home`, `/auth/check`, 커뮤니티 API 모두 200. ReviewOps SDK는 200, CORS 허용, no-cache 응답.
- 남은 리스크: 이미 열린 ReviewOps 캡처 탭은 닫고 리뷰 링크를 새로 열어야 새 iframe 식별자가 적용됨.
