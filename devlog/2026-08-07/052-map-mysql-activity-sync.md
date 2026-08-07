# 전체 맵 진입 기록 WIZ MySQL 저장 연결

- 사용자 요청: 17개 맵 모두의 DB 연결 상태를 확인하고 누락된 맵 저장 연결을 보완한다.
- 점검 결과: 맵 렌더링·이동은 공통 코드였지만 맵 진입 이력은 브라우저 로컬 프로필 기록에만 남아 WIZ MySQL에 맵별 방문 기록이 없었다.
- 변경 파일: `src/app/page.home/api.py`, `react-app/src/pages/GamePage.tsx`, 배포 정적 자산 `src/assets/jochwon-app/`.
- 변경 내용: 지원 맵 전체를 허용하는 `map_activity` WIZ API를 추가하고, 맵 전환 완료 시 사용자·맵별 마지막 진입 시간을 기존 WIZ 공용 DB에 저장하도록 연결했다.
- 확인: React/Vite 빌드 및 성능 검사 통과, `git diff --check` 통과, 운영 `GET /wiz/api/page.home/map_activity?mapId=town`이 `200 application/json`으로 응답함을 확인했다.
