# WIZ 런타임 지속 세션 재기동 및 upstream 재확인

## 사용자 원본 요청

> `upstream connect error ... delayed connect error: 111` 오류가 계속 발생한다.

## 변경 파일

- `devlog.md`
- `devlog/2026-08-08/030-runtime-persistent-session.md`

## 확인 결과

- 원인: WIZ 런타임 프로세스가 종료되어 upstream 포트가 닫힌 상태
- WIZ 서버를 지속 실행 세션으로 재기동
- `https://sj.wizide.com/home` HTTP 200 확인

## 남은 리스크

- 이 실행 세션이 종료되면 upstream 오류가 재발할 수 있으므로 운영 환경의 프로세스 관리자에 WIZ 런타임을 등록해야 한다.
