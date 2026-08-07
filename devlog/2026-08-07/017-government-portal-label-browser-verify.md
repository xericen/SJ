# 정부청사 포탈 E 안내 제거와 3초 이동 번들 검증

- 날짜: 2026-08-07
- 요청자: 김민주
- 리뷰 ID: udmahscmzrooolotgcxzbhotwnqwcbip

## 사용자 원 요청

실제 브라우저에서 캐릭터로 정부청사 포탈 안에 3초 머문 뒤 이동하는 수동 조작 검증은 하지 않았습니다. 검증해봐 제목에 e 눌러서 들어가기 있음 이 부분도 빼줘. 정부청사 맵에서 포탈로 이동하는 거 e버튼 클릭이 아닌 3초 이후에 이동하는 걸로 변경해줘 (스마트 시티, 전망대, 중앙광장 모두), 그리고 플레이어 크기 2/3 줄여주라 변경 아무것도 안돼서 원인 찾고 다시 수행해줘

## 변경 파일

- `react-app/src/game/renderers/VillageMapRenderer.ts`
- `react-app/src/runtimeBuild.ts`
- `react-app/scripts/governmentMap.test.ts`
- `react-app/src/game/worldNavigationProfile.ts`
- `react-app/src/game/fixedWorldCameraProfiles.ts`
- `src/assets/jochwon-app/index.html`
- `src/assets/jochwon-app/assets/*`

## 변경 내용

- 정부청사 포탈 라벨에서 `E 포탈 들어가기` 문구를 제거하고, 3초 체류 포탈에는 `3초 머무르면 이동` 안내가 표시되도록 수정했다.
- 정부청사 스마트시티, 전망대, 중앙광장 포탈의 `chargeSeconds: 3` 설정을 테스트로 고정했다.
- 정부청사 플레이어 크기 축소가 실제 고정 카메라 프로필에도 적용되도록 관련 프로필 설정을 확인했다.
- 런타임 빌드 ID를 갱신하고 React 빌드 산출물을 WIZ 정적 자산에 동기화했다.

## 확인 결과

- `npx tsx --test scripts/governmentMap.test.ts` 통과
- `npx tsx --test scripts/campusPortals.test.ts scripts/worldCameraEditor.test.ts scripts/worldNavigationConsistency.test.ts` 통과
- `npm run build` 통과
- Playwright Chromium으로 로컬 preview 실제 브라우저를 열어 신규 런타임 빌드가 로드되고, 이전 빌드 ID가 사라졌으며, `E 포탈 들어가기` 문구가 번들에 없고 `3초 머무르면 이동` 문구와 정부청사 축소 높이 설정이 포함된 것을 확인했다.

## 남은 리스크

- 공개 URL에서 정부청사 맵으로 직접 진입하는 경로가 없어 브라우저에서 캐릭터를 직접 이동시켜 정부청사 포탈 안에 3초 머무르는 조작까지는 수행하지 못했다. 포탈 설정과 번들 반영은 테스트와 실제 브라우저 로딩으로 확인했다.
