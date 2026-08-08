# 026. 곰체험소·마이홈 안내 및 화단 UI 보강

## 사용자 요청

곰체험소를 베어트리파크처럼 첫 진입 안내로 표시하고, 먹이 5개 완료 시 마이홈 곰동상 설치 문구를 표시한다. 수목원 꽃 5개 완료 안내, 화단 위치별 식재 UI 중앙 하단 배치, 마이홈 상단 이동·나가기 버튼 우측 정렬을 보강한다.

## 변경 파일

- `react-app/src/components/BearPlayZoneTutorial.tsx`
- `react-app/src/pages/GamePage.tsx`
- `react-app/src/components/PersonalFarmProgressExperience.tsx`
- `react-app/src/components/PersonalFarmProgressExperience.css`
- 최신 `src/assets/jochwon-app/index.html` 및 `assets/*`

## 확인

곰체험소 진입 시 1회 안내 모달, 먹이 5개 및 마이홈 보상 안내, 꽃 5개 완료 알림, 화단 슬롯 선택 UI 중앙 하단 스타일을 적용했다. React/Vite 및 WIZ 빌드 성공, 운영 배포를 완료했다.
