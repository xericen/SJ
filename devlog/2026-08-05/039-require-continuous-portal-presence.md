# 포탈 3초 연속 체류 조건 복구

- **ID**: 039
- **날짜**: 2026-08-05
- **유형**: 버그 수정
- **리뷰 ID**: aqfdpmzrjubtgclzlefkcbkbdnvpvuez

## 작업 요약

포탈 충전이 시작된 뒤 활성 포탈의 허용 거리를 무한대로 고정하던 로직을 제거했다. 이제 세종호수공원의 세종예술의전당·공동캠퍼스·먹거리 부스·축제부스·베어트리파크 포탈은 설정된 반경 안에 3초 동안 연속으로 머문 경우에만 이동한다. 충전 도중 반경을 벗어나면 진행률과 이동 요청 상태를 즉시 초기화하며, 다시 들어오면 3초를 처음부터 계산한다. 기존 이동 요청 수락 확인과 미수신 재시도 동작은 유지했다.

## 원문 요청사항

```text
현재 3초해서 포탈 이동하는 건 좋은데, 여기서 중요한 포인트는 포탈 위치에 3초동안 가만히 위치해있어야지 카운트 다운이 되고 넘어가는 건데, 현재 포탈이 스쳐서 다른 곳에 지나쳐도 3초 자동으로 카운트 되면서 그 맵으로 이동해지고 있어. 이 부분을 수정해줘
```

## 변경 파일 목록

- `react-app/src/game/portalTravelGate.ts`: 포탈 충전 반경 체류 판정 함수 추가
- `react-app/src/game/renderers/VillageMapRenderer.ts`: 충전 중 무한 거리 고정을 제거하고 반경 이탈 시 활성 포탈·진행률 초기화 연결
- `react-app/scripts/lakePortals.test.ts`: 5개 포탈 각각의 이탈 취소·재진입 3초 재계산 회귀 테스트 추가
- `react-app/index.html`, `src/app/page.home/view.pug`: 운영 캐시 식별자를 `20260805-portal-presence-v59`로 갱신
- `src/assets/jochwon-app/index.html`, `src/assets/jochwon-app/assets/index-t2F4bi67.js`, `src/assets/jochwon-app/assets/GamePage-BG4Zp0R5.js`, `src/assets/jochwon-app/assets/GamePage-BQhBGX5S.js`: v59 운영 엔트리와 연결 청크 반영
- `devlog.md`, `devlog/2026-08-05/039-require-continuous-portal-presence.md`: 작업 이력 기록

## 검증 결과

- `npm run test:lake-portals` 성공: 5개 포탈의 이탈 취소·재진입 재계산과 기존 이동 재시도를 포함해 총 11개 통과
- `tsc -p tsconfig.app.json --noEmit` 성공
- `npm run build` 성공: 클라이언트 TypeScript, Vite 프로덕션 빌드, 성능 예산 검사, 서버 TypeScript 통과
- WIZ 프로젝트 일반 빌드(`clean: false`) 성공
- 생성된 모든 JavaScript에 대한 `node --check` 통과
- v59 생성 번들에서 포탈 충전의 무한 거리 고정이 제거되고 유한 반경 판정이 포함된 것을 확인
- 운영 v59 HTML과 엔트리·GamePage·월드/포탈 청크 3개가 HTTP 200을 반환하고 로컬 산출물과 SHA-256이 일치함을 확인
- 대상 파일 `git diff --check` 통과

## 남은 리스크

- 실제 브라우저에서 캐릭터로 다섯 포탈을 각각 통과하는 WebGL 화면 단위 E2E는 현재 환경에서 자동 조작하지 못했다. 대신 다섯 포탈별 연속 체류·이탈·재진입 상태 전이와 실제 운영 번들을 검증했다.
