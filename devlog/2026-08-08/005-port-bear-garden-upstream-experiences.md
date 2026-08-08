# 원본 저장소의 곰 먹이·꽃 슬롯·기억나무 AI 체험 이식

- 원요청: GitHub 원본에 있는 곰체험소와 수목원 기능을 기존 운영 구조를 보존하면서 WIZ 환경에 맞춰 복원한다.
- 변경 파일: `react-app/src/components/PersonalFarmProgressExperience.tsx`, `react-app/src/components/GreenhouseExperience.tsx`, `react-app/src/services/guestPersonalFarmProgress.ts`, `react-app/src/services/personalFarmApi.ts`, `react-app/src/game/renderers/VillageMapRenderer.ts`, `react-app/shared/personal-farm.ts`, 서버 개인농장 모델·서비스.
- 구현: 곰 먹이 5단계 전달, 먹이 보유 전 급여 차단, 급여 완료 보상/춤 모션, 개인별 진행 저장, 꽃 슬롯 선택 배치, 꽃 5개 기반 기억나무 AI 분석을 원본 구현에서 이식했다.
- WIZ 프로젝트 빌드 성공.
- 검증: greenhouse, greenhouse AI, personal-farm interaction 테스트 통과. 기존 bear-feeding 테스트 1건은 원본 최신 정책(ramba/보상 모션 필터)과 저장소 테스트의 이전 정규식 기대가 달라 실패했다.
