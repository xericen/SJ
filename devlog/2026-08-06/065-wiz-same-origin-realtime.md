# WIZ 동일 출처 실시간 멀티플레이 운영 연결

- **ID**: 065
- **날짜**: 2026-08-06
- **유형**: Socket.IO·인증·DB·운영 배포
- **리뷰 ID**: vtjcrqojezwksnlbpmfmhxxpawprygtr

## 작업 요약

외부 Render 주소와 별도 프록시 대신 WIZ가 기본 제공하는 앱 전용 Socket.IO 네임스페이스를 사용하도록 운영 구조를 전환했다. `page.home` 소켓 컨트롤러가 맵별 입장·이동·이모티콘·채팅·그룹을 처리하며, WIZ 로그인 세션을 사용한 1:1 채팅 요청과 영속 SQLite 메시지 저장 경로도 추가했다. React 운영 번들은 동일 출처의 `/wiz/app/main/page.home`에 연결하고 WIZ 정적 자산으로 게시했다.

## 원문 요청사항

```text
남은 리스크
로그인 연동, DB 저장, 개인 메시지는 실시간 전용 모드에서 비활성화됩니다.
변경 사항은 아직 Git 푸시 및 Render 실제 배포 전입니다.
배포 주소 발급 후 VITE_SOCKET_URL 적용과 프런트 재배포가 필요합니다. 해봐봐
```

## 변경 파일 목록

- `src/app/page.home/socket.py`
  - WIZ 앱 전용 네임스페이스에 맵 방, 사용자 입장·퇴장, 이동, 이모티콘, 주변·그룹 채팅과 로그인 기반 1:1 채팅 이벤트를 구현했다.
  - 사설 MySQL 장애와 무관하게 `runtime/realtime-chat.sqlite3`에 채팅방과 메시지를 저장하도록 구성했다.
- `react-app/src/config/api.ts`
  - 운영 빌드의 기본 소켓 주소를 동일 출처 WIZ 네임스페이스로 설정했다.
- `react-app/src/runtimeBuild.ts`, `src/app/page.home/view.pug`, `src/assets/jochwon-app/`
  - 런타임 빌드 ID를 `20260806-wiz-realtime-v162`로 올리고 새 React 번들을 운영 자산에 동기화했다.
- `devlog.md`, `devlog/2026-08-06/065-wiz-same-origin-realtime.md`
  - 이번 변경과 검증 결과를 기록했다.

## 확인 결과

- WIZ 소켓 및 DB 모델 Python 구문 검사 통과
- React·Express 전체 빌드와 프런트 성능 예산 검사 통과
- WIZ 프로젝트 일반 빌드 및 실행 서버 소켓 재바인딩 성공
- 로컬 WIZ에서 두 WebSocket 클라이언트 입장·이동·주변 채팅·맵 격리 검증 통과
- 운영 `sj.wizide.com`에서 두 WebSocket 클라이언트 입장·이동·맵 격리 검증 통과
- 운영 비로그인 사용자의 1:1 채팅 로그인 요구 검증 통과
- SQLite 채팅방·메시지 저장 및 채팅방 종료 상태 갱신 검증 통과
- 운영 `main.js`와 런타임 index의 v162 제공 및 HTTP 200 확인
- React `dist`와 WIZ 운영 정적 자산 144개 파일 일치 확인

## 남은 리스크

- 인증된 브라우저 두 개로 1:1 채팅을 수락하는 전체 화면 흐름은 운영 계정 쿠키가 없어 자동 검증하지 못했다.
- SQLite 저장소는 현재 단일 WIZ 인스턴스에 적합하다. 여러 서버 인스턴스로 확장할 때는 공유 DB와 Socket.IO 어댑터가 필요하다.
