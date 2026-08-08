# 체험용 프로젝트 변경사항 실시간 공유

- 원본 요청: 체험용 프로젝트실에서 프로젝트 생성·삭제가 다른 브라우저에 연동되지 않으므로 같은 맵의 다른 사용자에게 실시간으로 보이게 해 달라는 요청.
- 변경 파일: `src/app/page.home/api.py`, `react-app/src/services/unifiedProfileApi.ts`, `react-app/src/components/ProjectRoomInteractions.tsx`
- 변경 내용: WIZ 공유 프로젝트 컬렉션에 삭제 action을 추가하고 프로젝트 개인 상태에서도 삭제하도록 연결했다. 프로젝트실이 활성화된 각 클라이언트는 2.5초마다 공유 프로젝트·신청 목록을 갱신해 생성·삭제·신청 상태 변화를 반영한다.
- 검증: `npm run build` 성공 및 성능 예산 검사 통과.
