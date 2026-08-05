# 관리자 전용 전체 맵 포탈 편집 및 공용 DB 동기화

## 사용자 요청

> 모든 맵안에 있는 포탈 위치를 내가 바꿀 수 있게 해줘, 그리고 내가 바꾼 후에는 모든 이 웹을 사용하는 사람들이 다 공통된 위치로 보일 수 있게 해주면 됨. 그 자리로 픽스 나한테만 포탈 위치 바꿀 수 있는 기능이 있고, 다른 사용자는 없음. 그대신 내가 위치를 바꾸면 그 위치에서 같이 리스폰되고, 포탈이동되고 그렇게 해줘

## 변경 내용

- 16개 3D 맵의 30개 포탈을 `mapId + destination` 기준의 공용 좌표로 통합했다.
- 공용 좌표를 MySQL JSON 문서에 시드·저장·재로딩하고, 여러 서버 인스턴스도 1.5초 간격으로 변경을 동기화하도록 했다.
- 로그인 사용자의 `portalEditor` 권한 또는 `PORTAL_EDITOR_USER_IDS` 허용 목록을 서버에서 검사하고, 비권한 사용자의 편집·리스폰 저장 요청을 차단했다.
- 권한 사용자에게만 현재 맵의 포탈 편집 버튼을 표시하고, 저장 성공 결과를 안내하도록 했다.
- 저장된 좌표를 접속 중인 모든 클라이언트에 실시간 방송하고 일반 포탈·상호작용 포탈·캠퍼스 건물 포탈 렌더러에 공통 적용했다.
- 공간 안내 직접 입장과 맵 간 포탈 이동의 도착 위치도 서버의 최신 공용 좌표를 기준으로 계산하도록 했다.
- 프런트 빌드 ID를 `20260805-shared-admin-portals-v31`로 갱신하고 WIZ 정적 자산을 다시 빌드했다.

## 변경 파일

- `react-app/shared/socket-events.ts`
- `react-app/shared/world-portals.ts`
- `react-app/server/src/config/env.ts`
- `react-app/server/src/index.ts`
- `react-app/server/src/models/WorldPortalPosition.ts`
- `react-app/server/src/rooms/roomStore.ts`
- `react-app/server/src/socket/registerSocketHandlers.ts`
- `react-app/server/.env.example`
- `react-app/src/App.tsx`
- `react-app/src/game/GameCanvas.tsx`
- `react-app/src/game/renderers/VillageMapRenderer.ts`
- `react-app/src/game/worldGuideEntryPoints.ts`
- `react-app/src/pages/GamePage.tsx`
- `react-app/src/pages/GamePage.css`
- `react-app/index.html`
- `src/app/page.home/view.pug`
- `src/assets/jochwon-app/` 빌드 산출물
- `README.md`

## 확인 결과

- 클라이언트 TypeScript 검사 통과
- 서버 TypeScript 검사 통과
- 서버 자동 테스트 43개 통과
- MySQL 시드·재조회 결과: 16개 맵, 30개 포탈, 중복 키 0개
- 로컬 운영 서버 `/health/ready` 및 공용 포탈 조회 정상
- 실제 Socket.IO 연결에서 비로그인 좌표 조회(16개 맵·30개 포탈)와 무권한 저장 차단 확인
- React 운영 빌드 및 성능 예산 검사 통과
- WIZ 프로젝트 빌드 성공
- 운영 정적 자산에서 빌드 ID `20260805-shared-admin-portals-v31` 반영 확인

## 운영 메모

- 현재 개발 DB에는 사용자 계정이 없어 요청자 계정에 `portalEditor`를 즉시 기록하지 못했다. 로그인 후 생성된 요청자 사용자 ID를 운영 서버의 `PORTAL_EDITOR_USER_IDS`에 넣거나 해당 사용자 문서에 `portalEditor: true`를 설정해야 한다.
- WIZ 정적 자산은 반영됐지만 `sj.wizide.com`의 기존 Socket.IO 프로세스는 아직 새 `getPortalPositions` 이벤트에 응답하지 않았다. Node 실시간 서버를 새 이미지로 재배포해야 공용 편집 기능이 운영에서 활성화된다.
