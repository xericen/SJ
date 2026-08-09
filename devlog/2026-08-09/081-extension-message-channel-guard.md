# 브라우저 확장 메시지 채널 종료 오류 판별 보강

- 원 요청: `A listener indicated an asynchronous response by returning true, but the message channel closed before a response was received` 오류 해결.
- 변경 파일: `react-app/index.html`, `react-app/src/runtimeBuild.ts`, `react-app/scripts/runtimeWarnings.test.ts`, `devlog.md`.
- 변경 내용: 확장 프로그램 메시지 채널 종료의 두 Chromium 문구와 중첩된 rejection 원인을 제한적으로 판별하고, 운영 캐시 버전을 갱신했다. 앱의 일반 Promise 오류는 계속 노출한다.
- 확인: `npm run test:runtime-warnings` 및 React/Vite/서버 빌드 확인 예정.
- 남은 리스크: 확장 프로그램 자체 콘솔에서 직접 출력하는 오류는 웹 앱이 숨길 수 없으며 해당 확장 프로그램 설정 또는 비활성화가 필요하다.
