# 축제부스 입장 설명 및 AI 여행 홈 이동 확인

## 사용자 요청

> 로그인·체험용 모두 축제부스 입장 시 먹거리부스처럼 설명문을 표시하고, 중앙광장 STEP 9의 세종 여행 시작 버튼은 홈으로 나가기 전 계속 이동할지 확인하는 두 버튼 경고문을 표시해 주세요.

## 변경 내용

- 축제·먹거리 입장 안내 조건을 화면 표시명 대신 `currentMapId`로 판단해 로그인과 체험 모드에서 동일하게 표시합니다.
- STEP 9의 여행 시작 버튼은 즉시 홈으로 이동하지 않고 확인창을 먼저 엽니다.
- `중앙광장에 머무르기`는 확인창만 닫고 분석 결과를 유지하며, `그래도 홈으로 이동`은 일정을 저장한 뒤 홈으로 이동합니다.
- 확인창이 열려 있는 동안 E 키로 의도치 않게 다음 동작이 실행되지 않도록 입력을 차단하고 Escape는 머무르기로 처리합니다.

## 변경 파일

- `react-app/src/pages/GamePage.tsx`
- `react-app/src/components/GovernmentAiRecommendationCenter.tsx`
- `react-app/src/components/GovernmentAiRecommendationCenter.css`
- `react-app/scripts/festivalIntroAndAiExit.test.ts`
- 운영 빌드 산출물
- `devlog.md`
- `devlog/2026-08-09/018-festival-intro-ai-exit-confirm.md`

## 확인 결과

- 축제·먹거리 canonical map id 입장 안내 회귀 테스트 통과
- STEP 9 두 버튼 확인창 및 이동 분기 회귀 테스트 통과
