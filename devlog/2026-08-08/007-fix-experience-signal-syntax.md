# experience signal bridge 구문 오류 수정

- 원요청: `experience-signal-bridge.js:42`의 `missing ) after argument list` 오류를 수정한다.
- 변경 파일: `src/assets/jochwon-app/assets/experience-signal-bridge.js`
- 수정: 중첩 화살표 함수 한 줄을 명시적인 `forEach` 블록으로 풀어 괄호 누락을 제거했다.
- 검증: `node --check` 및 `git diff --check` 통과.
