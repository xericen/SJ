# 체험용 포탈 편집 및 실제 세종 장소 추천

## 사용자 요청

- 체험용 세종호수공원 포탈 5개 위치를 다시 변경할 수 있게 한다.
- T 대화 메뉴를 캐릭터 옆에 연결선과 함께 표시한다.
- 로그인 사용자 1:1 채팅의 `같이 코스 만들기`를 제거한다.
- 최근 대화는 익명화하고, 카카오에서 확인된 세종특별자치시 실제 장소만 OpenAI가 후보 중 선택하게 한다.
- 충녕이는 카카오 실제 장소를 무작위 추천하고 AI 실패 시에도 기본 문장으로 동작하게 한다.

## 변경 파일

- `react-app/src/pages/GamePage.tsx`
- `react-app/src/pages/GamePage.css`
- `react-app/src/components/DirectRecommendation.tsx`
- `react-app/server/src/routes/realPlaceRecommendations.ts`
- `react-app/server/src/providers/ai/openAIConversationAnalysisProvider.ts`
- `react-app/server/src/index.ts`
- `react-app/src/runtimeBuild.ts`
- `src/app/page.home/view.pug`
- `src/app/page.home/api.py`

## 확인 결과

- React/Vite 및 Node TypeScript 빌드 성공
- 성능 예산 검사 통과
- 서버 테스트 70건 중 67건 통과, 기존 개인 농장 DB 상태 의존 테스트 3건 실패
- 실제 장소 API는 카카오 서버 키를 사용하고 `세종특별자치시` 주소만 허용하도록 확인
- 운영 충녕이 추천 API에서 카카오 실제 장소와 OpenAI 문장 응답 확인
