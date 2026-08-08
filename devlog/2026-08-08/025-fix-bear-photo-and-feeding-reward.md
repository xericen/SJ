# 025. 베어트리 포토존·곰체험소 진행 연결

## 사용자 요청

베어트리파크 포토존 체험 완료를 내 프로필 최근활동에 기록하고, 곰체험소 진입 시 설명문을 표시하며 먹이 5개 완료 시 마이홈 곰 동상이 설치되도록 원인을 찾아 수정한다.

## 변경 파일

- `react-app/src/components/PersonalFarmProgressExperience.tsx`
- `react-app/src/components/PersonalFarmProgressExperience.css`
- 최신 `src/assets/jochwon-app/index.html` 및 `assets/*`

## 원인 및 확인

포토존 캡처 이벤트가 최근활동 기록 함수에 연결되지 않았고, 곰체험소 설명 컴포넌트가 실제 게임 화면에 렌더링되지 않았다. 또한 WIZ API가 action/spotId를 query로 읽는데 프론트가 POST body로 보내 먹이 작업이 조회로 처리되고 있었다. 공통 진행 컴포넌트에서 포토존 이벤트를 기록하고 곰체험소 안내 카드와 먹이 5개·곰동상 완료 문구를 표시하도록 연결했으며, WIZ 요청을 query 방식으로 수정했다. React/Vite 및 WIZ 빌드 성공, 운영 배포를 완료했다.
