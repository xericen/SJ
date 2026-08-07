# 수목원 E 관찰 후 채집 흐름 및 플레이어 크기 수정

- 사용자 요청: 수목원 맵에서 E로 식물을 관찰한 뒤 채집하기를 눌러야 마이홈 수집 기록에 남도록 하고, 획득 버튼을 삭제하며 플레이어 크기를 키운다.
- 변경 파일: `react-app/src/components/PersonalFarmProgressExperience.tsx`, `react-app/src/game/worldNavigationProfile.ts`, `react-app/scripts/natureUiAdjustments.test.ts`, `react-app/scripts/worldNavigationConsistency.test.ts`, 배포 정적 자산 `src/assets/jochwon-app/`.
- 변경 내용: 수목원 하단 직접 획득 카드와 E키 직접 수집 경로를 제거하고 GreenhouseExperience의 관찰 모달 내 `채집하기`만 수집 API를 호출하도록 단일화했다. 수목원 캐릭터 높이를 165에서 240으로 조정했다.
- 확인: 관련 정적 테스트, Greenhouse 테스트, React/Vite 빌드, 성능 예산 검사, `git diff --check`, WIZ `main` 프로젝트 빌드 성공.
