# 친구 기존 채팅방 재사용·연락 알림·재요청 흐름 구현

- **ID**: 087
- **날짜**: 2026-08-06
- **유형**: Socket.IO·친구·1:1 채팅·알림
- **리뷰 ID**: cbupikfgnxpmqlzegbqgvmhxwhnvmtwu

## 작업 요약

친구이며 활성 1:1 채팅방이 있는 상대에게는 새 수락 요청을 보내지 않고 기존 방을 열도록 변경했다. 채팅창 닫기는 방을 유지하고, 별도 `채팅방 나가기` 또는 친구 삭제는 방을 비활성화해 다음 연락 때 다시 요청하도록 분리했다. 닫힌 채팅창으로 메시지가 도착하면 `OO님이 연락을 보냈습니다.` 알림과 읽지 않은 메시지 수를 표시한다.

## 원문 요청사항

```text
# ReviewOps Codex 작업 요청

아래 요청을 현재 프로젝트 루트에서 처리하세요. 필요한 파일을 직접 수정하고, 마지막 응답은 한국어로 간결하게 작성하세요.
스트리밍 응답은 사용하지 않습니다. 작업이 끝난 뒤 변경 요약, 확인한 내용, 남은 리스크만 정리하세요.
이 작업의 세션 단위는 아래 리뷰 ID입니다. 리뷰 ID가 같으면 같은 Codex 히스토리 맥락으로 이어서 처리하세요.

## 사용자 요청

친구인 사람한테는 더이상 1대1 채팅 요청하지 않고 원래 있던 채팅창 사용해서 채팅하는걸로 하고 친구를 끊거나 채팅창을 나가버리면 그때 또 요청하는걸로 바꿔줘 만약에 기존 채팅방이 있어서 거기에 연락을 보냈으면 알림이 오는 형식으로 바꿔줘 OO이 연락을 보냈습니다. 이런식으로

## 리뷰 요약

- 리뷰 ID: cbupikfgnxpmqlzegbqgvmhxwhnvmtwu
- 제목: 멀티 서버
- 요청 링크: https://sj.wizide.com/home
- Codex 요청자: 김민주
- 프로젝트 루트: /opt/app
- Codex 세션 ID: 019fd6d8-3aa9-79e0-ae35-29e6e3ccfd59
- Codex 모델: 5.6 sol (gpt-5.6-sol)
- Codex 추론수준: medium (medium)
- 스크린샷 컨텍스트: 없음
- 에이전트 작업 지시서 컨텍스트: 없음
- HTML 문서 생성 규칙 컨텍스트: 없음
- HTML 문서 설정 컨텍스트: 없음
- HTML 프로젝트 인스트럭션 파일: 없음
- 첨부파일 컨텍스트: 0개

## 세션 처리

저장된 Codex 세션을 resume해 이전 대화 맥락을 우선 사용하세요. 이전 Codex 히스토리는 이 요청에 포함되지 않습니다.
```

## 변경 파일 목록

- `src/app/page.home/socket.py`
  - 친구 관계와 활성 채팅방을 확인해 기존 방을 즉시 재개한다.
  - 친구 삭제 시 해당 두 사용자의 채팅방을 종료한다.
  - 채팅방 나가기 이후에는 다음 대화에서 다시 요청·수락하도록 처리한다.
- `react-app/shared/socket-events.ts`
  - 기존 채팅방 제공과 재요청 상태 이벤트 계약을 추가했다.
- `react-app/src/pages/GamePage.tsx`, `react-app/src/pages/GamePage.css`
  - 친구의 활성 로컬 채팅방을 요청 없이 열고, 창 닫기와 채팅방 나가기를 분리했다.
  - 비활성 채팅창 메시지에 `OO님이 연락을 보냈습니다.` 알림과 읽지 않은 수를 추가했다.
  - 친구 삭제 시 기존 방을 제거하고 서버에도 종료를 전송한다.
- `react-app/scripts/verifyWizSocketSource.py`, `react-app/scripts/verifyWizDirectChat.ts`, `react-app/scripts/socialProfileActions.test.ts`
  - 친구 방 즉시 재개, 나가기 후 재요청, 친구 삭제 시 종료, 연락 알림 계약을 검증했다.
- `react-app/src/runtimeBuild.ts`, `src/app/page.home/view.pug`, `src/assets/jochwon-app/`
  - 런타임 ID를 `20260806-friend-chat-resume-v183`으로 갱신하고 정적 자산을 동기화했다.
- `devlog.md`, `devlog/2026-08-06/087-friend-chat-resume-notification.md`
  - 이번 변경과 검증 결과를 기록했다.

## 확인 결과

- 격리 WIZ 소켓에서 친구 활성 채팅방 요청 생략·동일 방 재개 검증 통과
- 채팅방 나가기 후 새 요청 생성·수락 검증 통과
- 친구 삭제 시 채팅방 종료 및 다음 연락 재요청 검증 통과
- 소셜·채팅 UI 테스트 7개 통과
- React·Express 전체 빌드와 성능 예산 검사 통과
- WIZ 프로젝트 일반 빌드 성공
- React `dist`와 WIZ 정적 자산 전체 일치 확인
- 운영 `sj.wizide.com`에서 런타임 `v183`과 정적 자산 HTTP 200 확인

## 미완료 및 남은 리스크

- 실행 중인 로컬 WIZ Socket.IO 프로세스는 이전 이벤트 바인딩을 유지해 실제 두 계정 검증이 `friendRequestReceived` 단계에서 타임아웃됐다.
- 운영에서 서버 기반 친구·채팅방 재개를 활성화하려면 WIZ 런타임 재기동 후 실제 두 계정 검증이 필요하다. 프로젝트 지침에 따라 Codex가 실행 서버를 재시작하지는 않았다.
- 현재 연락 알림은 게임 화면 내부 알림이다. 브라우저가 닫힌 상태의 운영체제 푸시 알림은 포함하지 않는다.
