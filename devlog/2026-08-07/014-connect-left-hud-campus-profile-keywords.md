# 모든 맵 좌측 HUD 연결 및 공동캠퍼스 프로필 키워드 반영 보강

- **날짜**: 2026-08-07
- **리뷰 ID**: ubhnpywyyudignpzxnhbzznfezhtzgax
- **유형**: UX · 프로필/매칭 데이터

## 사용자 원 요청

현재 위치와 지금 함께하는 사람 패널이 떨어져 있으니 모든 맵에서 붙여 달라는 재요청. 공동캠퍼스, 학생회관, 모집센터, 프로젝트실, 동아리 거리제 진입 활동이 통합 프로필 신호로 저장되는 구조가 실제 프로필 키워드와 나의 프로필을 채우는 하네스 구조로 잘 되어 있는지 확인.

## 변경 내용

- `react-app/src/pages/GamePage.css`
  - 모든 월드에서 `.world-location-chip`과 `.online`을 같은 좌측 스택으로 강제 정렬하는 최종 공통 규칙을 추가했다.
  - 베어트리파크·수목원·축제부스처럼 별도 top 계산을 쓰던 맵도 현재 위치 바로 아래에 현재 활동 중 패널이 붙도록 보정했다.
- `react-app/src/services/experienceRecommendationProfile.ts`
  - `student-hall`, `recruitment-center`, `project-room`, `club-street-festival`을 맵 경험 기록 대상으로 추가했다.
  - `campusSignalKeywords`를 추천/매칭 프로필의 관심사 추론 입력에 포함해 캠퍼스 활동 키워드가 `interests`에도 반영되도록 했다.
- `react-app/scripts/socialProfileActions.test.ts`, `react-app/scripts/festivalExperience.test.ts`
  - 현재 활동 중 패널 펼침 유지와 좌측 HUD 연결 규칙을 검증하도록 갱신했다.
- `react-app/src/runtimeBuild.ts`, `src/app/page.home/view.pug`, `src/assets/jochwon-app/`
  - 런타임 빌드 ID를 `20260807-connected-left-hud-campus-profile-v202`로 갱신하고 빌드 산출물을 WIZ 정적 자산에 반영했다.

## 확인한 내용

- 프로필 반영 구조 확인:
  - `recordCampusProfileSignal`은 로컬 프로필 진행도, 키워드, 레이더 점수에 반영된다.
  - 인증 사용자는 `/api/account/me/unified-profile/campus-signal`을 통해 `UserModel.clubs.campusProfileSignals`에 저장된다.
  - 서버 통합 프로필 빌더는 `campusProfileSignals.keywords`를 `clubs.categories`와 완성도 근거에 반영한다.
  - 이번 보강으로 추천/매칭용 `PublicMatchProfile.interests`에도 캠퍼스 키워드가 들어간다.
- `npm exec -- tsx --test scripts/socialProfileActions.test.ts` 통과: 8개
- `npm run test:festival-experience` 통과: 6개
- `npm run build` 통과

## 남은 리스크

- 실제 운영 브라우저 스크린샷으로 모든 맵의 좌측 HUD 붙음 상태를 전수 확인하지는 못했다.
- 캠퍼스 활동은 공연/먹거리/축제 AI 분석 하네스와 같은 `experienceHarness.generatedProfile` 생성 경로가 아니라, 캠퍼스 전용 프로필 신호와 추천 프로필 경로로 반영된다.
