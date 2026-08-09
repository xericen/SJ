# 모집센터 글 분리 및 프로젝트 아이디어 실시간 동기화

## 사용자 원문 요청

리뷰 `smmmgeiqkxuoqcguvcokxvfbfzirqqtl`에서 로그인 후 모집센터 새 모집글 작성 시 띄어쓰기를 허용하고, 작성한 모집글은 `kiosk_screen_Frame`의 모집 둘러보기에 추가하되 프로젝트실 프로젝트 둘러보기에는 노출하지 않으며, 협업 테이블의 AI 회의 도우미를 제거하고 아이디어 보드·테마·먹거리 추가를 다른 사용자에게 실시간 반영해 달라고 요청했다.

## 변경 파일

- `react-app/src/components/RecruitmentCenterDesk.tsx`
- `react-app/src/components/RecruitmentCenterKiosk.tsx`
- `react-app/src/components/ProjectLobbyBoard.tsx`
- `react-app/src/components/ProjectRoomInteractions.tsx`
- `react-app/shared/socket-events.ts`
- `react-app/server/src/socket/registerSocketHandlers.ts`
- `src/app/page.home/socket.py`
- `react-app/scripts/reviewOpsRegression.test.ts`
- `src/app/page.home/view.pug`
- `src/assets/jochwon-app/`

## 변경 내용

- 모집글 작성 폼이 키보드 이벤트를 직접 소비하도록 해 제목·소개·태그·장소 입력의 공백을 보존했다.
- 모집글 등록 직후 모집센터 키오스크가 공개 모집 API를 다시 조회한다.
- `recruitment-*` 항목을 프로젝트실 로비 전광판과 프로젝트 둘러보기에서 제외했다.
- 아이디어 보드의 AI 회의 도우미와 AI 장소 추천 UI를 제거했다.
- 같은 프로젝트 협업 방에서 장소·테마·축제·먹거리 추가와 투표를 Socket.IO로 즉시 전파하며 Express와 WIZ 소켓 양쪽에 동일하게 구현했다.

## 검증

- ReviewOps 회귀 테스트 4건 통과
- TypeScript 및 WIZ Python 문법 검사 통과
- Express 서버에서 Socket.IO 클라이언트 2개로 먹거리 아이디어 실시간 수신 확인
- React/Vite/Express 프로덕션 빌드 및 성능 예산 검사 통과
- WIZ 일반 빌드 성공
- 운영 URL에서 신규 `index-DMY7ikAS.js` 응답(HTTP 200) 확인
