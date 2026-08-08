# WIZ upstream 연결 오류 복구 및 운영 API 재검증

## 사용자 원본 요청

> `upstream connect error ... delayed connect error: 111` 오류를 해결해줘.

## 변경 파일

- `src/app/page.home/api.py`: 정상 소스를 WIZ 운영 Source와 번들에 동기화
- `devlog.md`
- `devlog/2026-08-08/029-upstream-connection-recovery.md`

## 확인 결과

- 원인: 운영 번들 `api.py` 첫 줄에 잘못된 `wc` 출력이 삽입되어 Python SyntaxError 발생, WIZ 런타임이 기동하지 않음
- 정상 `api.py`를 WIZ Source에 재동기화
- WIZ 빌드 성공
- WIZ 런타임 재기동
- `https://sj.wizide.com/home` HTTP 200
- 프로젝트 생성 API HTTP 200

## 남은 리스크

- 현재 런타임은 세션에서 직접 기동한 프로세스이므로 컨테이너 재생성 시 동일한 WIZ 시작 절차가 필요할 수 있습니다.
