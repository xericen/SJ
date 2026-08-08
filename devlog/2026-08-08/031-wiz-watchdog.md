# WIZ 런타임 watchdog 상시 재기동 설정

## 사용자 원본 요청

> upstream 연결 오류가 반복되지 않도록 해줘.

## 변경 파일

- `devlog.md`
- `devlog/2026-08-08/031-wiz-watchdog.md`

## 확인 결과

- 반복 원인: 이전 WIZ 프로세스가 임시 세션 종료와 함께 내려가 upstream 포트가 닫힘
- WIZ 런타임을 detached watchdog 프로세스로 실행
- 런타임 종료 시 2초 후 자동 재기동하도록 설정
- 외부 `/home` HTTP 200 확인

## 남은 리스크

- 컨테이너 자체가 재생성되면 watchdog도 사라질 수 있으므로, 최종 운영 환경에서는 systemd·supervisor·컨테이너 entrypoint에 동일한 재기동 정책을 등록해야 합니다.
