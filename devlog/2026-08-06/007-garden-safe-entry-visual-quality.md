# 수목원 기억나무 갇힘 방지 및 식생 렌더링 선명도 개선

- **ID**: 007
- **날짜**: 2026-08-06
- **유형**: UX·3D 렌더링
- **리뷰 ID**: qnsfeqwkrjjnwhwccrlgfajrtruuaaep

## 작업 요약

베어트리파크 포탈뿐 아니라 수목원의 기본 진입, 공간 안내 진입, 저장 위치 복원까지 모두 포탈 아래쪽 안전 보행로 `(1200, 1400)`을 사용하도록 통일했다. 기존 좌표 `(1200, 1120)` 및 `(1200, 1180)`처럼 중앙 기억나무 화단 안에서 시작하는 저장 상태도 첫 진입 시 안전 보행로로 복구한다. 수목원 식생과 오브젝트는 안티앨리어싱, 2048px 텍스처 상한, 1.2배 기본 픽셀 비율, 지면 텍스처 우선 처리, 부드러운 그림자와 녹색 배경·조명 보정을 적용했다. 저사양 기기용 512px·0.75배 폴백은 유지했다.

## 원문 요청사항

```text
이 부분 걸려서 캐릭터가 나올 수 없음, 걸리지 않게 해결해주고, 수목원 느낌이 날 수 있게 해줘, 오브젝트들이 뭔가 화질 떨어지는 느낌이ㅑ
```

## 변경 파일 목록

- `react-app/src/game/worldPortalArrivals.ts`
  - 수목원 공통 안전 도착점과 기억나무 화단 진입 좌표 복구 로직을 추가했다.
- `react-app/src/game/worldGuideEntryPoints.ts`
  - 공간 안내를 통한 수목원 진입도 공통 안전 도착점을 사용하도록 변경했다.
- `react-app/src/game/renderers/VillageMapRenderer.ts`
  - 기본 수목원 스폰을 안전 도착점으로 통일하고 렌더링 선명도·식생 조명·그림자 설정을 개선했다.
- `react-app/src/game/scenes/WorldScene.ts`
  - 수목원에 저장된 화단 내부 좌표를 첫 프레임 전에 안전 지점으로 보정했다.
- `react-app/scripts/bearTreePortals.test.ts`
  - 수목원 전체 진입 경로, 갇힌 좌표 복구, 품질 설정 회귀 테스트를 추가했다.
- `react-app/src/runtimeBuild.ts`, `src/app/page.home/view.pug`
  - 런타임 빌드 ID를 `20260806-garden-safe-entry-visual-quality-v103`으로 갱신했다.
- `src/assets/jochwon-app/`
  - 최신 React 프로덕션 산출물 143개를 WIZ 정적 번들에 동기화했다.
- `devlog.md`, `devlog/2026-08-06/007-garden-safe-entry-visual-quality.md`
  - 이번 변경과 검증 결과를 기록했다.

## 확인 결과

- 베어트리파크·수목원 진입 회귀 테스트 8건 통과
- 기존 축제 포탈 회귀 테스트 4건 통과
- 수목원 성장 체험 테스트 통과
- 런타임 엔트리 테스트 2건 통과
- `npm run build` 성공: 클라이언트 TypeScript, Vite 번들, 성능 예산, 서버 TypeScript 통과
- 성능 예산 통과: 초기 엔트리 287 KiB, 최대 JS gzip 310 KiB, 최대 3D 자산 21.64 MiB
- React `dist`와 WIZ `src/assets/jochwon-app` 143개 파일 일치 확인
- WIZ 일반 빌드(`clean: false`) 성공
- 운영 `/home`, 정적 인덱스, 엔트리 자산 HTTP 200 및 빌드 ID `v103` 반영 확인
- 운영 GamePage 번들에서 `(1200, 1400)` 안전 좌표, 기억나무 제외 범위, 2048px 텍스처·그림자 설정 반영 확인
- `git diff --check` 통과

## 남은 리스크

- 기본 렌더링 품질을 높여 일반 기기의 GPU 부하는 이전보다 증가할 수 있으나 저사양 기기에는 기존 품질 폴백이 적용된다.
- 실제 운영 브라우저에서 키보드로 화단을 빠져나오는 수동 3D 이동 검증은 수행하지 않았다.
