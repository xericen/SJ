# 베어트리파크 진입 안내 갱신 및 곰 체험소 포탈 디자인 통일

- 사용자 요청: 베어트리파크 진입 설명을 현재 맵에 맞게 수정하고 곰 체험소행 포탈 디자인을 변경한다.
- 변경 파일: react-app/src/components/BearTreeParkTutorial.tsx, react-app/src/game/renderers/VillageMapRenderer.ts, 배포 정적 자산 src/assets/jochwon-app/.
- 변경 내용: 베어트리파크 안내를 숲길·곰 가족 포토존·수목원·곰 체험소 흐름에 맞게 갱신하고 안내 숨김 키 버전을 올려 새 설명이 다시 노출되게 했다. 곰 체험소행 포탈에 white-circle appearance를 명시해 공통 흰색 원형 디자인을 사용하도록 했다.
- 확인: 베어트리파크·호수공원 포탈 테스트 28개 통과, React/Vite 빌드 및 성능 검사 통과, git diff --check, WIZ main 프로젝트 빌드 성공.
