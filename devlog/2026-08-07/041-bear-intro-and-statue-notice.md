# 곰 체험소 진입 설명 및 급여 완료 동상 안내 추가

- 사용자 요청: 곰 체험소에 들어가면 설명 글을 보여주고, 급여 완료 시 마이홈에 곰 동상이 추가되었다고 안내한다.
- 변경 파일: react-app/src/components/BearTravelStyleExperience.tsx, react-app/src/components/PersonalFarmProgressExperience.tsx, 배포 정적 자산 src/assets/jochwon-app/.
- 변경 내용: 곰 체험소 입장 때 기존 곰 체험 설명 모달을 매번 표시하도록 보완했다. 급여 완료 상태의 곰 체험 카드와 진행 상태에 ‘마이홈에 곰 동상이 추가됐어요’ 안내를 표시한다.
- 확인: 곰 먹이·포탈·자연 정적 테스트 15개 통과, React/Vite 빌드 및 성능 검사 통과, git diff --check, WIZ main 프로젝트 빌드 성공.
