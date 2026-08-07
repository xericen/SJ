# 베어트리파크 곰 체험소 포탈 주황색 렌더링 경로 수정

- 사용자 요청: 베어트리파크의 곰 체험소행·세종호수공원행 포탈이 반복 요청에도 주황색으로 보이지 않는 원인을 확인하고 수정한다.
- 원인: 세종호수공원행 일반 포탈은 theme 값을 사용했지만, 곰 체험소행은 InteractionConfig 경로를 통해 렌더링되며 interaction 설정 타입과 실제 설정에 theme:'orange'가 없었다. 렌더러의 기본 색상인 민트가 적용됐다.
- 변경 파일: react-app/src/game/renderers/VillageMapRenderer.ts, 배포 정적 자산 src/assets/jochwon-app/.
- 변경 내용: InteractionConfig가 포탈 appearance/theme을 전달하도록 확장하고, 베어트리파크 곰 체험소행 interaction에 theme:'orange'와 일반 standing appearance를 명시했다. 호수공원행 포탈의 기존 orange 설정도 유지했다.
- 확인: 베어트리파크·자연 UI 정적 테스트 12개 통과, React/Vite 빌드 및 성능 검사 통과, git diff --check, WIZ main 프로젝트 빌드 성공.
