# 운영 stale 청크 및 behavior sync 네트워크 오류 완화

- 사용자 요청: 운영에서 발생한 GamePage 청크 SyntaxError와 reviewops behavior state sync Failed to fetch 오류를 해결한다.
- 원인: 브라우저가 이전 배포의 GamePage 청크를 계속 요청하는 stale index/chunk 조합이었고, behavior state API가 연결되지 않을 때 동기화가 반복 재시도되며 콘솔 경고를 출력했다.
- 변경 파일: react-app/src/services/behaviorStateSync.ts, 배포 정적 자산 src/assets/jochwon-app/.
- 변경 내용: 최신 Vite 산출물로 index와 청크를 함께 다시 배포했다. behavior state 동기화가 네트워크 연결 실패를 감지하면 해당 세션에서 재시도를 중단하고 콘솔 반복 경고를 억제하도록 했다.
- 확인: React/Vite 빌드 및 성능 검사 통과, git diff --check, WIZ main 프로젝트 빌드 성공.
