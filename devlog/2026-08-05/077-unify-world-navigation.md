# 17개 맵 카메라·캐릭터 이동 기준 통일

- **ID**: 077
- **날짜**: 2026-08-05
- **유형**: UX·3D 탐색 일관성
- **리뷰 ID**: uieobisoicxojmbqqtpwasqphrczmjte

## 원문 요청사항

```text
각 맵마다, 카메라와 캐릭터 사이의 거리가 다르고, 걷는 거 뛰는 거 속도도 다 달라,, 세종예술의 전당에 다 맞추서ㅓ 모든 17개의 맵이 동일성있게 변경해줘.
```

## 변경 내용

- 공간 안내에 노출되는 17개 맵 ID를 단일 목록으로 정의하고 세종예술의전당 기준 탐색 프로필을 만들었다.
- 17개 맵 모두 원근 카메라, 고도 29도, 거리 1300, 시야각 46도, 타깃 높이 75를 사용하도록 통일했다.
- 카메라가 중간에 멈춰 캐릭터와 거리가 벌어지던 맵별 수평 거리·추적 범위·하단 제한을 공통 탐색 중에는 해제했다.
- 캐릭터 표시 높이를 150으로 통일해 같은 카메라 거리에서 맵마다 크기가 달라 보이지 않도록 했다.
- 걷기 180, 달리기 280을 예술의전당 탐색 프로필의 단일 기준값으로 연결했다.
- 마이홈 실내와 키오스크·좌석·망원경 등 상호작용 전용 근접 카메라는 기능상 필요한 기존 구도를 유지했다.
- 런타임 빌드 ID를 `20260805-unified-world-navigation-v91`로 갱신하고 최신 React 산출물을 WIZ 정적 번들에 동기화했다.

## 주요 변경 파일

- `react-app/src/game/worldNavigationProfile.ts`
- `react-app/src/game/GameCanvas.tsx`
- `react-app/src/game/character/characterSettings.ts`
- `react-app/src/game/renderers/VillageMapRenderer.ts`
- `react-app/scripts/worldNavigationConsistency.test.ts`
- `react-app/package.json`
- `react-app/src/runtimeBuild.ts`
- `src/app/page.home/view.pug`
- `src/assets/jochwon-app/index.html`
- `src/assets/jochwon-app/assets/*`

## 확인 결과

- 신규 탐색 일관성 테스트 2개 통과: 17개 맵 중복·누락, 공통 카메라·캐릭터·걷기·달리기 기준 검증
- 기존 카메라 추적 회귀 테스트 2개 통과
- `npm run build` 성공: 클라이언트 TypeScript, Vite 번들, 성능 예산, 서버 TypeScript 통과
- 런타임 엔트리 회귀 테스트 2개 통과
- WIZ 일반 빌드 성공
- 운영 v91 인덱스와 신규 GamePage 번들 HTTP 200 및 공통 탐색 설정 포함 확인
- 운영 `/home` HTTP 200 및 `git diff --check` 통과

## 남은 리스크

- GLB마다 건물과 소품의 원본 축척이 달라 동일한 수치에서도 주변 공간의 상대 크기는 다르게 보일 수 있다.
- 17개 맵을 실제 계정으로 연속 순회하는 수동 시각 검증은 수행하지 않았다.
