# WIZ 공용 커뮤니티·동아리 저장 API 연결

- 사용자 요청: 브라우저별 로컬 저장이 아닌 운영 API를 연결해 모집글을 여러 사용자와 공유한다.
- 원인: 운영 `/api` 경로가 앱 HTML fallback을 반환했고 WIZ `page.home`에 커뮤니티·동아리 API가 없었다.
- 변경 파일: `src/app/page.home/api.py`, `react-app/src/config/api.ts`, `react-app/src/pages/CommunityPage.tsx`, `react-app/src/components/RecruitmentCenterDesk.tsx`, 배포 정적 자산 `src/assets/jochwon-app/`.
- 변경 내용: 기존 WIZ 공용 DB 테이블을 재사용해 공유 데이터를 저장하는 `community`·`clubs` API를 추가하고, 운영 프런트가 `/wiz/api/page.home`의 공용 API를 사용하도록 연결했다. 기존 로컬 fallback은 운영 API 장애 대비용으로 유지했다.
- 확인: React/Vite 빌드 및 성능 검사 통과, `git diff --check` 통과, WIZ `main` 프로젝트 빌드 성공, 운영 `GET /wiz/api/page.home/community`가 `200 application/json`으로 응답함을 확인했다.
