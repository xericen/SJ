# 마이홈 꽃 슬롯·수목원 진행 표시·체험용 기억나무 보강

- 원 요청: 마이홈 좌측 상단 꽃 슬롯 UI 제거, 화단 근처에서 원하는 꽃을 선택하고 E로 심기, 체험용 기억나무 오류 제거, 수목원 완료 최근활동, 수목원 꽃 진행 표시, 곰 동상 GLB 확인.
- 변경 파일: `react-app/src/components/PersonalFarmProgressExperience.tsx`, `react-app/src/services/personalFarmApi.ts`, `react-app/src/services/experienceHarness.ts`, 운영 정적 자산 `src/assets/jochwon-app/`.
- 변경 내용: 상시 좌측 슬롯 패널을 제거하고 화단 근처 중앙 상호작용 카드만 유지했다. 수목원 완료 시 `수목원 체험 완료` 활동을 기록하고 수집·선택 진행률을 표시한다. 체험용 기억나무는 서버 호출 없이 선택 꽃 기반 로컬 결과를 저장한다.
- 곰 동상: `src/assets/characters/bear.glb`가 존재하며 `bearStatueAssetFactory`가 이를 운영 번들로 로드해 마이홈 동상을 생성하는 기존 경로를 확인했다.
- 확인: `npm run build` 및 성능 검증 성공, 운영 dist 동기화, WIZ `main` 프로젝트 빌드 성공.
- 남은 리스크: 실제 브라우저에서 E키와 GLB 표시를 직접 조작하는 수동 검증은 별도 필요하며, 기존 브라우저 캐시는 강력 새로고침이 필요할 수 있다.
