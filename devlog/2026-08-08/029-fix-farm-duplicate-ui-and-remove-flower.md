# 마이홈 화단 중복 안내 제거 및 식재 위치별 꽃 제거 버튼 추가

- 원 요청: 마이홈에 중복으로 표시되는 두 안내 중 하단 식재 패널만 남기고, 식물이 심어진 위치에는 제거 버튼 표시.
- 변경 파일: `react-app/src/components/PersonalFarmProgressExperience.tsx`, `react-app/src/components/PersonalFarmProgressExperience.css`.
- 변경 내용: 상단 `마이홈과 작은 화단` 안내 카드를 제거하고, 현재 접근한 1~5번 슬롯의 꽃이 있으면 하단 패널에 `제거` 버튼을 표시해 해당 슬롯의 꽃을 삭제.
- 확인: React 빌드 및 WIZ 운영 배포 후 운영 번들 정적 응답 확인.
