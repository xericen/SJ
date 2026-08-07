# 프로젝트실 전광판 가로 투영·키오스크형 확대 및 프로젝트 DB 전환

## 사용자 요청

```text
전광판 HTML을 실제 보드 면의 네 모서리에 맞춰 투영했습니다. 크기는 잘 맞는데 가로로 보여야함. -> 세로로 보이고 있음. 확대했을 때, 이렇게 주변 까매지게 되는 게 아니라 프로젝트로비에 키오스크 있잖음 그런 확대로 해주면 됨. -> 프로젝트 내용은 실제 db로 넣어주라
```

## 변경 내용

- 보드 모서리를 화면 Y축으로 재정렬하면서 긴 면이 세로축으로 바뀌던 문제를 수정하고, `Lobby_AI_Board_Surface`의 로컬 Z 긴 축을 HTML 가로축으로 고정했다.
- 확대 시 전체 화면 검은 배경과 강제 92vw/92vh 크기를 제거했다. 프로젝트로비 키오스크처럼 카메라가 보드 앞으로 이동하는 동안 HTML은 실제 보드 면 투영을 계속 따라가도록 변경했다.
- 프로젝트 목록을 WIZ MySQL `project_room_project` 테이블과 Express MySQL `projects` 컬렉션에서 읽고 쓰도록 연결했다.
- 프로젝트실 기본 콘텐츠 3건을 실제 WIZ MySQL 테이블에 `INSERT IGNORE`로 초기화했으며 기존 데이터는 덮어쓰지 않았다.
- 전광판과 프로젝트실 UI 진입 시 DB 목록을 새로 불러오고, 사용자가 만든 프로젝트는 실제 DB로 동기화하도록 수정했다.

## 변경 파일

- `react-app/src/game/renderers/VillageMapRenderer.ts`
- `react-app/src/components/ProjectLobbyBoard.tsx`
- `react-app/src/components/ProjectLobbyBoardZoom.css`
- `react-app/src/components/ProjectRoomInteractions.tsx`
- `react-app/src/services/projectRoomProjects.ts`
- `react-app/src/services/unifiedProfileApi.ts`
- `react-app/server/src/models/Project.ts`
- `react-app/server/src/routes/unifiedProfile.ts`
- `react-app/server/src/services/projectRoomProjectStore.ts`
- `react-app/server/src/services/projectRoomProjectStore.test.ts`
- `react-app/scripts/campusPortals.test.ts`
- `react-app/scripts/projectRoomPersistence.test.ts`
- `src/model/db/project_room_project.py`
- `src/model/struct.py`
- `src/app/page.home/api.py`
- `react-app/src/runtimeBuild.ts`
- `src/app/page.home/view.pug`
- `src/assets/jochwon-app/` (프로덕션 빌드 산출물)
- `devlog.md`
- `devlog/2026-08-06/083-project-board-landscape-kiosk-db.md`

## 확인 결과

- 전광판·DB 회귀 테스트: 14개 통과
- `npm run build`: 클라이언트/서버 TypeScript, Vite, 성능 예산 검사 통과
- `npm run test:runtime-entry`: 6개 통과
- Python `py_compile`: WIZ API·DB 모델·Struct 통과
- React `dist`와 WIZ 정적 자산 동기화 시 차이 없음
- WIZ 클린 빌드 및 최종 일반 빌드 성공
- 실제 MySQL `project_room_project` 테이블에서 기본 프로젝트 ID 3건 확인
- `git diff --check`: 통과

## 남은 리스크

- 운영 중인 WIZ Python 프로세스가 새 API 본문을 자동 재로딩하기 전에는 클라이언트가 내장 기본 프로젝트를 임시 표시하며, 다음 프로세스 갱신 후 DB 목록으로 전환된다.
- 실제 카메라 이동 중 보드의 가로 체감 크기는 운영 화면에서 최종 확인이 필요하다.
