# 057 map_activity 기존 레코드 dict 접근 오류 수정

- 요청: 운영 `map_activity?mapId=town&userKey=김민주` HTTP 500 오류 수정.
- 원인: WIZ ORM `db.get()` 결과는 dict인데 기존 레코드 처리에서 `record.id`, `record.payload` 속성 접근을 사용해 재방문 요청에서 예외가 발생했다.
- 변경 파일: `src/app/page.home/api.py`.
- 변경 내용: 기존 사용자 레코드의 `id`·`payload`를 dict 방식으로 읽도록 수정하고, 기존 AI 행동 레코드와 맵 활동 기록을 안전하게 갱신하도록 유지했다.
- 확인: 운영 요청이 `200 application/json`으로 응답하며 `mapId`, `userId`, `visitedAt` 반환; WIZ `main` 프로젝트 빌드 성공; `git diff --check` 통과.
