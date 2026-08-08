# 마이홈 하단 식재창 제거 및 수목원 플레이어 속도 1.5배 적용

- 원 요청: 마이홈 집 앞 하단 식재 창 제거, 수목원 플레이어 속도 1.5배 변경.
- 변경 파일: `react-app/src/components/PersonalFarmProgressExperience.tsx`, `react-app/src/components/PersonalFarmProgressExperience.css`, `react-app/src/game/scenes/WorldScene.ts`.
- 변경 내용: 마이홈 슬롯 선택 패널 렌더링과 스타일을 제거하고, 수목원 이동 시 예술의전당 기준 속도(걷기 180·달리기 280)에 1.5배를 적용.
- 확인: React 빌드 및 WIZ 운영 배포 후 운영 번들 정적 응답 확인.
