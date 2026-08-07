# 020. 축제부스 현재 위치 아래 스탬프 패널 추가 및 충녕이 제거 확인

## 사용자 요청

축제부스맵 좌측 현재 위치 패널 아래에 스탬프 3개 완료 패널을 추가하고, 맵에서 충녕이를 없애달라는 요청.

## 변경 파일

- `react-app/src/components/LakeParkExperiences.tsx`
- `react-app/src/components/LakeParkExperiences.css`
- `react-app/src/pages/GamePage.css`
- `react-app/src/data/festivalNpc.ts`
- `react-app/scripts/festivalExperience.test.ts`
- `react-app/src/game/fixedWorldCameraProfiles.ts`
- `react-app/src/game/renderers/VillageMapRenderer.ts`
- `react-app/src/runtimeBuild.ts`
- `src/app/page.home/view.pug`
- `src/assets/jochwon-app/`

## 변경 내용

- 축제부스 좌측 HUD를 `현재 위치 → 축제 스탬프 미션 → 현재 활동 중` 순서로 이어지게 배치했다.
- 스탬프 패널의 실제 하단 위치를 CSS 변수로 측정해 현재 활동 패널이 바로 아래에서 시작하도록 유지했다.
- 축제부스 NPC 목록에서 충녕이를 제거하고, 준호/현우만 남겼다.
- 축제부스 플레이어와 NPC 크기, 세종호수공원 귀환 포탈 시각 스타일, 렌더링 선명도 보정이 운영 정적 자산에 포함되도록 번들을 갱신했다.
- 남아 있던 예전 HUD 겹침 기대 테스트를 제거해 현재 요구 순서만 검증하도록 정리했다.

## 확인

- `npm run test:festival-experience`
- `npm run test:festival-portal`
- `npm run build`
- WIZ `main` 프로젝트 빌드
- 소스/빌드/번들에서 축제부스 스탬프 HUD 연결, 충녕이 제거, v204 운영 빌드 ID 반영 확인
