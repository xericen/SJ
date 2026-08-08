# 축제 관심 저장 최근활동 중복 제거

- 원본 요청: 축제 체험장에서 관심 저장 시 최근활동 기록이 2개 생성되는 문제를 수정하고 새로고침 후 운영 사이트에서 확인 가능하게 한다.
- 원인: harness가 생성한 `festival-experience:saved:{festivalId}` 활동과 호수공원 legacy `savedContentIds` 스냅샷을 프로필 기록에 함께 추가하고 있었다.
- 변경: `profileProgress`에서 동일 축제 ID의 harness 저장 기록이 있으면 legacy 스냅샷을 추가하지 않도록 ID 기반 중복 제거를 보강했다.
- 확인: React production build, 서버 TypeScript build, 예술의전당 회귀 테스트 8개 통과. 최신 `dist`를 WIZ 정적 자산에 반영하고 WIZ `main` 빌드 성공.
- 남은 리스크: 기존 localStorage에 이미 생성된 중복 기록은 읽기 시 중복 억제되지만, 실제 브라우저에서 축제 저장 후 새로고침하는 수동 확인은 필요하다.
