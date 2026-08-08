# 체험용 새로고침 초기화

- 리뷰 ID: `zisrbvxelzuugwhwwqwnhjrqorfygyqx`
- 사용자 원 요청: 체험용에서 새로고침했을 때 이전 진행도와 최근 저장 데이터가 남지 않고 처음부터 백지로 시작되는지 확인하고 수정해 달라는 요청.
- 변경 파일:
  - `react-app/src/services/guestPersonalFarmProgress.ts`
  - `react-app/src/services/experienceHarness.ts`
- 변경 내용:
  - 비로그인 곰·수목원·마이홈 진행도를 localStorage/sessionStorage에서 읽거나 저장하지 않고 메모리 세션으로만 유지.
  - 체험용 세션 첫 진입 시 기존 버전에서 남은 로컬 체험 데이터를 정리.
  - 같은 탭의 맵 이동은 유지하되 브라우저 새로고침 후에는 새 메모리 세션으로 초기화.
  - 로그인 사용자의 서버 기반 진행도와 계정 데이터 저장 방식은 변경하지 않음.
- 확인:
  - `npm run build` 통과.
  - `npm run test:personal-farm-latest` 통과(5/5).
  - `npm run test:club-street` 통과(2/2).
  - `git diff --check` 통과.
- 남은 리스크: 실제 운영 iframe에서 새로고침·로그인 전환을 직접 재현하는 브라우저 검증은 캡처 제한으로 수행하지 못함.
