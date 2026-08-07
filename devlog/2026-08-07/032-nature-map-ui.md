# 자연 맵 포탈·캐릭터·HUD·수집 안내 정리

- 원본 요청: `베어트리파크에 있는 포탈 색 주황색으로 통일해줘, 좌측 상단에 있는 수목원 체험 곰가족 포토존 그 부분 삭제해줘. 세종 수목원 맵에서 캐릭터 크기를 현재 크기 1.5배로 플레잌어 키워줘, 그리고 식물에 다가가면 마이홈 수집기록에 담기랑 그 아래 겹쳐져있는데 이 부분 수정해줘, 그리고 좌측 상단에 자연체험여정 없애줘, 현재활동 보이게 해줘`
- 변경 파일: `react-app/src/game/renderers/VillageMapRenderer.ts`, `react-app/src/game/worldNavigationProfile.ts`, `react-app/src/game/GameCanvas.tsx`, `react-app/src/pages/GamePage.css`, `react-app/src/components/PersonalFarmProgressExperience.css`, `react-app/scripts/natureUiAdjustments.test.ts`
- 변경 내용: 베어트리파크의 호수공원·수목원 포탈을 주황색으로 통일하고, 자연체험여정 HUD를 제거했다. 수목원 캐릭터 높이를 110에서 165로 키웠으며, 식물 수집 카드와 하단 UI가 겹치지 않도록 위치를 상향 조정했다. 자연 맵에서도 현재 활동 패널이 상단에 표시되도록 했다.
- 확인: 자연 맵 UI 정적 테스트 후 React 번들 생성 및 WIZ 운영 빌드를 진행한다.
- 남은 리스크: 캐릭터 크기 증가는 카메라 구도와 충돌 체감에 영향을 줄 수 있다.
