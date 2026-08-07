# WIZ 운영 API 부재 대응 및 동아리·모집글 로컬 저장 보강

- 사용자 요청: `feature_collector.js` deprecated 초기화 경고와 함께 새 동아리 생성 및 모집글 변경이 되지 않는 원인을 찾아 해결한다.
- 원인: 운영 주소의 `/api/clubs`, `/api/community`가 Express API가 아니라 React HTML fallback을 반환해 JSON 파싱이 실패했다. `feature_collector.js`의 deprecated parameters 메시지는 앱 소스가 아닌 외부 리뷰 수집 SDK 경고로 확인했다.
- 변경 파일: `react-app/src/pages/CommunityPage.tsx`, `react-app/src/components/RecruitmentCenterDesk.tsx`, 배포 정적 자산 `src/assets/jochwon-app/`.
- 변경 내용: 운영 API가 HTML을 반환하거나 연결되지 않을 때 동아리와 모집글을 브라우저 로컬 저장소에 저장·조회하도록 보강했다. 모집센터도 이 로컬 모집글을 추천 데이터에 포함한다.
- 확인: React/Vite 빌드 및 성능 검사 통과, `git diff --check` 통과, WIZ `main` 프로젝트 빌드 성공.
