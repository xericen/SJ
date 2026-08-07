# 세종호수공원 포탈 흰색 원형 디자인 통일

- 사용자 요청: 세종호수공원에 있는 포탈을 세종 추천 코스 게시판과 같은 흰색 포탈 디자인으로 통일한다.
- 변경 파일: react-app/src/game/lakeParkPortals.ts, react-app/scripts/lakePortals.test.ts, 배포 정적 자산 src/assets/jochwon-app/.
- 변경 내용: 세종호수공원에 등록된 모든 이동 포탈에 appearance:'white-circle'을 명시해 목적지별 기존 standing·테마 색상 차이를 제거했다. 세종 추천 코스 게시판의 흰색 원형 스타일과 동일한 렌더링 경로를 사용한다.
- 확인: 호수공원 포탈 테스트 17개 통과, React/Vite 빌드 및 성능 검사 통과, git diff --check, WIZ main 프로젝트 빌드 성공.
