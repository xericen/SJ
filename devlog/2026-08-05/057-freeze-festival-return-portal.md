# 축제부스 세종호수공원 귀환 포탈 좌표 고정 및 편집 제거

- **ID**: 057
- **날짜**: 2026-08-05
- **유형**: UX 개선 · 설정 변경
- **리뷰 ID**: `ypugnklkjffnuydcoyjchgxvzcwvrovr`

## 작업 요약

운영 공용 API에서 확인한 요청자의 마지막 축제부스 귀환 포탈 좌표 `(1211, 440)`을 공용 기본값과 공간 안내 진입 기준으로 확정했다. 축제부스 전용 편집 버튼과 권한 기반 공용 편집 UI를 제거하고, WIZ API·Node Socket.IO·메모리 저장소·DB 정규화·클라이언트 렌더러에서 이후 좌표 변경이나 과거 저장값 덮어쓰기를 차단했다.

## 원문 요청사항

```text
축제부스 맵에 있는 세종호수 공원으로 돌아가는 포탈 위치 내가 변경해뒀는데,  그 자리 픽스해줘 다른 사용자도 동일한 위치에 보일 수 있게, 그리고 내가 세종호수 공원 포탈 위치 바꾸는 거 없애줘,
```

## 변경 파일 목록

- `react-app/shared/world-portals.ts`, `react-app/src/game/worldGuideEntryPoints.ts`: 축제부스 귀환 포탈 공용·안내 좌표를 `(1211, 440)`으로 고정
- `src/app/page.home/api.py`: 축제부스 좌표를 canonical 값으로 반환하고 저장 요청 차단
- `react-app/src/pages/GamePage.tsx`, `react-app/src/components/LakeParkExperiences.tsx`: 축제부스 공용·전용 포탈 편집 UI 제거
- `react-app/src/game/renderers/VillageMapRenderer.ts`: 실시간 및 주기 동기화가 축제부스 고정 좌표를 덮어쓰지 못하도록 차단
- `react-app/server/src/socket/registerSocketHandlers.ts`, `react-app/server/src/rooms/roomStore.ts`, `react-app/server/src/models/WorldPortalPosition.ts`: Socket.IO 저장 차단, 메모리 좌표 보호, DB 조회·저장 정규화 적용
- `react-app/scripts/festivalPortal.test.ts`, `react-app/package.json`: 좌표·UI·서버 차단 회귀 테스트와 실행 스크립트 추가
- `README.md`: 고정 포탈 운영 정책에 축제부스 추가
- `react-app/index.html`, `src/app/page.home/view.pug`, `src/assets/jochwon-app/`: v71 캐시 식별자 및 최신 프로덕션 번들 반영
- `devlog.md`, `devlog/2026-08-05/057-freeze-festival-return-portal.md`: 작업 이력 기록

## 검증 결과

- 운영 WIZ 공용 포탈 API에서 `festival-experience → town` 좌표 `(1211, 440)` 확인
- 축제부스 고정·호수공원 포탈·먹거리·카메라 회귀 테스트 21개 통과
- `python -m py_compile src/app/page.home/api.py` 통과
- `npm run build` 성공: 클라이언트 TypeScript, Vite 프로덕션 빌드, 성능 예산 검사, 서버 TypeScript 통과
- `react-app/dist/`와 `src/assets/jochwon-app/` 파일·내용 일치 확인
- WIZ 프로젝트 일반 빌드(`clean: false`) 성공
- 운영 정적 엔트리에서 `20260805-festival-return-portal-v71` 확인
- 대상 변경의 `git diff --check` 통과

## 남은 리스크

- 별도 Node 실시간 서버가 WIZ 정적 자산과 다른 배포 주기로 운영되는 경우 서버 DB 정규화와 Socket.IO 차단은 해당 서버의 다음 배포 후 적용된다. 현재 운영 클라이언트와 WIZ API는 Node에서 과거 좌표가 전달돼도 `(1211, 440)`을 유지한다.
