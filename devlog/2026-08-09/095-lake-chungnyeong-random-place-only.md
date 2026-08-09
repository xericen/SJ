# 호수공원 충녕이 랜덤 장소 추천 전용화

## 사용자 요청

세종호수공원 충녕이가 처음 열릴 때 오늘 갈 장소를 추천하는 NPC라고 소개하고, 장소 추천 버튼을 누르면 실제 카카오맵 API와 OpenAI를 이용해 세종 장소 하나를 무작위 추천하며 일반 대화는 할 수 없게 한다.

## 변경 파일

- `react-app/src/pages/GamePage.tsx`
- `react-app/server/src/routes/realPlaceRecommendations.ts`
- `react-app/scripts/reviewOpsRegression.test.ts`
- `src/app/page.home/api.py`
- `devlog.md`
- `devlog/2026-08-09/095-lake-chungnyeong-random-place-only.md`

## 변경 내용

- 충녕이 창 최초 메시지를 장소 추천 NPC 소개로 변경했다.
- 자동 추천을 제거하고 사용자가 `장소 추천` 버튼을 누를 때만 추천한다.
- 일반 대화 입력창과 전송 동작을 제거했다.
- 운영·개발 경로 모두 카카오 Local API의 세종 후보를 무작위 추첨한 뒤 OpenAI가 추천 문구를 작성하도록 강제했다.
- 운영의 카카오 검색 단독 우회 경로를 제거했다.
- WIZ가 예약어로 소비하는 `action` 쿼리 대신 `operation`을 사용해 운영 추천 분기가 실제 호출되도록 수정했다.

## 검증

ReviewOps 회귀 테스트, Python 문법 검사, React 프로덕션 빌드·성능 검사 및 WIZ 빌드 결과를 확인했다.
