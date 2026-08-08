# 모집글 생성 ID 누락으로 내 모집 관리가 0건인 문제 수정

- 원 요청: 모집센터에서 작성한 모집글이 내 모집 관리에 0개로 표시되는 문제 수정.
- 원인: community 생성 API가 필수 `id`가 없는 payload를 거절했고, 성공 응답이 배열이 아닌 경우에도 생성 프로젝트를 복원하지 못함.
- 변경 파일: `react-app/src/components/RecruitmentCenterDesk.tsx`.
- 변경 내용: 생성 payload에 고유 ID와 생성 시각을 포함하고, 배열·객체 응답 모두에서 생성 게시물을 프로젝트로 변환.
- 확인: React 빌드 및 WIZ 운영 배포 후 운영 번들 문자열 확인.
