# 085 · 수목원 채집·프로필·카메라 수정

## 원본 요청

> 깃 처럼 채집하기 이렇게 넣어놓고 클릭으로도 채집 가능하게 하고 전부다 채집하면 가운데 나무 빛나게 해놓고 5가지 제일 많이 보거나 근처에 맴돌거나 정보를 많이본거 가중치 점수 매겨서 제일 많이 점수 나온거 5가지로 프로필 꾸미게 해놨는데 지금 안되어있고 수목원에서 카메라랑 캐릭터 거리가 너무 가까운데 이거 좀 멀어지게 하려고 했는데 시야 범위만 줄어들고 바뀌는게 잘 안되네 이거 수정 한번 부탁ㅇ해

## 변경 내용

- 식물 3D 클릭·E 상호작용은 정보 화면을 열고, 화면의 `채집하기` / `다시 채집하기` 버튼으로 명시적으로 채집하도록 변경했다.
- 식물별 정보 열람 횟수·열람 시간·근처 체류 횟수·체류 시간·재방문을 기록하고, 가중치(3 / 0.5 / 1 / 0.2 / 2)로 관심 점수를 계산해 TOP 5를 완주 화면과 내 프로필에 노출했다.
- 상위 5개 식물을 AI 프로필 관심사·체험 추천 기록에도 연결했다.
- 14종 완전 채집 시 중앙 기억나무 메시 자체에 emissive 발광을 적용하고 기존 파티클·링·조명 효과와 함께 빛나게 했다.
- 직교 카메라인 수목원은 거리만 바꾸지 않고 zoom을 1.15에서 0.9로 낮춰 캐릭터와 맵이 실제로 더 멀리 보이게 했다.

## 변경 파일

- `react-app/src/components/GreenhouseExperience.tsx`
- `react-app/src/components/GreenhouseExperience.css`
- `react-app/src/components/AiSejongProfile.tsx`
- `react-app/src/components/AiSejongProfile.css`
- `react-app/src/services/greenhouseProgress.ts`
- `react-app/src/services/aiSejongProfile.ts`
- `react-app/src/services/experienceRecommendationProfile.ts`
- `react-app/src/game/renderers/VillageMapRenderer.ts`
- `react-app/src/game/worldNavigationProfile.ts`
- `react-app/scripts/testGreenhouse.ts`
- `react-app/scripts/worldNavigationConsistency.test.ts`
- `react-app/scripts/worldUxLayout.test.ts`
- `react-app/src/runtimeBuild.ts`
- `src/app/page.home/view.pug`
- `src/assets/jochwon-app/**`

## 확인 결과

- `npm run test:greenhouse`: 통과
- `npm run test:world-navigation`: 6/6 통과
- `npm run test:world-ux-layout`: 5/5 통과
- `npm run build`: TypeScript, Vite, 성능 예산, 서버 TypeScript 모두 통과
- WIZ `main` 프로젝트 빌드: 통과
- 운영 자산에서 `20260806-greenhouse-profile-camera-v181`, `내 관심 식물 TOP 5`, `채집하기` 문구 확인

## 남은 리스크

- 식물 관심 시간과 TOP 5는 브라우저 사용자별 로컬 진행 데이터에 기록되므로, 다른 기기·브라우저로 이동하면 같은 집계가 자동 동기화되지 않는다.
- 실제 식물 모델과 사용자 동선에서의 최종 카메라 체감은 운영 브라우저 수동 확인이 필요하다.
