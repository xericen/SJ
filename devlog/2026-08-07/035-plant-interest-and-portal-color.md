# 자연 포탈 주황색·수목원 HUD 배치·관심 식물 저장 추가

- 사용자 요청: 베어트리파크의 곰 체험소·세종호수공원 포탈을 주황색으로 통일하고, 수목원 식물 선택 HUD를 마이홈 버튼과 겹치지 않게 배치하며, 식물을 저장한 관심사에 추가한다.
- 변경 파일: react-app/src/game/renderers/VillageMapRenderer.ts, react-app/src/services/experienceHarness.ts, react-app/src/components/GreenhouseExperience.tsx, react-app/src/components/GreenhouseExperience.base.css, react-app/src/components/AiSejongProfile.tsx, 배포 정적 자산 src/assets/jochwon-app/.
- 변경 내용: 베어트리파크의 두 포탈에 주황색 설정을 유지·확인하고, 수목원 마이홈 식물 HUD를 우측 상단 마이홈 버튼 왼쪽으로 이동했다. 식물 상세 화면에 관심 식물 저장/해제 버튼을 추가하고 저장한 관심사에 ‘관심 식물’ 그룹을 표시한다.
- 확인: 자연·포탈 정적 테스트 12개 통과, React/Vite 빌드 및 성능 검사 통과, git diff --check, WIZ main 프로젝트 빌드 성공.
