# 자연 맵 포탈 지연·수목원 식물 선택 HUD·캐릭터 조절 반영

- 사용자 요청: 곰 체험소의 호수공원 귀환 포탈을 주황색으로 통일하고, 수목원 식물 5개 선택 상태를 상단에 표시하며, 마이홈 포탈 이동을 3초 후 허용하고, 캐릭터 크기 조절 바와 5개 식물 기반 기억나무·프로필 반영을 제공한다.
- 변경 파일: react-app/src/game/renderers/VillageMapRenderer.ts, react-app/src/services/worldCameraProfiles.ts, react-app/src/components/WorldCameraEditor.tsx, react-app/src/components/GreenhouseExperience.tsx, react-app/src/components/GreenhouseExperience.base.css, react-app/src/components/AiSejongProfile.tsx, 배포 정적 자산 src/assets/jochwon-app/.
- 변경 내용: 수목원→마이홈 포탈에 3초 충전 조건을 추가했다. 수목원 상단에 마이홈 식물 5칸 진행 HUD를 표시하고, 캐릭터 크기 조절 범위를 300까지 확대했다. 수목원을 카메라 편집 대상으로 노출했으며, 5개 식물부터 기억나무 해금과 자연 프로필 TOP 식물 반영을 시작한다. 베어트리파크→호수공원 포탈은 기존 주황색 설정을 유지했다.
- 확인: 자연·포탈 관련 정적 테스트 17개 통과, React/Vite 빌드 및 성능 검사 통과, git diff --check, WIZ main 프로젝트 빌드 성공.
