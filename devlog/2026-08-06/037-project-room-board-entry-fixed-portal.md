# 프로젝트실 전광판 HTML 가로 보정·안전 진입·공동캠퍼스 포탈 고정

- **ID**: 037
- **날짜**: 2026-08-06
- **유형**: 버그 수정
- **리뷰 ID**: ilrnchtknmubtfcrpbjrrzslthqehvbf

## 작업 요약

이전 작업에서 추가한 프로젝트실 전광판 3D 모델 회전을 제거하고, HTML 전광판만 투영 영역 안에서 원래 가로 비율을 유지하도록 변경했다. 공동캠퍼스에서 프로젝트실로 이동할 때 검증된 로비 좌표로 진입하도록 경로별 도착 좌표를 지정해 바닥 끼임을 방지했다.

프로젝트실의 공동캠퍼스 귀환 포탈은 요청자가 확정한 `(1220, 2050)` 좌표를 클라이언트, WIZ API, Node 실시간 저장소와 DB 정규화 계층 모두에서 고정했다. 기존 저장 좌표가 있더라도 기본 좌표가 우선하며, 프로젝트실에서는 포탈 위치 변경 버튼이 표시되지 않는다.

## 원문 요청사항

```text
프로젝트실 전광판 전체를 카메라 정면 방향으로 90도 회전 보정했습니다.
프레임·화면·HTML 투영 요소가 함께 움직이도록 처리했습니다. 회전을 하지말고 기존에서 가로로 보이게 html만 바꾸면 되잖아, 그리고 현재 공동캠퍼스에서 포탈을 타고 들어오면 바닥에 걸림 이 부분 해결해줘. 그리고 현재 내가 공동캠퍼스로 가는 포탈 위치 정해뒀는데 모든 사용자가 포탈 거기로 볼 수 있게 수정해주고, 위치 바꾸는 버튼 삭제해줘
```

## 변경 파일 목록

- `react-app/src/components/ProjectLobbyBoard.tsx`: 3D 원근 회전 대신 투영 영역 안에 가로 비율로 HTML 전광판 표시
- `react-app/src/game/renderers/VillageMapRenderer.ts`: 이전 전광판 모델 회전 제거 및 프로젝트실 귀환 포탈의 실시간 좌표 덮어쓰기 차단
- `react-app/src/game/worldPortalArrivals.ts`: 공동캠퍼스→프로젝트실 전용 안전 진입 좌표 추가
- `react-app/src/game/worldGuideEntryPoints.ts`: 프로젝트실 귀환 포탈은 요청자 확정 좌표를 항상 사용
- `react-app/src/pages/GamePage.tsx`: 프로젝트실 포탈 위치 변경 버튼 제거
- `react-app/server/src/models/WorldPortalPosition.ts`, `react-app/server/src/rooms/roomStore.ts`, `react-app/server/src/socket/registerSocketHandlers.ts`: 공용 좌표 고정 및 변경 요청 차단
- `src/app/page.home/api.py`: 프로젝트실→공동캠퍼스 포탈을 canonical 좌표로 고정
- `react-app/scripts/campusPortals.test.ts`: HTML 방향, 안전 진입, 공용 포탈 고정 회귀 테스트 추가
- `react-app/src/runtimeBuild.ts`, `src/app/page.home/view.pug`, `src/assets/jochwon-app/`: v134 캐시 식별자와 최신 운영 번들 반영
- `devlog.md`, `devlog/2026-08-06/037-project-room-board-entry-fixed-portal.md`: 작업 이력 기록

## 확인 결과

- 프로젝트실 관련 회귀 테스트 포함 공동캠퍼스 포탈 테스트 9개 통과
- React/Vite 클라이언트와 Express 서버 TypeScript 전체 빌드 성공
- 성능 예산 검사 성공: 엔트리 246 KiB, 최대 gzip JavaScript 324 KiB, 최대 3D 자산 21.64 MiB
- 런타임 엔트리·캐시·스타일 회귀 테스트 6개 통과
- Python API 구문 검사 성공
- React `dist`와 WIZ 정적 자산 전체 내용 일치 확인
- WIZ 일반 빌드 성공

## 남은 리스크

- 실제 운영 카메라에서 HTML 전광판의 최종 크기와 로비 진입 직후 발 위치는 배포 화면에서 육안 확인이 필요하다.
