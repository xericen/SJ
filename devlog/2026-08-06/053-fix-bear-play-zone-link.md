# 베어트리파크 곰 체험소 GLB 이동 연결 복구

- **ID**: 053
- **날짜**: 2026-08-06
- **유형**: 버그 수정
- **리뷰 ID**: rftazmwmdgilhtqsqmhtmxidaeroraqs

## 작업 요약

곰 체험소 원본 맵 `park-landscape.glb`와 베어트리파크의 `bear-play-zone` 연결 설정을 다시 확인하고, 베어트리파크 입장 시 곰 체험소 GLB를 미리 내려받도록 연결했다. 기존 상호작용 포탈의 단발성 이동 요청은 공용 `PortalTravelGate`를 사용하도록 변경해 월드 전환 핸들러가 수락할 때까지 500ms 간격으로 재요청하며, GLB 로딩 실패 뒤에도 충전 상태를 초기화해 같은 자리에서 다시 이동할 수 있게 했다.

## 원문 요청사항

```text
베어트리파크에서 곰체험소로 가는 맵이 연결안되어있는 거 같은데 다시 glb파일 찾아서 연결해줘.
```

## 변경 파일 목록

- `react-app/src/game/renderers/VillageMapRenderer.ts`
  - 곰 체험소 `park-landscape.glb` 선로딩 함수를 추가했다.
  - 곰 체험소 이동 상호작용에 수락 확인·재시도 게이트를 연결하고 실패 시 상태를 복구했다.
- `react-app/src/game/GameCanvas.tsx`
  - 현재 맵이 베어트리파크일 때 연결 대상인 곰 체험소 GLB를 유휴 시간에 선로딩하도록 했다.
- `react-app/scripts/bearTreePortals.test.ts`
  - 원본 GLB 존재·크기, 렌더러 매핑, 선로딩, 이동 재시도·실패 복구를 검증하는 회귀 테스트를 추가했다.
- `react-app/src/runtimeBuild.ts`, `src/app/page.home/view.pug`
  - 운영 캐시 식별자를 `20260806-bear-play-zone-link-v148`로 갱신했다.
- `src/assets/jochwon-app/`
  - 최신 React 프로덕션 빌드를 동기화하고 이전 해시 JavaScript 청크를 정리했다.

## 확인 결과

- 곰 체험소 원본·운영 GLB `park-landscape-Bfpmv1Ic.glb` 크기 `5,801,912`바이트 확인
- 베어트리파크 포탈, 호수공원 포탈 게이트, 런타임 엔트리, 월드 내비게이션, 베어트리파크 화질 회귀 테스트 총 37개 통과
- `npm run build` 성공: 클라이언트 TypeScript, Vite 프로덕션 번들, 성능 예산, Express TypeScript 통과
- WIZ 일반 빌드 성공
- `react-app/dist/`와 `src/assets/jochwon-app/` 143개 파일·내용 일치
- 운영 `index.html`에서 v148 엔트리 확인, 곰 체험소 GLB·신규 엔트리·게임 청크 모두 HTTP 200 확인

## 남은 리스크

- 실제 브라우저에서 캐릭터로 베어트리파크 포탈에 3초 머문 뒤 곰 체험소를 직접 이동하는 수동 3D 조작 검증은 수행하지 않았다.
