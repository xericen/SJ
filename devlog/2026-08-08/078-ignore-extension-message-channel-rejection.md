# 브라우저 확장 메시지 채널 종료 오류 격리

- 원 요청: `A listener indicated an asynchronous response ... message channel closed` 콘솔 오류 수정.
- 변경 파일: `react-app/index.html`, `react-app/src/runtimeBuild.ts`, `react-app/scripts/runtimeWarnings.test.ts`, 운영 정적 자산, `devlog.md`, 본 상세 기록.
- 변경 내용: Chromium 확장 프로그램의 비동기 메시지 채널이 응답 전에 닫힐 때 발생하는 정확한 Promise 거부만 엔트리 초기 단계에서 처리한다. 다른 애플리케이션 오류는 그대로 노출한다.
- 확인: React TypeScript/Vite/서버 빌드 및 성능 예산 검증 성공, WIZ `main` 빌드 성공, 운영 엔트리에 제한적 오류 필터 반영 확인.
- 남은 리스크: 확장 프로그램 자체 개발자 콘솔에서 직접 출력하는 로그는 웹페이지가 제어할 수 없으며, 해당 경우 확장 프로그램을 비활성화해야 한다.
