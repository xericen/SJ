# 브라우저 확장 메시지 채널 종료 오류 격리

- 원 요청: `A listener indicated an asynchronous response ... message channel closed` 콘솔 오류 수정.
- 변경 파일: `src/app/page.home/view.pug`, `src/assets/jochwon-app/index.html`, `src/assets/jochwon-app/assets/*`, `devlog.md`, 본 상세 기록. React 원본은 `/opt/app/SJ/react-app/index.html`, 런타임 식별자와 회귀 테스트.
- 변경 내용: Chromium 확장 프로그램의 비동기 메시지 채널이 응답 전에 닫힐 때 발생하는 정확한 Promise 거부만 초기 엔트리에서 처리하며 다른 오류는 숨기지 않는다.
- 확인: 런타임 경고 회귀 테스트 3건 통과, React TypeScript/Vite/서버 빌드 및 성능 예산 검증 성공, WIZ `main` 빌드 성공, 운영 반영 확인.
- 남은 리스크: 확장 프로그램 자체 콘솔에서 직접 출력되는 로그는 페이지에서 제어할 수 없어 해당 확장 프로그램 비활성화가 필요할 수 있다.
