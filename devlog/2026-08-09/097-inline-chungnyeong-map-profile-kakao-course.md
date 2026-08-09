# 충녕이 내부 카카오지도 및 프로필 기반 실제 세종 AI 코스 연결

- **ID**: 097
- **날짜**: 2026-08-09
- **유형**: 버그 수정

## 작업 요약

충녕이 추천 카드의 카카오지도를 새 창 대신 게임 내부 전체 지도 모달로 표시했다. 중앙광장 프로필 분석 코스에서 정적 더미 장소와 실패 시 우회 경로를 제거하고, 카카오 로그인 사용자의 실제 프로필 분석 결과를 WIZ API로 전달해 카카오 Local의 세종 장소 후보 중 OpenAI가 밥집·카페·세종도시 장소를 한 곳씩 선택하도록 연결했다.

## 원문 요청사항

```text
세종호수공원 충녕이 한테 장소추천 버튼 누르면 나오는건 카카오맵으로 크게 보기 버튼 누르면 새창 열지말고 내부 html로 볼 수 있게 수정해줘, 중앙광장 맵에서 프로필 분석 AI 하면 step9으로 프로필 분석하는거는 되는데 장소가 아직 더미데이터로 들어있는거 같아서 카카오로그인 사용자는 프로필 분석해서 나온결과로 AI 코스 추천 되게 해줘
```

## 원인

- 충녕이의 크게 보기 동작이 `target="_blank"` 외부 링크로 고정되어 있었다.
- 중앙광장 추천 상태가 정적 `fallbackRouteStops`로 초기화되어 API 실패 시에도 더미 장소가 STEP 9에 노출되었다.
- 기존 추천 요청은 카카오 로그인 여부를 검사하지 않았고, 실제 프로필 분석 전체와 카카오 Local 후보를 묶어 검증하는 서버 경로가 없었다.
- 운영 검증 중 OpenAI의 추론 토큰이 기존 완료 토큰 한도를 소진해 결과 JSON을 만들지 못하는 문제도 확인되어 완료 토큰과 추론 강도를 조정했다.

## 변경 파일 목록

- `react-app/src/pages/GamePage.tsx`: 충녕이 내부 지도 모달과 카카오 로그인 상태 전달
- `react-app/src/pages/GamePage.css`: 내부 전체 지도 버튼·모달 스타일
- `react-app/src/components/GovernmentAiRecommendationCenter.tsx`: 더미 코스 제거, 로그인 제한, 프로필 분석 기반 실제 장소 요청 및 실패·재시도 처리
- `react-app/src/components/GovernmentAiRecommendationCenter.css`: 실제 장소 생성 상태·오류 UI 스타일
- `src/app/page.home/api.py`: 로그인 검증, 카카오 Local 실제 세종 후보 검색, OpenAI 구조화 코스 선택 API
- `react-app/scripts/reviewOpsRegression.test.ts`: 내부 지도와 실제 장소 전용 코스 회귀 검사
- `react-app/src/runtimeBuild.ts`, `src/app/page.home/view.pug`: 운영 iframe 캐시 버전 갱신
- `src/assets/jochwon-app/`: 새 React 프로덕션 번들 반영
- `devlog.md`, `devlog/2026-08-09/097-inline-chungnyeong-map-profile-kakao-course.md`: 작업 이력 기록

## 검증 결과

- ReviewOps 회귀 테스트 6건 통과
- TypeScript 검사, Python 문법 검사, React·Express 프로덕션 빌드, 성능 검사, WIZ 일반 빌드, `git diff --check` 통과
- 운영 인증 요청에서 프로필 분석을 기반으로 카카오 실제 세종 장소 3곳(밥집·카페·세종도시)과 OpenAI 추천 이유 반환 확인
- 운영 GamePage 번들에서 충녕이 내부 지도 모달, 프로필 코스 API 경로 및 외부 새 창 링크 제거 확인
- 기존 SUIT 폰트의 빌드 시 런타임 경로 경고는 남아 있으며 이번 변경과 무관함
