# 정부청사 캐릭터 축소·포탈 3개 편집 복구 및 정책 체험관 제거

- **ID**: 006
- **날짜**: 2026-08-06
- **유형**: UX 개선
- **리뷰 ID**: khwyevuwaeaihviidqipjenctpdcbbsq

## 작업 요약

정부청사에서 통합 월드 카메라 설정으로 150까지 커졌던 캐릭터 높이를 맵의 원래 기준인 94로 축소했다. 정책 체험관 포탈을 제거하고 공동캠퍼스 귀환 포탈은 고정한 채 중앙광장·전망대·스마트시티 포탈 3개만 권한 사용자가 현재 위치로 옮겨 모든 사용자에게 공유 저장할 수 있도록 WIZ·실시간 서버·렌더러를 함께 조정했다.

## 원문 요청사항

```text
맵에 비해서 캐릭터가 너무 큰 느낌임 비율 맞게 조정해줘, 그리고 포탈 위치 3개 내가 옮길 수 있게 해주고, 정책관? 그건 없애주라
```

## 변경 파일 목록

- `react-app/src/game/worldNavigationProfile.ts`
  - 정부청사 전용 캐릭터 높이 94를 적용했다.
- `react-app/shared/world-portals.ts`, `react-app/src/game/renderers/VillageMapRenderer.ts`
  - 정책 체험관 포탈을 제거하고 중앙광장·전망대·스마트시티 포탈 3개를 공용 편집 대상으로 전환했다.
- `react-app/src/pages/GamePage.tsx`
  - 권한 사용자에게 정부청사 포탈 3개의 공용 위치 저장 버튼만 노출하고 공동캠퍼스 귀환 포탈은 제외했다.
- `src/app/page.home/api.py`, `react-app/server/src/rooms/roomStore.ts`, `react-app/server/src/socket/registerSocketHandlers.ts`
  - 정부청사 편집 가능 포탈 3개의 저장을 허용하고 공동캠퍼스 귀환 및 삭제된 정책 체험관 포탈 저장은 차단했다.
- `react-app/scripts/governmentMap.test.ts`, `react-app/scripts/festivalPortal.test.ts`, `react-app/scripts/personalFarmPortals.test.ts`
  - 정부청사 캐릭터 비율·포탈 개수·편집 권한과 기존 고정 포탈 정책의 회귀 테스트를 추가·갱신했다.
- `react-app/src/runtimeBuild.ts`, `src/app/page.home/view.pug`, `src/assets/jochwon-app/`
  - 런타임 빌드 ID를 `20260806-government-scale-portals-v102`로 갱신하고 프로덕션 번들을 WIZ 정적 자산에 동기화했다.
- `devlog.md`, `devlog/2026-08-06/006-government-scale-editable-portals.md`
  - 이번 변경과 검증 결과를 기록했다.

## 확인 결과

- 정부청사 전용 및 관련 회귀·런타임 엔트리 테스트 16건 통과
- `npm run build` 성공: 클라이언트 TypeScript, Vite 프로덕션 번들, 성능 예산, 서버 TypeScript 통과
- 성능 예산 통과: 초기 엔트리 286 KiB, 최대 JS gzip 310 KiB, 최대 3D 자산 21.64 MiB
- React `dist`와 WIZ `src/assets/jochwon-app` 143개 파일 일치 확인
- WIZ 일반 빌드(`clean: false`) 성공
- 운영 정적 인덱스에 빌드 ID `v102` 반영 및 신규 엔트리 자산 HTTP 200 확인
- `git diff --check` 통과

## 남은 리스크

- 실제 운영 계정에서 포탈 편집 버튼이 보이려면 기존과 동일하게 해당 사용자에게 `admin` 또는 `portal_editor` 역할이 설정되어 있어야 한다.
- 자동 검증은 통과했지만 운영 브라우저에서 캐릭터 높이 94의 체감 비율과 세 포탈의 최종 좌표는 요청자가 직접 확인·배치해야 한다.
