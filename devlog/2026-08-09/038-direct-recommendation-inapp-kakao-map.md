# 1:1 대화 분석 추천 UI 및 내부 카카오 지도

## 사용자 원문 요청

리뷰 `smmmgeiqkxuoqcguvcokxvfbfzirqqtl`에서 “대화 보고 장소 추천”의 최근 대화 분석 확인 화면을 다시 디자인하고, `분석하고 추천받기` 실행 시 실제 장소 추천이 생성되도록 확인하며, `지도보기`를 누르면 웹 내부 HTML에서 카카오 지도로 장소 위치를 볼 수 있도록 요청했다.

## 변경 파일

- `react-app/src/components/DirectRecommendation.tsx`
- `react-app/src/direct-recommendation.css`
- `react-app/scripts/reviewOpsRegression.test.ts`
- `src/app/page.home/view.pug`
- `src/assets/jochwon-app/`

## 변경 내용

- 분석 동의 화면을 대화·취향 분석·카카오 실제 장소 검색의 3단계가 보이는 카드 UI로 재설계했다.
- 추가 조건 입력, 익명화 안내, 글자 수와 명확한 추천 실행 버튼을 제공한다.
- 추천 결과의 `지도보기`가 웹 내부 모달과 iframe에서 카카오 지도 위치를 표시하도록 변경했다.
- 외부 카카오맵 전체 화면 링크는 내부 지도 하단의 보조 동작으로 제공한다.

## 검증

- ReviewOps 회귀 테스트 3건 통과
- TypeScript 프로젝트 검사 통과
- 로컬 서버 기동 후 실제 1:1 장소 추천 검증 스크립트 통과
- React/Vite/Express 프로덕션 빌드와 성능 예산 검사 통과
- WIZ 일반 빌드 성공
- 운영 URL에서 신규 `index-CDpr1VxE.js` 응답(HTTP 200) 확인
- 카카오 지도 HTML 응답에 iframe 차단 헤더가 없음을 확인
