# 베어트리파크 포탈 3개 공용 좌표 고정

- **ID**: 066
- **날짜**: 2026-08-05
- **유형**: UX·공용 상태 고정
- **리뷰 ID**: fcxythrwehrrelwteeqgegazjvkxooaz

## 사용자 요청

> 베어트리파크에 내가 호수 공원으로 이동하는 퐅탈, 수목원, AI 연구소 포탈 위치 정해뒀는데 그걸로 픽스해주고, 다른 사용자도 그 포탈로 보이게 수정해줘 그리고 3개 위치 변경하는 버튼 없애줘

## 변경 내용

- 운영 WIZ 공용 포탈 저장값에서 요청자가 확정한 좌표를 조회해 호수공원 `(1185, 1616)`, 수목원 `(767, 751)`, AI 연구소 `(1482, 661)`로 고정했다.
- React 공용 기본값, 3D 렌더러, 공간 안내 진입점, Express 메모리 저장소·MySQL 정규화, WIZ 기본값을 동일 좌표로 통일했다.
- WIZ API와 Express Socket.IO 저장 경로에서 세 포탈의 추가 위치 변경을 거부하도록 고정 정책을 적용했다.
- 베어트리파크 화면의 세 포탈 위치 변경 버튼과 전용 로컬 이벤트 핸들러를 제거했다.
- 권한 사용자용 공용 편집 목록에서도 세 고정 포탈을 제외했다.
- 요청 범위가 아닌 곰 가족 포토존과 마이홈 포탈 위치 편집 기능은 유지했다.
- 런타임 빌드 ID를 `20260805-fixed-bear-tree-portals-v79`로 갱신하고 최신 React 산출물을 WIZ 정적 번들에 동기화했다.

## 주요 변경 파일

- `react-app/shared/world-portals.ts`
- `react-app/src/game/worldGuideEntryPoints.ts`
- `react-app/src/game/renderers/VillageMapRenderer.ts`
- `react-app/src/pages/GamePage.tsx`
- `react-app/server/src/rooms/roomStore.ts`
- `react-app/server/src/socket/registerSocketHandlers.ts`
- `react-app/server/src/models/WorldPortalPosition.ts`
- `src/app/page.home/api.py`
- `react-app/scripts/bearTreePortals.test.ts`
- `react-app/scripts/festivalPortal.test.ts`
- `react-app/package.json`
- `react-app/src/runtimeBuild.ts`
- `src/app/page.home/view.pug`
- `src/assets/jochwon-app/index.html`
- `src/assets/jochwon-app/assets/*`

## 확인 결과

- `npm run test:bear-tree-portals` 성공: 고정 좌표, 실시간 서버 변경 거부, React·WIZ 편집 경로 차단 3개 통과
- 포토존 회귀 테스트 3개와 축제 포탈 고정 회귀 테스트 4개 통과
- 런타임 엔트리 캐시 회귀 테스트 2개 통과
- `npm run build` 성공: 클라이언트 TypeScript, Vite 번들, 성능 예산, 서버 TypeScript 통과
- 성능 예산 통과: 초기 엔트리 287 KiB, 최대 JS gzip 310 KiB, 최대 3D 자산 21.64 MiB
- Python 구문 검사, React `dist`와 WIZ 정적 번들 전체 비교, WIZ 일반 빌드 성공
- 운영 WIZ API에서 비로그인 사용자 기준 세 포탈 좌표가 각각 `(1185,1616)`, `(767,751)`, `(1482,661)`로 반환되는 것을 확인
- 운영 v79 엔트리와 GamePage 청크 HTTP 200, 포토존 편집 유지 및 세 포탈 전용 편집 이벤트 제거 확인
- `git diff --check` 통과

## 남은 리스크

- 이미 v78 이하 화면을 열어 둔 사용자는 새로고침해야 v79 UI에서 위치 변경 버튼 제거 상태를 확인할 수 있다.
- 여러 사용자 브라우저를 동시에 조작하는 수동 멀티 계정 시각 검증은 수행하지 않았다.
