# 수목원 캐릭터 2/3 축소 및 포탈 색상 덮어쓰기 최종 수정

- 사용자 요청: 수목원 캐릭터를 현재 크기의 약 2/3로 줄이고, 곰 체험소행 포탈이 계속 민트색으로 보이는 원인을 해결한다.
- 원인: 공통 포탈 정규화 함수가 지도별 설정을 덮어쓰며 항상 theme:'mint'를 마지막에 적용하고 있었다.
- 변경 파일: react-app/src/game/worldNavigationProfile.ts, react-app/src/game/worldPortalVisual.ts, 관련 정적 테스트, 배포 정적 자산 src/assets/jochwon-app/.
- 변경 내용: 수목원 기본 캐릭터 높이를 240에서 160으로 조정했다. 공통 포탈 모양은 유지하되 지도별 theme가 우선되도록 정규화 순서를 변경해 곰 체험소행·호수공원행 포탈의 orange가 실제 렌더러까지 전달되게 했다.
- 확인: 자연·포탈·월드 내비게이션 테스트 17개 통과, React/Vite 빌드 및 성능 검사 통과, git diff --check, WIZ main 프로젝트 빌드 성공.
