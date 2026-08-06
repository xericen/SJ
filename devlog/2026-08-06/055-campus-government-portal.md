# 공동캠퍼스 카메라 800 및 편집형 정부청사 포탈 추가

- **ID**: 055
- **날짜**: 2026-08-06
- **유형**: UX·3D 카메라·포탈
- **리뷰 ID**: ubhnpywyyudignpzxnhbzznfezhtzgax

## 작업 요약

공동캠퍼스 전용 카메라 거리를 1000에서 800으로 변경했다. 요청의 “청부청사”는 서비스 기존 명칭인 “정부청사”로 해석해 공동캠퍼스 중앙부 `(1200, 1200)`에 정부청사행 포탈을 추가했다. 포탈 편집 권한이 있는 사용자에게만 공용 위치 저장 버튼을 노출하며, 저장한 위치는 WIZ 공용 포탈 저장소를 통해 모든 사용자에게 반영된다. 기존 공동캠퍼스 포탈 5개는 계속 고정하고, 공동 프로필을 사용하던 베어트리파크 카메라는 기존 거리 1000을 유지하도록 분리했다.

## 원문 요청사항

```text
800으로 공동캠퍼스 카메라 거리 바꿔주고, 청부청사로 갈 수 있는 포탈 만들어줘, 내가 위치 변경할 수 있게도 해저
```

## 변경 파일 목록

- `react-app/src/game/worldNavigationProfile.ts`
  - 공동캠퍼스 카메라 거리를 800으로 변경하고 베어트리파크 거리 1000을 별도 프로필로 분리했다.
- `react-app/shared/world-portals.ts`, `src/app/page.home/api.py`
  - 공동캠퍼스→정부청사 포탈 기본 좌표와 공용 저장 허용 정책을 추가했다.
- `react-app/src/game/renderers/VillageMapRenderer.ts`
  - 공동캠퍼스에 3초 충전형 정부청사 포탈을 렌더링하고 공용 위치 변경을 허용했다.
- `react-app/src/pages/GamePage.tsx`
  - 포탈 편집 권한 사용자에게만 공동캠퍼스 정부청사 포탈 위치 저장 버튼을 노출했다.
- `react-app/server/src/rooms/roomStore.ts`, `react-app/server/src/socket/registerSocketHandlers.ts`, `react-app/server/src/models/WorldPortalPosition.ts`
  - 기존 공동캠퍼스 5개 포탈은 고정하면서 정부청사행 포탈만 위치 저장·동기화하도록 예외를 추가했다.
- `react-app/scripts/campusPortals.test.ts`, `react-app/scripts/campusVisualQuality.test.ts`, `react-app/scripts/worldNavigationConsistency.test.ts`
  - 카메라 거리, 포탈 생성, 권한 UI, 공용 저장 및 기존 포탈 고정을 회귀 테스트로 검증했다.
- `react-app/src/runtimeBuild.ts`, `src/app/page.home/view.pug`, `src/assets/jochwon-app/`
  - 런타임 빌드 ID를 `20260806-campus-government-portal-v150`으로 갱신하고 프로덕션 자산을 동기화했다.
- `devlog.md`, `devlog/2026-08-06/055-campus-government-portal.md`
  - 이번 변경과 검증 결과를 기록했다.

## 확인 결과

- 공동캠퍼스·베어트리파크·정부청사·월드 이동 회귀 테스트 32건 통과
- 런타임 엔트리 테스트 6건 통과
- `npm run build` 성공: 클라이언트 TypeScript, Vite 번들, 성능 예산, 서버 TypeScript 통과
- 성능 예산 통과: 초기 엔트리 246 KiB, 최대 JS gzip 324 KiB, 최대 3D 자산 21.64 MiB
- React `dist`와 WIZ `src/assets/jochwon-app` 143개 파일 일치 확인
- WIZ 일반 빌드(`clean: false`) 성공
- 운영 `/home`, 정적 인덱스, 엔트리 자산, 포탈 API HTTP 200 확인
- 운영 포탈 API에서 `campus → government (1200, 1200)` 반환 및 비로그인 편집 권한 차단 확인
- `git diff --check` 통과

## 남은 리스크

- 요청자 로그인 계정으로 실제 위치 저장 버튼을 누르고 다른 브라우저에서 좌표 동기화를 확인하는 수동 검증은 수행하지 않았다.
- 정부청사 포탈의 기본 위치는 공동캠퍼스 중앙부로 지정했으며, 실제 선호 위치는 요청자가 편집 버튼으로 조정해야 한다.
