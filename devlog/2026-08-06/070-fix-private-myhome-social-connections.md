# 마이홈 포탈·개인 인스턴스 및 상호 친구·단일 채팅방 수정

- **ID**: 070
- **날짜**: 2026-08-06
- **유형**: 마이홈·Socket.IO·친구·채팅·WIZ 운영
- **리뷰 ID**: cbupikfgnxpmqlzegbqgvmhxwhnvmtwu

## 작업 요약

원본 최신 개인홈 구현에서 누락된 호수공원·수목원·베어트리파크 포탈을 `마이홈` 명칭으로 복원했다. WIZ Socket.IO는 마이홈을 사용자 ID별 개인 방으로 분리하고, 같은 두 계정의 1:1 채팅방 ID를 재사용하도록 변경했다. 기존 브라우저 로컬 토글 방식 친구 기능은 서버 친구 요청·수락·거절·삭제와 SQLite 영속 관계로 교체했다. 원본의 게스트 메모리 개인팜도 복원했다.

## 원문 요청사항

```text
# ReviewOps Codex 작업 요청

아래 요청을 현재 프로젝트 루트에서 처리하세요. 필요한 파일을 직접 수정하고, 마지막 응답은 한국어로 간결하게 작성하세요.
스트리밍 응답은 사용하지 않습니다. 작업이 끝난 뒤 변경 요약, 확인한 내용, 남은 리스크만 정리하세요.
이 작업의 세션 단위는 아래 리뷰 ID입니다. 리뷰 ID가 같으면 같은 Codex 히스토리 맥락으로 이어서 처리하세요.

## 사용자 요청

이거 지금 마이 홈에 수목원 가는거랑 호수공원 가는 포탈 그리고 베어트리파크 포탈 있어야되는데 지금 없고 그리고 채팅한거 채팅방 하나씩 떠야되는데 함께 만든 연결에 한번 ㅇ녀결할때마다 채팅방 하나씩 계속 나오고 친구 내친구 할때 친구 요청 보냈다 하고 친구를 받아줘야되는데 단방향으로ㅓ 친구가 되고 마이홈은 각자 개인공간인데 다른 사람이랑 공유하면 안되는데 이것도 잘못된거같고 맵 화면을 깃에서 가져오라했는데 이게 반영이 잘못된거같아서 이거 수정해줘야될거같아 마이홈에 대한거 전부다  가져와줘야돼 개인홈으로 되어있는거 누락되지 않게 전부 가져와줘

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

- `react-app/src/game/renderers/VillageMapRenderer.ts`
  - 원본 마이홈 좌표의 호수공원·수목원·베어트리파크 포탈 3개를 복원했다.
- `src/app/page.home/socket.py`
  - 마이홈을 인증 사용자 ID별 방으로 분리하고 게스트는 소켓별로 격리했다.
  - 같은 두 사용자 사이의 기존 1:1 채팅방을 SQLite에서 찾아 재사용하도록 변경했다.
  - 친구 요청·수락·거절·삭제 및 상호 친구 SQLite 저장을 추가했다.
- `react-app/shared/socket-events.ts`, `react-app/src/pages/GamePage.tsx`, `react-app/src/pages/GamePage.css`
  - 친구 요청 UI와 수락 알림, 상호 친구 상태, 중복 없는 `함께 만든 연결` 채팅방 목록을 추가했다.
- `react-app/src/services/guestPersonalFarmProgress.ts`, `react-app/src/services/personalFarmApi.ts`, `react-app/src/game/GameCanvas.tsx`, `react-app/src/components/PersonalFarmProgressExperience.tsx`, `react-app/src/components/PersonalFarmGuide.css`
  - 원본의 게스트 메모리 개인팜 진행도와 수집·식재·제거·먹이 체험을 복원했다.
- `react-app/scripts/verifyWizSocketSource.py`, `react-app/scripts/verifyWizDirectChat.ts`, `react-app/scripts/personalFarmLatest.test.ts`, `react-app/scripts/personalFarmPortals.test.ts`, `react-app/scripts/socialProfileActions.test.ts`, `react-app/package.json`
  - 개인홈 격리·친구 수락·채팅방 재사용·포탈·게스트 개인팜 검증을 추가했다.
- `react-app/src/runtimeBuild.ts`, `src/app/page.home/view.pug`, `src/assets/jochwon-app/`
  - 런타임 ID를 `20260806-private-myhome-v167`로 갱신하고 WIZ 정적 자산을 동기화했다.
- `devlog.md`, `devlog/2026-08-06/070-fix-private-myhome-social-connections.md`
  - 이번 작업과 실제 검증 한계를 기록했다.

## 확인 결과

- 원본과 현재 마이홈 GLB SHA-256 일치 확인
- 마이홈 포탈 테스트 3개 통과
- 최신 개인팜·게스트 진행도 테스트 5개 통과
- 기존 마이홈 상호작용 회귀 테스트 10개 통과
- 소셜 프로필·친구 UI 테스트 6개 통과
- 격리 실행 WIZ 소켓에서 서로 다른 사용자 마이홈 분리, 친구 양방향 수락, 동일 채팅방 ID 재사용 검증 통과
- 실제 MySQL 연결을 포함한 서버 테스트 60개 통과
- React·Express 전체 빌드와 성능 예산 검사 통과
- React `dist`와 WIZ 정적 자산 전체 일치 확인
- WIZ 프로젝트 일반 빌드 성공
- 운영 `sj.wizide.com`에서 런타임 `v167`과 정적 자산 HTTP 200 확인

## 미완료 및 남은 리스크

- 현재 실행 중인 로컬·운영 WIZ Socket.IO 프로세스는 시작 시 바인딩한 이전 이벤트 목록을 유지한다. `friendRequestReceived` 실제 두 계정 테스트는 두 환경 모두 타임아웃되어 운영 완료로 판정하지 않았다.
- 소켓 소스 변경을 실제 운영에 활성화하려면 WIZ 런타임을 재기동해야 한다. 프로젝트 지침에 따라 Codex가 실행 서버를 재시작하지는 않았다.
- 재기동 후 실제 두 계정으로 개인 마이홈 격리, 친구 요청·수락, 동일 상대 채팅방 재사용을 다시 검증해야 한다.
- 게스트 개인팜 진행도는 브라우저 접속 종료 시 초기화된다. 로그인 사용자의 진행도만 영구 저장된다.
