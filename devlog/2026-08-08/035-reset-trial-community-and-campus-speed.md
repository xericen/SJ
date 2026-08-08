# 체험용 커뮤니티 상태 초기화 및 공동캠퍼스 속도 조정

- 원본 요청: 모집센터·동아리거리제 체험용 활동은 공동캠퍼스로 돌아오면 초기화하고 체험 완료만 최근활동에 남기며, 공동캠퍼스 속도를 늦추고 정부청사 포탈을 프로필 50% 이상에서 열어 달라는 요청.
- 변경 파일:
  - `react-app/src/components/RecruitmentCenterDesk.tsx`
  - `react-app/src/components/ClubStreetExperience.tsx`
  - `react-app/src/game/scenes/WorldScene.ts`
- 변경 내용: 게스트 세션에서 모집글·동아리·피드·프로젝트를 맵 이탈 시 정리하고 모집센터/동아리 거리제 완료 신호만 기록한다. 공동캠퍼스 이동 속도는 예술의전당 기준 속도의 1/1.5로 적용했다. 정부청사 이동은 기존 `completion < 50` 차단 로직을 확인했다.
- 검증: `npm run build` 성공 및 성능 예산 검사 통과.
