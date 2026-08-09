# 체험용 포탈 배치 공용 승격 및 공개 프로젝트 DB 유지

## 사용자 요청

> 우선 내 체험용에만 세종호수 공원 포탈 위치 변경되어있는데 모든 사람 체험용 포탈위치도 내꺼랑 동일하게 보이게 공용으로 픽스해주고, 체험용으로 내가 프로젝트실 와서 프로젝트 만들었는데, 다른 사람이 새로 웹에 프로젝트실 들어가서 프로젝트 둘러보기 누르면 내 프로젝트 안 뜸 이 부분 해결해줘

## 원인 및 변경 내용

- 체험용 브라우저에 고정된 자연 맵 포탈 위치를 WIZ 공용 포탈 DB로 한 번 승격하고 이후 잠그는 경로를 추가했다.
- 다른 체험 사용자는 공용 DB의 동일한 포탈 위치를 불러오게 했다.
- 비로그인 사용자가 프로젝트실을 나갈 때 자신이 만든 프로젝트를 공용 DB와 로컬에서 자동 삭제하던 정리 로직을 제거했다.
- 공개 체험 프로젝트는 게스트 소유자로 WIZ 프로젝트 DB에 유지되고 다른 사용자의 프로젝트 둘러보기 갱신에 포함되게 했다.
- 프로젝트 저장 요청의 중복 전송과 초기 시드 경쟁으로 전체 목록이 빈 배열이 되던 DB 예외도 방지했다.
- WIZ의 정상 응답 예외까지 일반 오류로 잡아 빈 목록으로 바꾸던 API 래퍼를 제거했다.

## 변경 파일

- `react-app/src/services/worldPortalPositions.ts`
- `src/app/page.home/api.py`
- `react-app/src/components/ProjectRoomInteractions.tsx`
- `react-app/src/game/GameCanvas.tsx`
- `react-app/src/services/unifiedProfileApi.ts`
- `react-app/scripts/experiencePortalCustomizer.test.ts`
- `react-app/scripts/projectRoomPersistence.test.ts`

## 확인 결과

- 관련 회귀 테스트 24건 통과
- React TypeScript, Vite, Node 서버 빌드 성공
- 성능 예산 검사 통과
