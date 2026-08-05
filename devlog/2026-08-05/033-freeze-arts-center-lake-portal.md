# 예술의전당 세종호수공원 포탈 좌표 고정 및 편집 버튼 제거

- **ID**: 033
- **날짜**: 2026-08-05
- **유형**: UX 개선
- **리뷰 ID**: ucpgkvwdbljhhijvtebeixepohjidmjy

## 작업 요약

세종예술의전당에서 세종호수공원으로 돌아가는 포탈의 운영 공용 좌표 `(1000, 780)`을 그대로 유지했다. 권한 기반 공용 편집 버튼과 예술의전당 전용 레거시 편집 버튼을 모두 제거하고, WIZ API와 Node Socket.IO 저장 경로를 차단했다. 과거 DB 값이나 실시간 동기화가 좌표를 다시 덮지 못하도록 서버 로드·메모리 저장소·클라이언트 렌더러에서도 기준 좌표를 강제했다.

## 원문 요청사항

```text
현재 세종호수 공원으로 가는 포탈 위치 마음에 드니까 이대로 픽스해주고, 내가 위치 수정하는 버튼 없애줘
```

## 변경 파일 목록

- `react-app/src/pages/GamePage.tsx`: 예술의전당을 공용 포탈 편집 제외 맵에 추가하고 예술의전당 전용 위치 이동 버튼 제거
- `react-app/src/game/renderers/VillageMapRenderer.ts`: 예술의전당 포탈에 대한 공용 좌표 덮어쓰기 무시
- `src/app/page.home/api.py`: `arts-center` 포탈 저장 요청 차단 및 과거 저장값 대신 `(1000, 780)` 기준 좌표 반환
- `react-app/server/src/socket/registerSocketHandlers.ts`: Socket.IO 직접 저장 요청에서도 `arts-center` 변경 차단
- `react-app/server/src/rooms/roomStore.ts`: 메모리 저장소에서 예술의전당 포탈 좌표 변경 거부
- `react-app/server/src/models/WorldPortalPosition.ts`: DB 조회·저장 시 예술의전당 포탈 좌표를 `(1000, 780)`으로 정규화
- `react-app/index.html`: 소스 빌드 캐시 식별자를 v53으로 갱신
- `src/app/page.home/view.pug`: `/home` iframe 빌드 쿼리를 v53으로 갱신
- `src/assets/jochwon-app/index.html`: 운영 엔트리와 캐시 식별자를 v53으로 갱신
- `src/assets/jochwon-app/assets/GamePage-portal-v52.js`: 기존 v50 후속 수정들을 유지하면서 예술의전당 편집 UI 두 경로 제거 및 고정 렌더러 연결
- `src/assets/jochwon-app/assets/WorldEngine-portal-v52.js`: 실시간·주기 동기화의 예술의전당 좌표 덮어쓰기 차단
- `src/assets/jochwon-app/assets/index-portal-v53.js`: GamePage v52 청크를 실행·선로드하는 최종 운영 엔트리 추가
- `devlog.md`, `devlog/2026-08-05/033-freeze-arts-center-lake-portal.md`: 작업 이력 기록

## 검증 결과

- 운영 공용 포탈 API에서 `arts-center -> town` 좌표가 `(1000, 780)`으로 유지되는 것 확인
- 원본 소스와 v52 운영 번들에서 공용 편집 UI의 `arts-center` 제외 및 레거시 편집 JSX 제거 확인
- WIZ API, Node Socket.IO, 메모리 저장소의 `arts-center` 저장 차단과 DB 정규화 확인
- RoomStore 회귀 검사에서 변경 요청이 `false`를 반환하고 좌표가 `(1000, 780)`으로 유지되는 것 확인
- v53 운영 HTML·엔트리와 v52 GamePage·WorldEngine 청크 HTTP 200 및 실행 체인 연결 확인
- v52 JavaScript 구문 검사와 `src/app/page.home/api.py` Python 구문 검사 통과
- `npm run build` 성공(TypeScript, Vite 프로덕션 빌드, 성능 예산 검사, 서버 TypeScript)
- 서버 자동 테스트 43개 통과
- WIZ 프로젝트 일반 빌드(`clean: false`) 성공
- 대상 파일 `git diff --check` 통과

## 남은 리스크

- 별도 Node 실시간 서버가 WIZ 정적 자산과 다른 배포 주기로 운영되는 환경에서는 서버 DB 정규화까지 적용하려면 해당 서버의 다음 배포가 필요하다. 현재 운영 클라이언트와 WIZ API는 Node의 과거 좌표가 전달돼도 `(1000, 780)`을 유지한다.
