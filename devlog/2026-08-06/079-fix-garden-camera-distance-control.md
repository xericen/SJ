# 수목원 직교 카메라 거리 조절 동작 복구

- **ID**: 079
- **날짜**: 2026-08-06
- **유형**: UX·3D 카메라 편집
- **리뷰 ID**: `qnsfeqwkrjjnwhwccrlgfajrtruuaaep`

## 작업 요약

수목원의 직교 카메라에서는 운영자 편집기의 `캐릭터·카메라 거리` 값이 카메라 위치만 바꾸고 화면 확대율에는 영향을 주지 않아 조절 결과를 볼 수 없었다. 직교 카메라의 편집 거리값을 기본 거리 대비 줌 비율로 환산해, 값을 늘리면 캐릭터와 맵이 멀어지고 값을 줄이면 가까워지도록 수정했다. 기존 세종호수공원형 각도와 수목원 전용 카메라 프로필은 유지했다.

## 원문 요청사항

```text
수목원에서 캐릭터랑 맵 거리 조절이 안됨 이 부분 수정해줘
```

## 변경 파일 목록

- `react-app/src/game/cameraFollow.ts`
  - 직교 카메라 거리값을 화면 줌으로 환산하는 순수 함수를 추가했다.
- `react-app/src/game/renderers/VillageMapRenderer.ts`
  - 수목원 등 직교 카메라의 실시간 프로필 거리값을 렌더링 줌에 적용했다.
- `react-app/scripts/cameraFollow.test.ts`
  - 거리 증가·감소에 따른 줌 축소·확대 회귀 테스트를 추가했다.
- `react-app/scripts/worldCameraEditor.test.ts`
  - 카메라 편집값이 직교 렌더링 분기에 연결되는지 검증했다.
- `react-app/src/runtimeBuild.ts`, `src/app/page.home/view.pug`
  - 런타임 빌드 ID를 `20260806-garden-camera-distance-v175`로 갱신했다.
- `src/assets/jochwon-app/`
  - 최신 React 프로덕션 산출물 144개를 WIZ 정적 번들에 동기화했다.
- `devlog.md`, `devlog/2026-08-06/079-fix-garden-camera-distance-control.md`
  - 이번 변경과 검증 결과를 기록했다.

## 확인 결과

- 카메라 거리·편집기·수목원 진입 회귀 테스트 20건 통과
- 런타임 엔트리 테스트 6건 통과
- `npm run build` 성공: 클라이언트 TypeScript, Vite 번들, 성능 예산, 서버 TypeScript 통과
- 성능 예산 통과: 초기 엔트리 246 KiB, 최대 JS gzip 324 KiB, 최대 3D 자산 21.64 MiB
- React `dist`와 WIZ `src/assets/jochwon-app` 144개 파일 일치 확인
- WIZ 일반 빌드(`clean: false`) 성공
- 운영 `/home`, 정적 인덱스, 엔트리 자산 HTTP 200 및 빌드 ID `v175` 반영 확인
- 운영 GamePage 자산과 로컬 프로덕션 번들의 SHA-256 해시 일치 확인
- `git diff --check` 통과

## 남은 리스크

- 실제 운영 브라우저의 편집 권한 계정으로 거리 슬라이더를 직접 왕복 조작하는 수동 검증은 수행하지 않았다.
- 허용 범위의 양 끝값에서는 화면이 크게 확대·축소되므로 최종 공용 저장값은 운영자가 화면을 보며 선택해야 한다.
