# 모집센터·학생회관 완료 활동 및 모집 관리 보강

- 원본 요청: 모집 신청 완료 화면의 모집센터 귀환 버튼 제거, 새 모집글을 내 모집 관리에 저장, 작성·참가·방문을 최근활동과 프로필에 반영하고 학생회관도 방문 완료 활동을 남긴다.
- 변경 파일:
  - `react-app/src/components/RecruitmentCenterDesk.tsx`
  - `react-app/src/components/CampusStudentHall.tsx`
- 변경 내용: 참가 완료 화면의 귀환 버튼을 두 표시 경로에서 제거했다. 모집글 작성 시 체험용 로컬 프로젝트와 `create-recruitment` 캠퍼스 signal을 생성하고, 모집센터 닫기 시 방문 완료 signal을 생성한다. 학생회관 닫기 시 `학생회관 방문 완료` signal을 생성한다.
- 확인: React production build, 서버 TypeScript build, WIZ `main` build 성공. 캠퍼스 테스트 14개 통과; 기존 정부청사 포탈 테스트 1개는 기존 코드의 `chargeSeconds` 누락 기대값으로 실패했다.
- 남은 리스크: 실제 체험용 브라우저에서 모집글 작성 후 ‘내 모집 관리’ 목록과 프로필 최근활동·키워드·레이더를 직접 확인해야 한다.
