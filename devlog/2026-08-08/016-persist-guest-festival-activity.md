# 체험용 축제 활동을 허브 최근활동에 유지

- 원 요청: 체험용 사용자가 축제부스에서 활동한 뒤 세종호수공원으로 돌아와도 최근활동이 보이지 않는 원인을 확인하고 수정.
- 원인: `experienceHarness`가 비로그인 체험용 데이터를 메모리 전용 저장소에 기록했지만, 허브 프로필은 localStorage 기반 기록을 읽고 있었음. 맵 전환·새로고침 시 메모리 기록이 소실됨.
- 변경 파일: `react-app/src/services/experienceHarness.ts`, 운영 정적 자산 `src/assets/jochwon-app/`.
- 변경 내용: 체험용 experience harness의 프로필·관심·활동 기록 저장을 localStorage로 통일하고, 맵 언마운트 시 체험용 기록을 초기화하지 않도록 변경.
- 확인: React `npm run build` 및 성능 검증 성공, 운영 dist 동기화, WIZ `main` 프로젝트 빌드 성공.
- 남은 리스크: 실제 브라우저에서 새 체험용 세션으로 축제 체험 완료 후 허브 화면을 확인하는 수동 검증은 별도 필요.
