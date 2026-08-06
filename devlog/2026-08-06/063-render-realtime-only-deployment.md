# Render 실시간 전용 배포 구성

- **ID**: 063
- **날짜**: 2026-08-06
- **유형**: 배포·Socket.IO·운영 설정
- **리뷰 ID**: vtjcrqojezwksnlbpmfmhxxpawprygtr

## 작업 요약

현재 MySQL이 사설 네트워크 주소라 Render에서 접근할 수 없는 환경에 맞춰 Node 서버에 실시간 전용 모드를 추가했다. Render Blueprint는 별도 비밀값 입력 없이 배포되며, 이 모드에서는 MySQL 연결을 건너뛰고 캐릭터 입장·이동·근처 채팅·이모티콘·맵 격리 기능을 제공한다.

## 원문 요청사항

```text
내꺼에 맞춰서 작성해주라
```

## 변경 파일 목록

- `render.yaml`
  - MySQL 및 세션 비밀값 입력 항목을 제거하고 `REALTIME_ONLY_MODE=true`를 설정했다.
- `react-app/server/src/config/env.ts`
  - 실시간 전용 모드 환경 변수를 추가했다.
- `react-app/server/src/index.ts`
  - 실시간 전용 모드에서 DB 연결·인증 조회·포탈 DB 동기화를 건너뛰고 준비 상태를 정상 반환하도록 변경했다.
- `react-app/scripts/verifyMultiplayer.ts`
  - MySQL 없이 실시간 전용 모드로 멀티플레이 검증 서버를 실행하도록 변경했다.
- `react-app/server/.env.example`, `react-app/deploy/README.md`
  - 환경 변수 예시와 현재 Render 배포 절차 및 기능 범위를 문서화했다.
- `devlog.md`, `devlog/2026-08-06/063-render-realtime-only-deployment.md`
  - 이번 변경과 검증 결과를 기록했다.

## 확인 결과

- 서버 TypeScript 타입 검사 통과
- 서버 TypeScript 빌드 통과
- 두 WebSocket 클라이언트의 입장·이동·근처 채팅·맵 격리 자동 검증 통과
- `render.yaml` 파싱 및 Blueprint 비밀값 입력 항목 제거 확인
- 빌드된 서버 엔트리 구문 검사 통과
- `git diff --check` 통과

## 남은 리스크

- 실시간 전용 모드에서는 로그인 계정 연동, DB 저장, 개인 메시지 등 MySQL 기반 기능을 사용할 수 없다.
- Render 무료 인스턴스의 콜드 스타트와 재시작 시 메모리 기반 방 상태 초기화가 발생할 수 있다.
- Render 배포 후 발급된 주소를 `VITE_SOCKET_URL`에 적용해 WIZ 프런트를 다시 빌드·게시해야 한다.
