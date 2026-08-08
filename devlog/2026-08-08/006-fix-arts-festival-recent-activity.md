# 예술 공연 즉시 활동 기록 및 축제 저장 중복 제거

- 원요청: 세종예술의전당 공연 관람·저장 기록 누락과 축제부스 관심 저장의 최근 활동 중복을 수정한다.
- 변경 파일: `react-app/src/services/experienceHarness.ts`, `react-app/src/services/profileProgress.ts`
- 원인: 예술 활동 record가 세션 분석 flush 시점에만 생성되고, 축제 저장은 harness record와 호수 저장 record가 다른 ID로 함께 계산됐다.
- 수정: 공연 `favorite`/`finish` 즉시 stable record 생성, 공연별 ID로 재기록 병합, 축제 저장/완료 record를 안정적인 콘텐츠·부스 ID로 병합, 동일 축제 저장 record가 호수 record와 중복되지 않도록 필터링했다.
- 검증: TypeScript client/server 검사, WIZ 프로젝트 빌드 성공.
