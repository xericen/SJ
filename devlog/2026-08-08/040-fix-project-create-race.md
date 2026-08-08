# 프로젝트 생성 직후 목록 누락 방지

- 원본 요청: 프로젝트실에서 만든 프로젝트가 내 프로젝트·프로젝트 둘러보기에 나타나지 않고, 다른 사용자에게도 실시간으로 보이지 않는 문제 수정.
- 변경 파일: `react-app/src/services/projectRoomProjects.ts`, `react-app/src/services/unifiedProfileApi.ts`
- 변경 내용: 프로젝트 저장 중인 항목을 실시간 재조회 결과에 임시 병합해 생성 직후 이전 서버 목록으로 덮어쓰이지 않게 했다. WIZ 프로젝트 저장 payload를 query로 명시해 서버가 안정적으로 수신하도록 보강했다.
- 검증: `npm run build` 성공 및 성능 예산 검사 통과.
