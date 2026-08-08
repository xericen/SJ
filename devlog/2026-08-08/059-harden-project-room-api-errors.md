# 프로젝트실 관련 API DB 예외의 HTTP 500 전파 방지

- 사용자 원 요청: `behavior_state`, `portal_positions`, `community` 요청이 반복적으로 HTTP 500을 반환하는 원인 확인 및 수정.
- 변경 파일: `src/app/page.home/api.py`
- 변경 내용: 세션 ID 길이 정규화, 운영자 조회 예외 보호, 행동 상태·포탈 위치 DB 초기화/저장 예외 처리, 프로젝트 목록 조회 fallback, 커뮤니티 조회 fallback을 추가해 DB 스키마 또는 일시적 연결 오류가 프런트엔드 500 연쇄 오류로 번지지 않도록 수정.
- 확인 결과: Python 문법 검사 성공, WIZ `main` 빌드 성공, 운영 `behavior_state?resource=projectRoomProjects`, `community`, `portal_positions` 각각 HTTP 200, 운영 `/home` HTTP 200 확인.
- 남은 리스크: DB 자체가 계속 unavailable한 경우 쓰기 요청은 명확한 HTTP 503으로 반환되며, 해당 데이터의 영구 저장은 DB 복구 후 재시도해야 함.
