# 정부청사 AI 프로필 분석 장소 추천

- 원 요청: 현재 AI READY 화면 연출은 유지하면서 내 프로필·키워드·최근 활동을 분석하고, OpenAI로 맛집·세종도시·카페 장소 3개를 추천해 달라는 요청.
- 변경 파일: `react-app/src/components/GovernmentAiRecommendationCenter.tsx`
- 변경 내용:
  - 기존 9단계 AI READY 연출 유지.
  - 분석 5단계에서 프로필 관심사, 완성도, 선호 장소, 체험 분석 조각과 최근 활동을 `/api/ai/place-recommendations`로 전송.
  - 후보 장소를 맛집·세종도시·카페 3개로 제한하고 OpenAI 응답의 추천 이유를 결과 화면에 반영.
  - OpenAI 키·인증·네트워크 오류 시 기본 3개 추천으로 안전하게 폴백.
- 확인: React/Vite 빌드 성공, WIZ `main` 프로젝트 빌드 성공. 서버 typecheck 성공. 서버 전체 테스트는 기존 personal farm 관련 3건 실패가 남았고 이번 변경 영역 테스트는 통과.
