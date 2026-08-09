# 체험 프로젝트 세션 정리·신청 전달 및 목록 UI 정비

## 사용자 요청

> 체험용 프로젝트는 다른 사용자가 둘러보고 신청할 수 있지만 만든 사용자가 공동캠퍼스로 나가면 삭제하고, 신청 전달 오류와 과도한 목록·모집글 표기·필터 시작 위치를 수정해 주세요.

## 변경 내용

- 체험 사용자가 이번 프로젝트실 세션에서 만든 프로젝트만 추적하고 공동캠퍼스로 나갈 때 공용 DB·로컬 목록에서 삭제한다.
- 프로젝트 삭제 시 연결된 참여 신청도 함께 삭제한다.
- 참여 신청 생성·조회·승인 상태 변경을 `projectRoomApplications` 전용 WIZ DB API로 통일했다.
- 프로젝트 목록은 사진찍기·국립세종수목원·전통시장 3개만 남도록 기존 시험 데이터를 정리한다.
- 카드의 `모집글` 표기를 `프로젝트`로 바꾸고 필터 행이 검색창 아래 왼쪽에서 시작하도록 초기 스크롤을 보정했다.

## 변경 파일

- `react-app/src/components/ProjectRoomInteractions.tsx`
- `react-app/src/components/ProjectRoomInteractions.css`
- `react-app/src/services/unifiedProfileApi.ts`
- `react-app/src/runtimeBuild.ts`
- `react-app/scripts/projectRoomPersistence.test.ts`
- `src/app/page.home/api.py`
- `src/model/db/project_room_application.py`
- `src/model/struct.py`
- `src/app/page.home/view.pug`
- `src/assets/jochwon-app/`
- `devlog.md`

## 확인 결과

- 프로젝트실 회귀 테스트 5건 통과
- React TypeScript·Vite·Node 서버 빌드 및 성능 예산 검사 통과
- WIZ `main` 빌드 및 운영 프로젝트 API 목록 확인
