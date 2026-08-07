# 수목원 진입 안내·캐릭터 크기 덮어쓰기·5개 채집 해금 안내 수정

- 사용자 요청: 수목원 진입 설명을 현재 조작 방식에 맞추고, 작아진 캐릭터의 원인을 해결하며, 식물 5개 채집 완료 안내와 마이홈 심기·기억나무 해금을 표시한다.
- 원인: 수목원 기본 캐릭터 높이 240이 있어도 서버에서 내려온 과거 공용 카메라 프로필이 GameCanvas 동기화 과정에서 다시 적용되어 캐릭터를 작게 만들 수 있었다.
- 변경 파일: react-app/src/game/GameCanvas.tsx, react-app/src/components/GreenhouseExperience.tsx, react-app/src/components/GreenhouseExperience.base.css, 배포 정적 자산 src/assets/jochwon-app/.
- 변경 내용: 수목원은 저장된 로컬 조절값이 없을 때 오래된 공용 프로필로 기본 크기를 덮어쓰지 않도록 했다. 진입 안내를 E키 관찰→채집하기→5개 채집 완료 흐름으로 갱신하고, 상단 HUD에 5개 완료 시 마이홈 심기와 기억나무 해금 안내를 표시했다. 기억나무 기본 해금 조건은 5개 채집으로 유지했다.
- 확인: 자연·포탈·월드 내비게이션 정적 테스트 17개 통과, React/Vite 빌드 및 성능 검사 통과, git diff --check, WIZ main 프로젝트 빌드 성공.
