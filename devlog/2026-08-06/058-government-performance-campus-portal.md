# 정부청사 이동 렉 개선 및 공동캠퍼스 포탈 편집 허용

- **ID**: 058
- **날짜**: 2026-08-06
- **유형**: 성능·UX·포탈
- **리뷰 ID**: khwyevuwaeaihviidqipjenctpdcbbsq

## 작업 요약

정부청사 이동 중 캐릭터 발 영역을 매 프레임 다섯 번 확인하고 몸체 충돌 레이캐스트를 별도로 실행하던 경로를 평탄한 청사 도로에 맞게 단일 지면 샘플로 경량화했다. 일반 기기 렌더 목표를 30fps에서 60fps로 높이고 시작 픽셀 비율을 1.1에서 0.9로 낮추되, 저사양 기기에는 30fps·0.7 픽셀 비율 폴백을 적용했다. 정부청사의 공동캠퍼스 포탈도 다른 세 포탈과 동일하게 요청자 권한으로 현재 위치에 옮겨 공용 저장할 수 있도록 전환했다.

## 원문 요청사항

```text
다닐 때 렉이 너무 많이 걸려서 이 부분 해결해주고, 공동캠퍼스로 가는 포탈 위치 내가 변경할 수 있도록 해저
```

## 변경 파일 목록

- `react-app/src/game/renderers/VillageMapRenderer.ts`
  - 정부청사에 60fps 렌더 목표, 0.9 픽셀 비율, 단일 지면 샘플링, 단순 충돌 경로와 저사양 폴백을 적용했다.
  - 공동캠퍼스 포탈을 공용 위치 편집 대상으로 변경했다.
- `react-app/src/pages/GamePage.tsx`
  - 정부청사 편집 목록에서 공동캠퍼스 포탈 제외 조건을 제거해 총 4개 포탈 버튼을 노출했다.
- `src/app/page.home/api.py`, `react-app/server/src/rooms/roomStore.ts`, `react-app/server/src/socket/registerSocketHandlers.ts`
  - 권한 사용자의 정부청사→공동캠퍼스 포탈 저장을 허용하고 기존 권한·현재 맵 검증은 유지했다.
- `react-app/scripts/governmentMap.test.ts`, `react-app/scripts/campusPortals.test.ts`
  - 정부청사 성능 설정, 포탈 4개 편집, 공동캠퍼스 포탈 저장 허용과 기존 공동캠퍼스 고정 정책 회귀를 검증했다.
- `react-app/src/runtimeBuild.ts`, `src/app/page.home/view.pug`, `src/assets/jochwon-app/`
  - 런타임 빌드 ID를 `20260806-government-performance-campus-portal-v157`로 갱신하고 WIZ 정적 자산을 동기화했다.
- `devlog.md`, `devlog/2026-08-06/058-government-performance-campus-portal.md`
  - 이번 변경과 검증 결과를 기록했다.

## 확인 결과

- 정부청사·공동캠퍼스·월드 이동·런타임 엔트리 회귀 테스트 25건 통과
- `npm run build` 성공: 클라이언트 TypeScript, Vite 프로덕션 번들, 성능 예산, 서버 TypeScript 통과
- 성능 예산 통과: 초기 엔트리 246 KiB, 최대 JS gzip 324 KiB, 최대 3D 자산 21.64 MiB
- React `dist`와 WIZ `src/assets/jochwon-app` 144개 파일 일치 확인
- WIZ 일반 빌드(`clean: false`) 성공
- 운영 정적 인덱스에 빌드 ID `v157` 반영 및 신규 엔트리 자산 HTTP 200 확인
- 운영 공용 포탈 API에서 정부청사→공동캠퍼스 좌표 반환 및 비로그인 저장 요청 403 차단 확인
- `git diff --check` 통과

## 남은 리스크

- 실제 체감 프레임은 사용 기기의 GPU·브라우저와 동시에 표시되는 사용자 수에 따라 달라질 수 있다.
- 단순 충돌 경로에서도 지면 높이 검사는 유지되지만, 복잡한 건물 모서리를 아주 가깝게 통과할 때 기존보다 충돌 판정이 느슨할 수 있다.
- 포탈 최종 좌표는 권한 계정으로 정부청사에서 직접 이동·저장해야 한다.
