# 대표 체험 완료 이벤트와 허브 프로필 요약 연결

- 원요청: 기존 experience profile harness를 사용해 세부 맵의 대표 체험 완료를 최근 활동·키워드·관심사·완성도 요약으로 연결한다.
- 변경 파일: `src/assets/jochwon-app/assets/experience-signal-bridge.js`
- 구현: 13개 대표 체험을 `mapId:experience-complete:subject`로 기록하고 `experience-signal-once-v1:*` marker로 최초 1회만 반영한다. 기존 상세 signal은 유지한다.
- 저장: 기존 `sejong-campus-profile-signals-v1:*` harness 저장을 사용하며, 허브 요약은 `sejong-hub-profile-summary-v1:*`에 저장한다.
- 검증: bridge JavaScript 구문 검사 및 WIZ 운영 번들 배포 전 정적 연결 확인. 실제 브라우저 상호작용은 이 작업 환경에서 자동화 도구가 없어 미실행.
