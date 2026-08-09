# 1:1 장소 추천 운영 소켓 및 분석 진행 상태

## 사용자 원문 요청

리뷰 `smmmgeiqkxuoqcguvcokxvfbfzirqqtl`에서 1:1 대화의 장소 추천을 누르면 분석 중임을 표시하고, 현재 분석 후 장소 추천이 생성되지 않는 문제를 다시 확인해 수정해 달라고 요청했다.

## 변경 파일

- `react-app/src/components/DirectRecommendation.tsx`
- `react-app/src/direct-recommendation.css`
- `react-app/shared/socket-events.ts`
- `react-app/scripts/reviewOpsRegression.test.ts`
- `src/app/page.home/view.pug`
- `src/assets/jochwon-app/`

## 원인 및 변경 내용

- 운영 화면이 WIZ에 존재하지 않는 HTTP `conversation_place_recommendation` 경로를 호출하고 있었다.
- 운영 요청을 실제 구현된 WIZ `directRecommendationRequest` 소켓 이벤트로 연결했다.
- 클릭 즉시 분석 스피너, 현재 분석/검색 단계와 `분석 중` 상태를 채팅 화면에 표시한다.
- 20초 안에 완료·실패 이벤트가 없으면 지연 오류를 표시해 무한 대기를 방지한다.

## 검증

- ReviewOps 회귀 테스트 4건 통과
- TypeScript 및 WIZ Python 문법 검사 통과
- OpenAI·Kakao가 활성화된 로컬 서버에서 1:1 장소 추천 검증 스크립트 통과
- React/Vite/Express 프로덕션 빌드와 성능 예산 검사 통과
- WIZ 일반 빌드 성공
- 운영 URL에서 신규 `index-dH1k3aDf.js` 응답(HTTP 200) 확인
