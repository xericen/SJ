# 프로젝트 신청 승인 UI·완성 상태·프로젝트실 WASD 좌표계 통일

- 사용자 원 요청: 참여 신청자 승인 UI 개선, 수락 시 참여자 수 증가 및 신청자 제거, 정원 충족 시 프로젝트 완성 표시, 프로젝트실 이동 조작을 로비와 동일하게 수정.
- 변경 파일: `react-app/src/components/ProjectRoomInteractions.tsx`, `react-app/src/components/ProjectRoomInteractions.css`, `react-app/src/game/renderers/VillageMapRenderer.ts`
- 변경 내용: 대기 신청자 전용 카드 UI를 추가하고 처리된 신청자는 목록에서 숨김. 수락 시 `memberIds`와 `status: active`를 함께 저장하며 완성 배너를 표시. 프로젝트실 카메라 회전과 무관하게 WASD 입력을 로비와 동일한 좌표계로 처리.
- 확인 결과: WIZ `main` 빌드 성공, Python 문법 검사 성공, 관련 UI·상태·이동 코드 반영 확인, 운영 `/home?_build=20260808-project-room-ui-v1` HTTP 200 확인.
- 남은 리스크: 실제 브라우저에서 신청 수락 클릭과 WASD 이동의 픽셀·입력 체감 검증은 사용자 환경에서 최종 확인이 필요함.
