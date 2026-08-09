# MySQL 기반 멀티사용자 협업·권한 보강

## 사용자 요청

SJ의 기존 MySQL 구조를 유지하면서 동아리 생성·가입·직급·가입자 전용 콘텐츠, 모집글 키오스크 동기화, 프로젝트 팀장 역할 배정·장소 검색·전원 합의, 1:1 채팅 저장 및 장소 추천 속도, 주변 사용자 카드 가림 문제를 실제 코드와 서버 권한까지 수정한다.

## 변경 내용

- 동아리·모집글은 기존 `ai_behavior_state` MySQL 공유 문서를 단일 source of truth로 사용하고 생성·가입·직급·콘텐츠 권한을 WIZ API에서 검증했다.
- 동아리 역할을 회장·임원·부원으로 제한하고 회장만 임원/부원 변경이 가능하게 했다.
- 모집센터와 키오스크가 동일 WIZ API를 조회하며 생성 후 주기적으로 최신 목록을 다시 가져오게 했다.
- 프로젝트 협업 초안·역할·참가자 합의·최종 코스를 기존 `project_room_project` MySQL JSON에 저장하고 팀장 권한과 전원 동의를 서버에서 검증했다.
- AI 회의 도우미 UI/호출을 제거하고 서버 Kakao Local 장소 검색만 사용하게 했다.
- 운영 직접 채팅의 별도 SQLite 저장을 제거하고 기존 WIZ MySQL ORM 기반 `realtime_direct_room`, `realtime_friendship`, `realtime_direct_message` 모델을 추가했다.
- 1:1 장소 추천은 잘못된 SPA API 호출을 Socket.IO 요청으로 교체하고 최근 20개 메시지, Kakao 1회 검색, 5분 캐시 및 구간별 성능 로그를 적용했다.
- 주변 사용자 카드가 HUD 뒤에 숨지 않도록 고정 레이어와 화면 경계 보정을 적용했다.

## 변경 파일

- `src/app/page.home/api.py`, `src/app/page.home/socket.py`, `src/app/page.home/view.pug`
- `src/model/db/realtime_direct_room.py`, `realtime_friendship.py`, `realtime_direct_message.py`
- `react-app/src/components/ClubStreetExperience.tsx`, `RecruitmentCenterKiosk.tsx`, `ProjectRoomInteractions.tsx`, `DirectRecommendation.tsx`
- `react-app/src/services/unifiedProfileApi.ts`, `react-app/src/pages/GamePage.css`
- `react-app/server/src/routes/clubs.ts`, `react-app/server/src/routes/unifiedProfile.ts`
- `react-app/scripts/verifyWizSocketSource.py`, `react-app/src/runtimeBuild.ts`

## 확인 결과

- React/Vite/TypeScript/서버 빌드와 성능 예산 검사 통과.
- WIZ Python 소스 컴파일, 직접 채팅 소스·동작 검사, 동아리 거리 회귀 검사 통과.
- 카카오 Local 3개 검색 평균 87ms 확인.
- 전체 Node 서버 테스트는 58건 통과, 개인팜 테스트 12건은 테스트 환경의 MySQL `localhost:3306` 미기동으로 실패했다.
