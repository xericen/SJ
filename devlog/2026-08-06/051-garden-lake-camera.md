# 수목원 카메라를 세종호수공원 각도·거리로 통일

- **ID**: 051
- **날짜**: 2026-08-06
- **유형**: UX·3D 카메라
- **리뷰 ID**: `qnsfeqwkrjjnwhwccrlgfajrtruuaaep`

## 작업 요약

수목원 카메라가 실행 시 공통 월드 프로필의 낮은 29도·거리 1300 설정으로 덮어써지던 경로를 제거했다. 수목원을 지형 맞춤 카메라 맵으로 분리하고 세종호수공원과 동일한 직교 투영, 고도각 33도, 거리 1080, 줌 1.35를 적용해 중앙 기억나무 너머의 산책로를 더 높은 시점에서 볼 수 있게 했다. 현재 구현과 달랐던 마이홈 실내 카메라 회귀 테스트 기대값도 기존 변경 이력에 맞는 1400으로 정리했다.

## 원문 요청사항

```text
수목원 카메라 각도를 위로 올려야할 거 같고 , 세종호수 공원처럼 변경해줘 각도나 거리나..
```

## 변경 파일 목록

- `react-app/src/game/renderers/VillageMapRenderer.ts`
  - 수목원 카메라의 투영 방식·각도·거리·줌을 세종호수공원 공용 상수로 연결했다.
- `react-app/src/game/worldNavigationProfile.ts`
  - 수목원을 공통 예술의전당형 카메라 덮어쓰기 대상에서 제외했다.
- `react-app/scripts/bearTreePortals.test.ts`
  - 수목원과 세종호수공원의 카메라 값 일치 회귀 테스트를 추가했다.
- `react-app/scripts/worldNavigationConsistency.test.ts`
  - 수목원 전용 카메라 적용과 최신 마이홈 실내 거리 1400을 검증하도록 갱신했다.
- `react-app/src/runtimeBuild.ts`, `src/app/page.home/view.pug`
  - 런타임 빌드 ID를 `20260806-garden-lake-camera-v146`으로 갱신했다.
- `src/assets/jochwon-app/`
  - 최신 React 프로덕션 산출물 143개를 WIZ 정적 번들에 동기화했다.
- `devlog.md`, `devlog/2026-08-06/051-garden-lake-camera.md`
  - 이번 변경과 검증 결과를 기록했다.

## 확인 결과

- 카메라·월드 이동·수목원 진입·기존 축제 포탈 회귀 테스트 21건 통과
- 런타임 엔트리 테스트 6건 통과
- `npm run build` 성공: 클라이언트 TypeScript, Vite 번들, 성능 예산, 서버 TypeScript 통과
- 성능 예산 통과: 초기 엔트리 246 KiB, 최대 JS gzip 324 KiB, 최대 3D 자산 21.64 MiB
- React `dist`와 WIZ `src/assets/jochwon-app` 143개 파일 일치 확인
- WIZ 일반 빌드(`clean: false`) 성공
- 운영 `/home`, 정적 인덱스, 엔트리 자산 HTTP 200 및 빌드 ID `v146` 반영 확인
- 운영 GamePage 번들에서 수목원 직교 카메라·33도·거리 1080·줌 1.35 반영 확인
- `git diff --check` 통과

## 남은 리스크

- 실제 운영 브라우저에서 1440×900 화면으로 수목원 전 구간의 나무 가림과 체감 거리를 확인하는 수동 3D 이동 검증은 수행하지 않았다.
