# 모집글 용어 통일 및 동아리 거리제 공용 등록 연결

- 사용자 요청: 참여 모집 화면을 프로젝트가 아닌 모집글 참가 흐름으로 바꾸고, 동아리 거리제의 동아리 등록도 프로젝트 등록처럼 정상 처리한다.
- 원인: 동아리 거리제 컴포넌트가 운영에서도 `/api/clubs`와 REST POST 응답을 사용해 WIZ 공용 API와 맞지 않았고, 모집 참가 UI에 프로젝트 용어가 남아 있었다.
- 변경 파일: `react-app/src/components/ClubStreetExperience.tsx`, `react-app/src/components/RecruitmentCenterDesk.tsx`, 배포 정적 자산 `src/assets/jochwon-app/`.
- 변경 내용: 동아리 거리제도 WIZ 공용 `/wiz/api/page.home/clubs?action=create`를 사용하고 WIZ 응답 구조를 해석하도록 수정했다. 모집 목록·참가 완료 문구를 모집글·모집자 기준으로 통일했다.
- 확인: React/Vite 빌드 및 성능 검사 통과, `git diff --check` 통과, WIZ `main` 프로젝트 빌드 성공.
