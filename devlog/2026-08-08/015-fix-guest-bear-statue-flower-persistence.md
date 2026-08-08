# 체험용 곰 동상·꽃 슬롯 진행값 유지 보강

- 원 요청: 곰 체험소에서 먹이 5개를 모은 뒤 마이홈에 곰 동상이 나타나지 않고, 마이홈 꽃 심기 슬롯이 새로고침·맵 이동 후 반영되지 않는 문제를 수정해 달라는 요청.
- 변경 파일: `react-app/src/services/guestPersonalFarmProgress.ts`, `react-app/src/game/GameCanvas.tsx`, 운영 정적 자산 `src/assets/jochwon-app/`.
- 변경 내용: 체험용 개인농장 진행값을 기존 세션 저장값에서 버전 2 localStorage로 승격하고 기존 세션 값은 자동 이전한다. 맵 화면 언마운트가 진행값을 초기화하지 않도록 정리 로직에서 자동 삭제를 제거했다. 구버전 `plantedFlowerIds`만 있는 데이터도 꽃 슬롯으로 복원하고, 꽃 제거 시 슬롯 데이터도 함께 갱신한다.
- 확인: React `npm run build` 성공, 운영 dist를 정적 자산에 동기화, WIZ `main` 프로젝트 빌드 성공.
- 남은 리스크: 실제 브라우저에서 기존 체험용 계정으로 먹이 5회·마이홈 이동·새로고침을 수행하는 수동 확인은 이 실행 환경에서 완료하지 못했다. 브라우저 localStorage가 차단된 경우에는 기존 탭 내 동작만 보장된다.
