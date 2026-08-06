# 공동캠퍼스 정부청사 포탈 요청자 좌표 고정 및 편집 제거

- **ID**: 057
- **날짜**: 2026-08-06
- **유형**: UX·포탈
- **리뷰 ID**: ubhnpywyyudignpzxnhbzznfezhtzgax

## 작업 요약

운영 WIZ 공용 포탈 저장소에서 요청자가 마지막으로 지정한 공동캠퍼스→정부청사 좌표 `(368, 899)`를 확인해 새 고정 기준값으로 반영했다. 모든 사용자에게 같은 좌표가 적용되도록 WIZ·React·실시간 서버 저장 계층에서 해당 포탈을 고정하고, 공동캠퍼스의 정부청사 포탈 위치 이동 버튼과 저장 예외를 제거했다.

## 원문 요청사항

```text
정부 청사로 가는 포탈 자리 픽스해줘 (다른 사용자도 이 포탈 위치로 볼 수 있게) 그리고 현재 위치 옮길 수 있는 버튼 없애줘
```

## 변경 파일 목록

- `react-app/shared/world-portals.ts`, `src/app/page.home/api.py`
  - 공동캠퍼스→정부청사 좌표를 `(368, 899)`로 변경하고 공용 고정 키로 등록했다.
- `react-app/src/game/renderers/VillageMapRenderer.ts`
  - 정부청사 포탈을 고정 위치·비편집 포탈로 전환하고 공동캠퍼스 위치 변경을 차단했다.
- `react-app/src/pages/GamePage.tsx`
  - 공동캠퍼스의 정부청사 포탈 위치 편집 대상을 제거해 버튼이 노출되지 않도록 했다.
- `react-app/server/src/rooms/roomStore.ts`, `react-app/server/src/socket/registerSocketHandlers.ts`, `react-app/server/src/models/WorldPortalPosition.ts`
  - 실시간 서버와 DB 정규화 계층에서 정부청사 포탈을 다른 공동캠퍼스 포탈과 동일하게 고정했다.
- `react-app/scripts/campusPortals.test.ts`
  - 좌표 고정, 편집 UI 제거, 클라이언트·서버 저장 차단을 회귀 테스트에 반영했다.
- `react-app/src/runtimeBuild.ts`, `src/app/page.home/view.pug`, `src/assets/jochwon-app/`
  - 런타임 빌드 ID를 `20260806-fixed-campus-government-v156`으로 갱신하고 프로덕션 자산을 동기화했다.
- `devlog.md`, `devlog/2026-08-06/057-freeze-campus-government-portal.md`
  - 이번 변경과 검증 결과를 기록했다.

## 확인 결과

- 공동캠퍼스·베어트리파크·월드 이동·카메라 편집 회귀 테스트 34건 통과
- 런타임 엔트리 테스트 6건 통과
- `npm run build` 성공: 클라이언트 TypeScript, Vite 번들, 성능 예산, 서버 TypeScript 통과
- 성능 예산 통과: 초기 엔트리 246 KiB, 최대 JS gzip 324 KiB, 최대 3D 자산 21.64 MiB
- React `dist`와 WIZ `src/assets/jochwon-app` 144개 파일 일치 확인
- WIZ 일반 빌드(`clean: false`) 성공
- 운영 `/home`, 정적 인덱스, 엔트리 자산, 포탈 API HTTP 200 확인
- 운영 포탈 API에서 `campus → government (368, 899)` 고정 좌표 반환 확인
- `git diff --check` 통과

## 남은 리스크

- 실제 사용자 브라우저에서 편집 버튼이 사라지고 포탈이 `(368, 899)`에 보이는지 수동 시각 검증은 수행하지 않았다.
