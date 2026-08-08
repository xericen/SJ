# 프로젝트실 프로젝트 공유·참여 프로필 승인 및 맵 전환 오류 보강

- 원본 요청: 프로젝트실에서 만든 프로젝트를 프로젝트 둘러보기에 노출하고, 다른 로컬 사용자가 참여 신청하면 신청 프로필을 확인·수락할 수 있게 하며 `fadeIn` 맵 전환 오류와 WIZ WebSocket invalid frame 오류를 수정해 달라는 요청.
- 변경 파일:
  - `react-app/src/services/projectRoomProjects.ts`
  - `react-app/src/services/unifiedProfileApi.ts`
  - `react-app/src/components/ProjectRoomInteractions.tsx`
  - `react-app/src/components/RecruitmentCenterDesk.tsx`
  - `react-app/src/game/renderers/VillageMapRenderer.ts`
  - `react-app/src/game/systems/socketClient.ts`
  - `src/app/page.home/api.py`
  - 최신 `src/assets/jochwon-app` hash 번들
- 변경 내용: WIZ 운영에서 200으로 동작하는 공용 JSON 저장소에 프로젝트·참여 신청 marker를 저장하고, 프로젝트실/모집센터가 다른 로컬 사용자 프로젝트와 신청 프로필을 새로 조회하도록 연결했다. 리더 승인 시 멤버와 신청 상태를 동기화한다. 애니메이션 액션 호출을 단계별 null 방어로 변경하고 WIZ 운영 Socket.IO는 polling 전송을 사용하도록 보강했다.
- 확인: React build·TypeScript·성능 검증 통과, Python AST 문법 통과, WIZ clean/일반 build 통과. 운영 `index-6LlmDmB-.js`, `GamePage-CMmLOb77.js`, `GamePage-DIRmbsOU.js` 로드 및 최신 기능 문자열, project marker, polling/fadeIn 코드 포함을 확인했다. 운영 bridge HTTP 200 확인.
- 남은 리스크: 실제 두 브라우저에서 프로젝트 생성→다른 로컬 사용자 신청→리더 승인 UI를 클릭하는 수동 시나리오는 자동화 제한으로 최종 확인이 필요하다. 운영 Python의 신규 전용 resource는 기존 WIZ 라우터 캐시가 401을 반환해 사용하지 않고, 기존 공용 JSON endpoint fallback으로 동작하도록 구성했다.
