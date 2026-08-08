# 예술의전당 5개 포스터 활동 제목 연결 보강

- 원본 요청: 세종예술의전당 포스터 5개 연결을 확인하고, 렁스(사용자 표현: 럭스)를 저장했는데 서편제로 표시되는 최근활동 원인을 수정한 뒤 빌드한다.
- 변경 파일:
  - `react-app/src/components/ArtsCenterPosterKiosk.tsx`
  - `react-app/src/components/ArtsCenterStageVideo.tsx`
  - `react-app/src/services/experienceHarness.ts`
- 변경 내용: 포스터 관심 저장·영상 완료 이벤트에 현재 화면의 공연 제목을 함께 전달하고, harness가 해당 제목을 우선 사용하도록 보강했다. 기존 0~4 인덱스와 5개 포스터 데이터, 상세 signal 저장 구조는 유지했다.
- 확인: TypeScript 프론트·서버 빌드 및 `scripts/artsCenterPoster.test.ts` 8개 테스트 통과.
- 남은 리스크: 실제 운영 브라우저에서 각 포스터를 순서대로 클릭하는 수동 검증은 별도 필요하며, 현재 코드의 공식 5개 공연 목록에는 ‘럭스’가 없고 제목은 `연극 〈렁스〉`로 등록되어 있다.
