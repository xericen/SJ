# 친구 요청 수락 UX·체험 맵 HUD 분배·양측 채팅 모션 종료 동기화

## 사용자 원문 요청

> 친구 요청 보내면 수락하는 느낌으로 가야되는데 아직도 단방향으로 받는 느낌으로 되어있어서 이거 수정해야줘야될거같고 지금 옆에 현재 위치 나오고 내 친구 나오고 각까운 이웃 나오고 여기서 베어트리파크나 뭐 다른곳을 가버리면 지금 왼쪽 창이 너무 산만해 거기에 퀘스트도 같이 나와버리니까 이걸 좀 적절하게 분배해서 뭐 나올때는 뭐 안나오고 이렇게 바꿔야될거같고 채팅 할때 한명이 채팅을 그만하고 싶으면 채팅이 멈추고 걷는 모션으로 바뀌어야되는데 지금 한명이 끊어도 한명이 계속 채팅을 하고있으면 말하는 모션을 하면서 걸어다녀 버려 이거 그냥 한명이 끊으면 채팅  그만하는걸로 모션 바꿔줘

## 변경 내용

- 친구 프로필의 `친구 추가`를 `친구 요청 보내기`로 바꾸고, 발신 뒤에는 `상대 수락 대기 중`으로 비활성화해 요청→상대 수락 흐름이 명확히 보이도록 수정했다.
- 예술의전당·축제·먹거리·베어트리파크·곰 체험소·수목원·정부청사 체험 맵에서는 현재 활동 목록을 자동으로 접고 친구 패널을 숨겼다. 퀘스트/곰 체험 안내가 표시될 때는 활동 목록도 숨겨 체험 안내를 우선한다.
- 채팅창 닫기를 `directChatFocusEnded` 양측 이벤트로 변경했다. 어느 한쪽이 대화를 그만두면 양쪽 채팅창과 말하기 모션이 함께 종료되며, 채팅방 자체는 유지되어 기존 방 연락 알림 흐름을 계속 사용할 수 있다.
- `채팅방 나가기`는 기존처럼 방을 종료해 이후 다시 대화 요청이 필요하도록 분리했다.
- 런타임 빌드 ID를 `20260806-social-focus-chat-stop-v189`로 갱신하고 정적 자산을 동기화했다.

## 변경 파일

- `react-app/src/pages/GamePage.tsx`
- `react-app/src/pages/GamePage.css`
- `react-app/src/components/SocialProfileModal.tsx`
- `react-app/shared/socket-events.ts`
- `src/app/page.home/socket.py`
- `react-app/scripts/socialProfileActions.test.ts`
- `react-app/scripts/verifyWizSocketSource.py`
- `react-app/src/runtimeBuild.ts`
- `src/app/page.home/view.pug`
- `src/assets/jochwon-app/**`

## 확인 결과

- `npm exec -- tsx --test scripts/socialProfileActions.test.ts`: 8/8 통과
- `npm run test:wiz-socket-source`: 통과(양방향 친구 수락, 양측 채팅 집중 종료, 기존 방 재사용, 나가기 후 재요청)
- `npm run build`: 통과
- WIZ `main` 프로젝트 빌드: 통과
- 운영 정적 자산에서 빌드 ID와 `directChatFocusEnded`, `상대 수락 대기 중`, `is-focused-experience` 포함을 확인했다.
- 운영 소켓 2계정 검증은 `friendRequestReceived timed out`으로 실패했다. 소켓 소스는 반영됐지만 현재 실행 중인 WIZ 소켓 프로세스가 새 이벤트를 아직 로드하지 않은 상태다.

## 남은 리스크

- WIZ 소켓 런타임이 다음 정상 재기동/재배포로 새 컨트롤러를 로드하기 전까지 운영 환경의 친구 수락 및 양측 채팅 종료 이벤트는 동작하지 않는다. 작업 지침에 따라 Codex가 서버를 직접 재시작하지 않았다.
