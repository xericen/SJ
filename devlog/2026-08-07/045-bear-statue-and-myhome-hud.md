# 곰 5회 급여 동상 자동 설치 및 마이홈 상단 HUD 겹침 수정

- 사용자 요청: 곰 체험소에서 5개 먹이를 주면 마이홈에 곰 동상을 자동 설치하고, 마이홈 우측 상단의 정원 현황·맵 이동·나가기 버튼이 겹치지 않게 수정한다.
- 변경 파일: `react-app/src/game/renderers/VillageMapRenderer.ts`, `react-app/src/pages/GamePage.css`, 배포 정적 자산 `src/assets/jochwon-app/`.
- 변경 내용: 5회 급여 직후 `bearFed` 상태만 먼저 도착하는 경우에도 곰 동상 렌더링을 시작하도록 해금 조건을 보강했다. 마이홈 정원 현황 패널을 우측 상단 버튼 행 아래로 이동하고 모바일 좌표도 별도로 조정했다.
- 확인: 곰 급여 테스트 4건 통과, React/Vite 빌드 및 성능 검사 통과, `git diff --check` 통과, WIZ `main` 프로젝트 빌드 성공.
