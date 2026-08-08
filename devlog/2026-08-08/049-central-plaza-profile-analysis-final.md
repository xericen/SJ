# 중앙광장 프로필 분석·장소 추천 최종 반영

- 원 요청: 중앙광장을 밝게 하고 `Marker_SaveCourse`를 정부청사 귀환 포탈 위치로 사용하며, 기존 분석 연출에 실제 프로필·최근 활동을 녹이고 OpenAI로 맛집·세종도시·카페 3개 지역을 추천해 달라는 요청.
- 변경 파일: `react-app/src/game/renderers/VillageMapRenderer.ts`, `react-app/src/components/GovernmentAiRecommendationCenter.tsx`
- 변경 내용:
  - 중앙광장 노출·톤매핑·조명 값을 밝게 조정하고 30fps/간소화 충돌 설정을 유지.
  - `Marker_SaveCourse` 월드 좌표를 읽어 정부청사 귀환 포탈 좌표로 적용.
  - 분석 로그를 축제 데이터·관심사·방문지역·프로젝트 활동·성장 예측·최적 일정 생성 흐름으로 정리.
  - 프로필 완성도, 관심 키워드, 최근 활동 신호를 결과 카드에 표시.
  - `/api/ai/place-recommendations`에 프로필과 활동 데이터를 보내 OpenAI 추천 결과를 반영하며, 맛집·세종도시·카페 3개 후보로 제한.
- 확인: React/Vite 빌드 성공, 성능 예산 확인 성공, WIZ `main` 빌드 성공, 운영 인덱스와 청크에서 OpenAI 추천 API 및 3개 추천 문구 확인.
- 남은 리스크: 운영 OpenAI 키/로그인 세션이 없으면 기본 추천 폴백이 동작함. 서버 전체 테스트의 기존 개인 농장 관련 3건 실패는 이번 변경과 무관.
