# 054 map_activity 500 스키마 오류 수정 및 공용 DB 저장 안정화

- 요청: `map_activity?mapId=town&userKey=김민주` 요청의 HTTP 500 오류 해결.
- 원인: `ai_behavior_state` 공용 테이블 모델에 없는 `map_id`, `last_visited` 필드를 INSERT하고 맵별로 길이를 초과할 수 있는 기본 키를 사용하고 있었다.
- 변경 파일: `src/app/page.home/api.py`, `devlog.md`.
- 변경 내용: 사용자 해시 기반 고정 길이 키를 사용하고, 기존 테이블 스키마의 `payload` JSON에 맵별 방문 시각을 저장하도록 변경했다.
- 확인: 운영 URL 요청이 `200 application/json`으로 응답하고 `mapId`, `userId`, `visitedAt`을 반환함; WIZ `main` 프로젝트 빌드 성공; `git diff --check` 통과.
