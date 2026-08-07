# 정부청사 포탈 3초 이동 확인 및 플레이어 2/3 축소

## 원문 요청사항

> 정부청사 맵에서 포탈로 이동하는 거 e버튼 클릭이 아닌 3초 이후에 이동하는 걸로 변경해줘 (스마트 시티, 전망대, 중앙광장 모두), 그리고 플ㄹ레이어 크기 2/3 줄여주라

## 변경 사항

- `react-app/src/game/renderers/VillageMapRenderer.ts`
  - 정부청사 내 중앙광장, 전망대, 스마트시티 포탈이 모두 `chargeSeconds:3` 충전형 이동으로 설정되어 있음을 확인했다.
- `react-app/src/game/worldNavigationProfile.ts`
  - 정부청사 기본 플레이어 높이를 94에서 63으로 낮춰 기존 대비 약 2/3 비율로 축소했다.
- `react-app/src/game/fixedWorldCameraProfiles.ts`
  - 운영 고정 카메라 프로필의 정부청사 플레이어 높이를 98에서 65로 낮춰 실제 적용 경로도 2/3 비율에 맞췄다.
- `react-app/scripts/governmentMap.test.ts`, `react-app/scripts/worldNavigationConsistency.test.ts`, `react-app/scripts/worldCameraEditor.test.ts`
  - 변경된 정부청사 플레이어 높이 기대값을 갱신했다.
- `react-app/src/runtimeBuild.ts`, `src/assets/jochwon-app/`
  - 런타임 빌드 ID를 `20260807-government-portals-charge-player-scale-v203`으로 갱신하고 React 프로덕션 번들을 WIZ 정적 자산에 동기화했다.

## 확인 결과

- `npx tsx --test scripts/governmentMap.test.ts` 통과
- `npx tsx --test scripts/worldCameraEditor.test.ts scripts/worldNavigationConsistency.test.ts` 통과
- `npm run build` 통과

## 남은 리스크

- 자동 검증은 소스 설정과 빌드 기준이며, 실제 브라우저에서 정부청사 포탈 안에 3초 머문 뒤 이동하는 수동 조작 검증은 수행하지 않았다.
