# 정부청사 포탈·보행 안정화 및 중앙광장 화질·AI 실시간 분석 개선

## 사용자 원본 요청

> 정부청사 전망대 위치를 건물 위가 아닌 포탈 사용 가능한 곳으로 옮기고, 스마트시티는 중앙광장 왼쪽 멀리에 배치해 주세요. 내 프로필의 키워드·관심사 레이더·저장 관심사가 추가될 때마다 AI 종합 분석이 실시간 갱신되게 하고, 중앙광장 화질과 정부청사 보행 안정성도 개선해 주세요.

## 변경 내용

- `react-app/src/game/renderers/VillageMapRenderer.ts`
  - 전망대 포탈을 보행 가능한 동쪽 바닥 `(1900, 1350)`으로 이동했다.
  - 스마트시티 포탈을 중앙광장 왼쪽 원거리 `(260, 1190)`로 이동했다.
  - 정부청사에 정밀 충돌·다중 지면 샘플과 시각 높이 보간을 적용해 발이 지면에서 흔들리는 현상을 줄였다.
  - 중앙광장 렌더 해상도, 안티앨리어싱, 텍스처 우선순위와 프레임률을 상향했다.
- `react-app/shared/world-portals.ts`: 정부청사 기본 포탈 좌표를 동일하게 갱신했다.
- `react-app/src/services/aiSejongProfile.ts`: 최신 키워드·레이더 점수·저장 관심사를 매 갱신 시 다시 조합해 AI 종합 분석에 즉시 반영하도록 변경했다.
- `react-app/scripts/governmentMap.test.ts`, `react-app/scripts/worldNavigationConsistency.test.ts`: 포탈 좌표, 렌더 품질, 지면 안정화, 실시간 분석 회귀 검증을 추가·정비했다.
- `react-app/src/runtimeBuild.ts`, `src/app/page.home/view.pug`, `src/assets/jochwon-app/index.html`, `src/assets/jochwon-app/assets/`: 운영 런타임 식별자와 빌드 산출물을 갱신했다.

## 확인 결과

- GLB 지형 레이캐스트로 기존 전망대 좌표가 건물 상단 높이 약 255에 닿고, 새 좌표는 보행 바닥 높이 약 67에 닿는 것을 확인했다.
- `npx tsx --test scripts/governmentMap.test.ts scripts/worldNavigationConsistency.test.ts`: 13건 통과.
- `npm run build`: TypeScript, Vite, 성능 예산 및 서버 TypeScript 검사 통과.
- WIZ `main` 일반 빌드 성공.

## 남은 리스크

- 중앙광장 화질 상향으로 저사양 기기에서는 GPU 사용량이 이전보다 늘 수 있다.
- 실제 사용자 캐릭터 모델별 발 위치 체감은 운영 브라우저에서 추가 확인이 필요하다.
