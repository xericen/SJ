# 마이홈 야외·실내 카메라 거리 40% 확대

- **ID**: 083
- **날짜**: 2026-08-05
- **유형**: UX·3D 카메라
- **리뷰 ID**: uieobisoicxojmbqqtpwasqphrczmjte

## 원문 요청사항

```text
마미홈 카메라 캐릭터랑 가까운 거 2/5정도만 더 멀게 해줘
```

## 변경 내용

- 요청의 `2/5 더 멀게`를 기존 거리 대비 40% 증가로 적용했다.
- 마이홈 야외 카메라 거리를 1300에서 1820으로 조정했다.
- 마이홈 실내 카메라 거리를 800에서 1120으로 조정했다.
- 호수공원 기존 지형 맞춤 카메라와 나머지 15개 맵의 카메라, 전체 이동 속도는 변경하지 않았다.
- 런타임 빌드 ID를 `20260805-my-home-camera-distance-v96`으로 갱신하고 최신 React 산출물을 WIZ 정적 번들에 동기화했다.

## 주요 변경 파일

- `react-app/src/game/worldNavigationProfile.ts`
- `react-app/src/game/GameCanvas.tsx`
- `react-app/src/game/renderers/VillageMapRenderer.ts`
- `react-app/scripts/worldNavigationConsistency.test.ts`
- `react-app/src/runtimeBuild.ts`
- `src/app/page.home/view.pug`
- `src/assets/jochwon-app/index.html`
- `src/assets/jochwon-app/assets/*`

## 확인 결과

- 탐색 일관성 테스트 3개 통과: 마이홈 야외 1820·실내 1120과 40% 증가율 검증
- 기존 카메라 회귀 테스트 2개 통과
- `npm run build` 성공: 클라이언트 TypeScript, Vite 번들, 성능 예산, 서버 TypeScript 통과
- 런타임 엔트리 테스트 2개 및 WIZ 일반 빌드 통과
- 운영 v96 인덱스와 신규 GamePage 번들 HTTP 200, 운영 `/home` HTTP 200 확인
- `git diff --check` 통과

## 남은 리스크

- 마이홈 실내에서는 벽과 가구 때문에 넓어진 카메라 구도에서 시야 가림이 더 자주 발생할 수 있다.
- 이미 이전 버전 화면을 열어 둔 사용자는 새로고침해야 새 거리를 확인할 수 있다.
