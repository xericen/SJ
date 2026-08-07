# ReviewOps 비동기 메시지 채널 종료 오류 격리

- 원본 요청: `Uncaught (in promise) Error: A listener indicated an asynchronous response by returning true, but the message channel closed before a response was received 오류 고쳐줘`
- 변경 파일: `src/angular/index.pug`, `react-app/scripts/runtimeEntry.test.ts`
- 변경 내용: ReviewOps SDK에서 발생하는 비동기 메시지 채널 종료 오류를 외부 진단 SDK 오류로 분류해 애플리케이션 전역 오류로 노출되지 않도록 격리했다.
- 확인: ReviewOps 오류 격리 테스트에 해당 오류 패턴 검증을 추가했다.
- 남은 리스크: 브라우저 확장 프로그램 자체에서 발생하는 동일 문구는 웹 앱 코드로 제어할 수 없다.
