# MySQL 기반 멀티사용자 협업·권한 보강

## 사용자 요청

기존 MySQL을 유지하며 동아리·모집센터·프로젝트실·1:1 채팅·주변 사용자 UI의 멀티사용자 동기화, 권한, 장소 검색과 최종 합의 문제를 수정한다.

## 변경 파일

- `src/app/page.home/api.py`, `src/app/page.home/socket.py`, `src/app/page.home/view.pug`
- `src/model/db/realtime_direct_room.py`, `src/model/db/realtime_friendship.py`, `src/model/db/realtime_direct_message.py`
- `src/assets/jochwon-app/` 운영 번들

## 변경 및 확인 결과

- 동아리·모집글은 `ai_behavior_state`, 프로젝트 협업·합의는 `project_room_project`, 직접 채팅은 WIZ MySQL ORM 모델을 사용하도록 통일했다.
- 서버 로그인·회원·회장·프로젝트 팀장·전원 합의 권한을 검증하고 클라이언트는 주기적 재조회/Socket.IO로 동기화한다.
- Kakao Local 실제 장소 검색과 1:1 추천 구간별 성능 로그·캐시를 적용했다.
- React/Vite/TypeScript/서버 빌드, 성능 예산, WIZ Python 컴파일과 관련 회귀 검사를 통과했다.
