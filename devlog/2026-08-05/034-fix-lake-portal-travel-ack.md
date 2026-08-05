# 세종호수공원 5개 포탈 이동 수락 확인 및 재시도 보강

- **ID**: 034
- **날짜**: 2026-08-05
- **유형**: 버그 수정
- **리뷰 ID**: aqfdpmzrjubtgclzlefkcbkbdnvpvuez

## 작업 요약

세종호수공원의 세종예술의전당·공동캠퍼스·먹거리 부스·축제부스·베어트리파크 포탈이 3초 충전을 마친 뒤 이동 이벤트가 한 번만 전달되고 멈출 수 있던 경로를 수정했다. 포탈 렌더러는 맵 전환 장면이 요청을 실제로 수락할 때까지 500ms 간격으로 재요청하며, 수락 이후에는 중복 이동을 발생시키지 않는다. 전환 대상 로딩 실패 시 충전 상태를 초기화해 다시 시도할 수 있도록 연결했다. 다섯 포탈의 좌표·충전 시간·활성 반경을 단일 설정으로 통합하고 동일 동작을 회귀 테스트로 고정했다.

## 원문 요청사항

```text
현재 세종예술의 전당으로 가는 포탈 위에 잘 서있는데, 포탈로 넘어가지 않는 오류가 있음 3초 가다가 멈춰 이 부분 해결해줘. 이 포탈 이외에도 공동캠퍼스로 가는 포탈, 먹거리부스, 축제부스, 베어트리파크로 가는 포탈 전부 다 확인해서 너가 잘 넘어가는지 체크해줘,,
```

## 변경 파일 목록

- `react-app/src/game/portalTravelGate.ts`: 이동 요청 수락 상태와 500ms 재시도를 관리하는 포탈 이동 게이트 추가
- `react-app/src/game/lakeParkPortals.ts`: 세종호수공원 5개 포탈의 좌표·대상·3초 충전·활성 반경 설정 통합
- `react-app/src/game/renderers/VillageMapRenderer.ts`: 5개 공통 설정 적용, 충전 완료 후 수락 기반 재요청, 전환 실패 시 충전 초기화 연결
- `react-app/src/game/scenes/WorldScene.ts`: 전환 가드 통과 후 포탈 요청을 수락하고 로딩 실패 이벤트를 기존 복구 경로로 전달
- `react-app/scripts/lakePortals.test.ts`, `react-app/package.json`: 5개 포탈 설정 및 충전·재시도·중복 방지 회귀 테스트 추가
- `react-app/index.html`, `src/app/page.home/view.pug`: 운영 캐시 식별자를 `20260805-portal-travel-ack-v54`로 갱신
- `src/assets/jochwon-app/index.html`, `src/assets/jochwon-app/assets/index-BNf8wlDH.js`, `src/assets/jochwon-app/assets/GamePage-CLqHRRYW.js`, `src/assets/jochwon-app/assets/GamePage-Ms5n86g-.js`: v54 운영 엔트리와 연결된 포탈 수정 번들 반영
- `devlog.md`, `devlog/2026-08-05/034-fix-lake-portal-travel-ack.md`: 작업 이력 기록

## 검증 결과

- `npm run test:lake-portals` 성공: 포탈 설정 1개와 5개 목적지별 충전·미수신 재시도·수락 후 중복 방지 테스트, 총 6개 통과
- `tsc -p tsconfig.app.json --noEmit` 성공
- `npm run build` 성공: 클라이언트 TypeScript, Vite 프로덕션 빌드, 성능 예산 검사, 서버 TypeScript 통과
- WIZ 프로젝트 일반 빌드(`clean: false`) 성공
- v54 운영 엔트리 → `GamePage-CLqHRRYW.js` → `GamePage-Ms5n86g-.js` 실행 체인 및 JavaScript 구문 검사 통과
- 운영 HTML에서 v54 캐시 식별자와 새 엔트리를 확인하고, 연결된 JavaScript 3개가 로컬 산출물과 SHA-256 일치함을 확인
- 세종예술의전당·공동캠퍼스·먹거리 부스·축제부스·베어트리파크 목적지 GLB 5개가 운영 서버에서 HTTP 200을 반환하고 로컬 산출물과 바이트 크기가 일치함을 확인
- 대상 파일 `git diff --check` 통과

## 남은 리스크

- 현재 작업 환경에는 실제 브라우저 WebGL 조작 러너가 없어 방향키로 각 포탈에 진입하는 화면 단위 E2E는 자동화하지 못했다. 대신 동일 운영 경로의 5개 포탈 상태 전이 회귀 테스트, 생성 번들 실행 체인, 운영 정적 자산 일치 여부를 검증했다.
