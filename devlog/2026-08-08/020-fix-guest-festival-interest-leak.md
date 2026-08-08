# 체험용 축제 관심사 저장·최근활동 노출 차단

- 원본 요청: 축제부스 체험 후 세종호수공원으로 돌아왔을 때 저장한 관심사가 최근활동에 나오지 않고, 체험용에서는 관심사 저장이 남지 않도록 원인을 찾아 해결해 달라는 요청.
- 변경 파일:
  - `react-app/src/services/experienceHarness.ts`
  - `react-app/src/services/profileProgress.ts`
  - `react-app/src/components/LakeParkExperiences.tsx`
- 변경 내용: 비로그인 체험 모드에서 공연·먹거리·축제·식물 관심사 및 관심사 기반 로컬 활동 기록을 차단하고, 축제 체험 완료 기록만 허용했다. 호수공원 프로필의 로컬 관심사 스냅샷 재집계를 비로그인 모드에서 차단하고 축제 최근활동을 `축제 부스 체험 완료`로 제한했다. 호수공원 관심사 프로필도 로그인 모드에서만 로컬 저장한다.
- 확인: `git diff --check` 통과, `react-app` `npm run build` 통과.
- 남은 리스크: 실제 브라우저에서 로그인/체험용 전환과 축제부스 진입·완료·호수공원 복귀를 수동 확인해야 한다.
