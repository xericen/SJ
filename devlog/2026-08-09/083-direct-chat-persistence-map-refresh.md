# 1:1 대화 추천 UX·중앙 카카오 웹뷰·DB 복구 및 새로고침 캐릭터 안정화

## 사용자 원문 요청

> 최근 대화하기 디자인 변경해줘. 현재 너무 이상하다, 그리고 분석하고 추천받기 누르면 분석되는 거 표시되게 해줘 분석되는지 안되는지 모르겠음. 그리고 장소 나왔을 때, 카카오맵으로 새창열지말고, 중앙에 html로 카카오 웹 나와서 장소 볼 수 있게 해주면 될 거 같아. 로그인하기에서 1대1 대화를 하고 새로고침해서 나갔다가 들어오면 대화한 게 저장이 안되어있음. 저장되게 해줘. 그래서 새로고침하고 들어와도 대화한 게 유지되게 데베 연결해줘. 그리고 새로고침하고 들어오면 몸이 바닥에 캐릭터 박혀서 머리만 보이거나, 여러 번 복사된 거 처럼 보이는 현상이 있는데 이 부분 캐시문제인지 뭔지 원인 찾고 해결해줘. 이유도 알려줘

## 변경 파일

- `react-app/src/components/DirectRecommendation.tsx`, `react-app/src/chat-fixes.css`
- `react-app/src/pages/GamePage.tsx`, `react-app/src/game/GameCanvas.tsx`, `react-app/src/game/scenes/WorldScene.ts`
- `react-app/server/src/socket/registerSocketHandlers.ts`, `react-app/shared/socket-events.ts`
- `devlog.md`, `devlog/2026-08-09/083-direct-chat-persistence-map-refresh.md`

## 변경 내용 및 원인

- 추천 동의창을 개편하고 분석·검색 진행 단계를 표시했으며, 추천 장소를 중앙 카카오 웹뷰로 열도록 변경했다.
- 메시지는 DB에 쓰고 있었지만 재접속 시 읽는 경로가 없었다. 저장된 채팅방·메시지를 로그인 재접속 시 복원하도록 연결했다.
- 캐릭터 복사는 캐시 문제가 아니라 씬 재시작 뒤 프로젝트실 소켓 리스너가 잔류할 수 있던 문제였다. 씬 종료 시 정리하도록 수정했다.
- 바닥 침투는 서버의 마지막 위치 대신 공용 시작점을 우선 쓰던 초기화 순서 문제였다. 로그인 사용자는 저장 위치를 우선 복원한다.

## 확인 결과

- React/Vite 빌드, 성능 예산 검사, 서버·클라이언트 TypeScript 컴파일 통과
- WIZ 프로젝트 빌드 성공

## 남은 리스크

- 카카오가 장소 페이지의 iframe 정책을 변경하면 지도 SDK 방식으로 전환해야 한다.
- 기존 레거시 채팅방은 참여자 스냅샷이 없어 기본 아바타로 표시될 수 있으나 메시지는 복구된다.
