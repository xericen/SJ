# 축제·먹거리·공연 관심 저장과 매칭 프로필 통합 개선

- **ID**: 061
- **날짜**: 2026-08-05
- **유형**: 기능 추가 · 버그 수정

## 작업 요약

축제 세부 키워드와 저장한 공연·음식점·축제를 서버 프로필과 사람 간 매칭에 직접 반영했다. 영역별 AI 분석을 별도 조각으로 누적 보존하고, 프로필에서 세 영역의 저장 목록과 분석 결과를 함께 확인하도록 개선했다.

## 원문 요청사항

```text
남은 리스크
프로필에 표시되는 세부 축제 키워드는 매칭 점수에 직접 포함되지 않습니다.
선호 장소 카테고리(카페·음식점 등)는 수집되지만 현재 매칭 계산에서는 사용하지 않습니다.
일부 화면은 보강된 AI 프로필이 아닌 기본 프로필로 점수를 계산해 화면마다 결과가 달라질 수 있습니다.
먹거리·축제 태그도 AI 공연 취향으로 표시되는 잘못된 문구가 있습니다.
먹거리 상세 활동 기록은 서버 저장이 불완전해 다른 기기에서 일부 사라질 수 있습니다.
축제와 먹거리 분석 결과가 각각 유지되지 않고 최신 통합 프로필 하나로 합쳐져 이전 성향이 약해질 가능성이 있습니다. 해결해주고, 내가 어떤 것에 관심있어하는 지도 되게 중요하니까, 프로필에 예술의 전당에서 공연 저장한거, 먹거리부스에서 음식점 저장한 거, 축제 저장한 거 다 볼 수 있게 프로필ㅇ에 추가해줘.
```

## 변경 파일 목록

- `react-app/server/src/routes/account.ts`: 영역별 세션 누적, 저장 관심사 서버 저장·이관 API, 프로필 조각 복원 추가
- `react-app/server/src/services/experience/experienceHarness.ts`: 먹거리 상세 활동과 공연·먹거리·축제 저장/해제 정규화 추가
- `react-app/server/src/services/experience/experienceProfile.ts`: 공연·먹거리·축제별 독립 분석 프로필 생성 및 통합 프로필 편향 제거
- `react-app/server/src/services/matching/calculateMatchScore.ts`: 선호 장소 카테고리 점수·공통 항목·이유 반영
- `react-app/server/src/socket/registerSocketHandlers.ts`: 보강 매칭 프로필 전송 한도를 20개로 확대
- `react-app/src/services/experienceHarness.ts`: 저장 항목 로컬 즉시 반영, 서버 복원, 기존 저장 데이터 1회 이관 추가
- `react-app/src/services/experienceRecommendationProfile.ts`: 세부 축제 키워드, 영역별 분석, 저장 항목을 매칭 데이터로 변환
- `react-app/src/services/aiSejongProfile.ts`: 영역별 분석과 세부 관심사를 프로필 관심사에 통합
- `react-app/src/components/MatchScoreBadge.tsx`: 기본 프로필 대신 보강된 매칭 프로필 사용
- `react-app/src/components/AiSejongProfile.tsx`, `AiSejongProfile.css`: 영역별 분석 카드와 저장한 관심사 3개 영역 UI 추가
- `react-app/server/src/services/experience/*.test.ts`, `react-app/server/src/services/matching/calculateMatchScore.test.ts`: 저장·분석·매칭 회귀 테스트 추가
- `src/assets/jochwon-app/`: 최신 React 프로덕션 번들 동기화
- `devlog.md`, `devlog/2026-08-05/061-integrate-saved-interests-and-matching.md`: 작업 이력 기록

## 검증 결과

- 서버 테스트 49개 통과 및 서버 TypeScript 타입 검사 통과.
- 예술의전당·먹거리 관련 클라이언트 테스트 9개 통과 및 클라이언트 TypeScript 타입 검사 통과.
- `npm run build`로 React/Vite, 성능 예산, Express TypeScript 전체 빌드 통과.
- `react-app/dist/`와 `src/assets/jochwon-app/` 파일 목록 및 `index.html` 일치 확인.
- WIZ 프로젝트 일반 빌드(`clean=false`) 통과.
- `git diff --check` 통과.

## 남은 리스크

- 기존 브라우저 저장 항목은 최초 로그인 시 한 번 서버로 이관되며, 자동화 테스트에서는 실제 다중 기기 브라우저 로그인 왕복까지 수행하지 않았다.
- 실제 사용자 간 점수는 두 사용자가 공개한 체험 기록과 저장 관심사의 교집합에 따라 달라지므로 운영 계정 2개를 이용한 화면 단위 최종 확인이 필요하다.
