# 자연 체험 완료 기록·E 관찰·마이홈 포탈 동작 보강

- 원본 요청: 축제 완료 활동명 변경, 포토존 완료 기록, 곰 5회 급여 완료 기록·동상, 수목원 E 관찰 후 채집, 꽃 5개 표시, 마이홈 포탈 3초 이동을 보강한다.
- 변경 파일:
  - `react-app/src/services/experienceHarness.ts`
  - `react-app/src/services/profileProgress.ts`
  - `react-app/src/components/PersonalFarmProgressExperience.tsx`
  - `react-app/src/game/renderers/VillageMapRenderer.ts`
- 확인: React production build, 서버 TypeScript build, WIZ `main` build 성공. 곰·수목원 관련 기존 테스트는 23개 통과했으며 3개는 기존 기대 문자열/구조가 현재 최신 동작과 불일치해 실패했다.
- 남은 리스크: 실제 브라우저에서 게스트로 5개 먹이 급여 후 마이홈 이동, 수목원 E→채집하기, 포토존 촬영을 순서대로 수행하는 수동 확인이 필요하다. 게스트 진행도는 기존 정책상 브라우저 탭 세션 저장이다.
