# AI 추천 일정 실제 장소·카카오지도 연결

- 원 요청: 9단계 OpenAI 분석 마지막 일정에 실제 세종의 밥집, 카페, 세종도시 장소를 각 1곳씩 추천하고 카카오지도에서 볼 수 있게 수정.
- 변경 파일: `react-app/src/components/GovernmentAiRecommendationCenter.tsx`, `.css`, `react-app/server/src/services/ai/prompts/sejongPlaceRecommendationPrompt.ts`, `react-app/src/runtimeBuild.ts`, 운영 정적 자산, `devlog.md`, 본 상세 기록.
- 변경 내용: 검증된 세종 식당·카페 데이터와 실제 도시 장소 후보만 OpenAI에 전달하고, 세 범주에서 정확히 한 곳씩 최종 표시한다. 결과 카드와 추천 사유에 카카오지도 검색 링크를 연결했다.
- 확인: React TypeScript/Vite/서버 빌드 및 성능 예산 검증 성공, WIZ `main` 빌드 성공, 운영 신규 번들 HTTP 200 확인.
- 남은 리스크: 영업시간·휴무는 변경될 수 있어 방문 전 카카오지도 최신 정보를 확인해야 한다. OpenAI 장애 시에도 실제 장소 3곳의 폴백이 표시된다.
