# 곰 체험소 포탈 통일·현재 활동 복구·5회 먹이 모션 반복

- 사용자 요청: 곰 체험소행 포탈 디자인을 통일하고, 곰 체험소 좌측 상단 현재 활동 패널을 복구하며, 입장부터 먹이 요청 모션과 5회 반복 급여 애니메이션을 적용한다.
- 변경 파일: react-app/src/game/renderers/VillageMapRenderer.ts, react-app/src/pages/GamePage.css, 배포 정적 자산 src/assets/jochwon-app/.
- 변경 내용: 먹이 급여 횟수가 5회 미만이면 곰을 항상 먹이 요청 모션으로 유지하고, 각 급여 후 보상 애니메이션이 끝나면 다시 먹이 요청 모션으로 복귀하도록 수정했다. 곰 체험소의 현재 활동 패널을 숨기던 조건을 제거했다. 포탈은 공통 white-circle 렌더링 경로를 사용한다.
- 확인: 곰 먹이·포탈·자연 테스트 16개 통과, React/Vite 빌드 및 성능 검사 통과, git diff --check, WIZ main 프로젝트 빌드 성공.
