# 축제 NPC 대화 중 포탈 중복 상호작용 차단

- 원 요청: 축제 부스에 NPC가 축제 보는 키를 가려버림. 인지 안내와 대화하기가 뜬 뒤 대화 중 다시 축제 보기가 실행되는 겹침 현상을 막아달라는 요청.
- 변경 파일: `react-app/src/pages/GamePage.tsx`, `react-app/src/pages/GamePage.css`, `src/assets/jochwon-app/index.html` 및 최신 빌드 assets
- 원인: NPC 채팅을 시작할 때 기존 `encounter`는 해제되지만 `activeNpc`가 입력 잠금 조건에 포함되지 않아, 렌더러의 축제 상호작용 E키 핸들러가 계속 실행될 수 있었습니다.
- 조치: `activeNpc`를 게임 입력 잠금 조건에 포함하고, NPC 대화 상태에서는 포탈/상호작용 안내 UI를 숨겨 대화와 축제 관람 조작이 동시에 활성화되지 않도록 했습니다.
- 확인: React/Vite/TypeScript 및 성능 검증 통과, WIZ 빌드 성공. 운영 번들에 `game-input-lock`과 `is-npc-chat` 코드가 포함되고 `experience-signal-bridge.js` HTTP 200 응답을 확인했습니다.
