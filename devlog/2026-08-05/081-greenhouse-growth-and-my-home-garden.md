# 수목원 기억나무 성장형 탐험 및 마이홈 정원 연계 개편

- **ID**: 081
- **날짜**: 2026-08-05
- **유형**: UX 개선
- **리뷰 ID**: zkpqgchpglxeefnlcfpozcwrlcsdmhkv

## 작업 요약

식물마다 AI 질문에 답하던 수목원 흐름을 발견 즉시 도감에 저장하는 탐험형 구조로 개편했다. 기억나무는 5종 새싹, 10종 성장, 14종 완성 단계로 자라며 충녕 AI는 세 성장 시점에서만 탐험 데이터를 분석한다.
14종 식물의 꽃말·특징·서식 정보를 제공하고, 반복 발견 횟수와 관찰 시간을 누적해 마이홈 정원 풍성도와 프로필·정부청사 AI 추천에 활용하도록 연결했다.

## 원문 요청사항

```text
수목원 안에 내용을 🌿 탐험
수목원을 탐험하며 다양한 식물을 발견합니다.
식물을 발견할 때마다 식물 도감이 채워집니다.
식물 발견 수에 따라 기억나무가 성장합니다.
🌱 5종 발견 → 새싹 단계 해금
🌿 10종 발견 → 성장 단계 해금
🌳 14종 발견 → 기억나무 완성
발견한 식물의 특징, 꽃말, 서식 정보를 확인할 수 있습니다.

이렇게만 해도 "성장"이라는 목표가 생깁니다.

🤖 AI 식물 큐레이터

여기서 AI는 질문을 계속하는 것이 아니라,

기억나무가 성장할 때만 등장합니다.

예를 들면

🌱 5종 발견

충녕 AI

"지금까지의 탐험을 분석해 보니 평온함을 상징하는 식물을 많이 발견했어요."

↓

프로필 업데이트

자연 성향
■■■□□□□□
🌿 10종 발견

"최근에는 꽃말보다 색감이 다양한 식물을 오래 살펴보셨네요."

↓

프로필

자연
★★★★★

탐험
★★★☆☆
🌳 14종 발견

"수목원 활동을 분석한 결과,

당신은 자연 속에서 휴식과 감성을 중요하게 생각하는 성향입니다."

↓

대표 꽃 선정

↓

정부청사 AI 추천에 사용

이러면 AI가 매번 질문하는 게 아니라 분석하는 역할을 합니다.

AX 느낌이 훨씬 납니다.

🏡 마이홈

여기도 조금 아쉽습니다.

"식물이 추가됩니다."

보다

마이홈 정원
새롭게 발견한 식물은 마이홈 정원에 자동으로 심어집니다.
동일한 식물을 반복해서 발견하면 꽃이 더욱 풍성하게 성장합니다.
발견한 식물 수에 따라 정원이 점차 확장되며, 사용자의 탐험 기록이 시각적으로 누적됩니다.
정원은 사용자의 자연 취향과 대표 식물을 보여주는 개인 공간으로 활용됩니다.
기억나무도 조금 더 구체적으로
🌳 기억나무
식물을 발견할수록 기억나무가 성장합니다.
성장 단계마다 충녕 AI가 지금까지의 탐험 데이터를 분석하여 자연 취향을 요약합니다.
분석 결과는 대표 식물, 선호 꽃말, 자연·힐링 성향으로 프로필에 저장됩니다.
완성된 기억나무는 정부청사 AI 맞춤 코스 추천의 핵심 데이터로 활용됩니다. 이런삭으로 바꿔줘
```

## 변경 파일 목록

- `react-app/src/components/GreenhouseExperience.tsx`, `GreenhouseExperience.css`
  - 발견 즉시 저장, 반복 발견, 5·10·14종 성장 안내, 단계별 충녕 AI 분석, 꽃말·마이홈·정부청사 연계 UI를 구현했다.
- `react-app/src/services/greenhouseProgress.ts`, `greenhouseAi.ts`, `shared/greenhouse-analysis.ts`
  - 분석 단계를 5·10·14종으로 변경하고 발견 횟수·관찰 시간·자동 탐험 신호를 저장하며 기존 3·7종 데이터를 호환 처리했다.
- `react-app/server/src/services/ai/greenhouseExperience.ts`
  - AI 분석 요청 스키마와 단계별 이전 분석 확장 로직을 5·10·14종에 맞췄다.
- `react-app/src/data/greenhouse-plants.ts`
  - 14종 전체에 꽃말 또는 상징 의미를 추가했다.
- `react-app/src/components/PersonalFarmProgressExperience.tsx`
  - 마이홈 정원에 발견 식물 수, 반복 발견 기반 풍성도, 정원 성장 단계를 표시했다.
- `react-app/src/components/ChungnyeongNotebook.tsx`, `NatureDiscoveryGuide.tsx`, `react-app/src/pages/LandingPage.tsx`
  - 자연 탐험 안내와 서비스 소개 문구를 새 성장 구조로 통일했다.
- `react-app/src/services/aiSejongProfile.ts`, `experienceRecommendationProfile.ts`, `profileProgress.ts`
  - 자연 성향 프로필과 대표 식물, 정부청사 추천 데이터 반영 시점을 성장 단계와 맞췄다.
- `react-app/src/game/renderers/VillageMapRenderer.ts`
  - 기억나무 3D 성장 시각 단계를 5·10·14종 기준으로 변경했다.
- `react-app/scripts/testGreenhouse.ts`, `testGreenhouseAi.ts`
  - 질문 없는 발견 흐름, 반복 발견, 꽃말, 5·10·14종 분석 회귀 검증을 갱신했다.
- `react-app/src/runtimeBuild.ts`, `src/app/page.home/view.pug`, `src/assets/jochwon-app/`
  - 런타임 ID를 `20260805-greenhouse-growth-v94`로 갱신하고 새 프로덕션 번들을 배포했다.

## 확인 결과

- `npm run test:greenhouse` 성공
- `npm run test:greenhouse-ai` 성공
- `npm run build` 성공: 클라이언트 TypeScript, Vite 번들, 성능 예산, 서버 TypeScript 통과
- 성능 예산 통과: 초기 엔트리 286 KiB, 최대 JS gzip 310 KiB, 최대 3D 자산 21.64 MiB
- `npm run test:runtime-entry` 2개 통과
- React `dist`와 WIZ `src/assets/jochwon-app` 전체 파일 일치 확인
- WIZ 일반 빌드(`clean: false`) 성공
- 운영 `/home`, iframe 엔트리, 런타임 번들 HTTP 200 확인
- `git diff --check` 통과

## 남은 리스크

- browser-capture-denied 환경이라 1440×900 실제 브라우저 화면의 모달 높이·텍스트 줄바꿈은 수동 시각 검증하지 못했다.
- 마이홈 정원 풍성도는 발견 기록 기반 HUD에 누적되며, 14종 각각의 개별 3D 식재 모델 증식까지는 이번 변경 범위에 포함하지 않았다.
