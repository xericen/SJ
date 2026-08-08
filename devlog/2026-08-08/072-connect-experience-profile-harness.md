# 공간별 실제 행동 기반 프로필 하네스 및 기억나무 공용 DB 연결

## 사용자 원본 요청

> 세종호수공원에만 들어왔는데 최근활동기록에 모집센터 방문이 뜨는 문제를 수정하고, 예술의전당·먹거리부스·축제부스·베어트리파크·수목원·공동캠퍼스·정부청사의 실제 열람·선택·작성·체험 행동을 하네스 구조로 분석해 키워드, 관심사 레이더, 성장 히스토리, 최근 활동 기록에 반영해 주세요. 기억나무의 모두의 기억은 DB에 저장하고 불러올 수 있게 해 주세요. 포토존·전망대·스마트시티는 최근 활동에만 반영해 주세요.

## 변경 파일

- `react-app/src/components/RecruitmentCenterDesk.tsx`
- `react-app/src/components/CampusStudentHall.tsx`
- `react-app/src/components/ClubStreetExperience.tsx`
- `react-app/src/components/ProjectRoomInteractions.tsx`
- `react-app/src/components/GreenhouseExperience.tsx`
- `react-app/src/components/AiSejongProfile.tsx`
- `react-app/src/services/campusProfileSignals.ts`
- `react-app/src/services/experienceHarness.ts`
- `react-app/src/services/profileProgress.ts`
- `react-app/src/services/publicGreenhouseMemories.ts`
- `react-app/src/runtimeBuild.ts`
- `react-app/scripts/experienceProfileHarness.test.ts`
- `src/app/page.home/api.py`
- `src/app/page.home/view.pug`
- `src/assets/jochwon-app/index.html`
- `src/assets/jochwon-app/assets/` 빌드 산출물
- `devlog.md`
- `devlog/2026-08-08/072-connect-experience-profile-harness.md`

## 변경 내용

- 모든 지도 이동을 모집센터·학생회관·동아리 거리제 방문으로 오기록하던 전역 리스너를 제거하고 기존 오기록도 프로필에서 제외했습니다.
- 모집글 열람·AI 리크루터 대화·작성·신청, 학생 프로필 열람·대화, 동아리 열람·활동·창설, 프로젝트 열람·신청·창설·아이디어·역할을 실제 행동 신호로 기록합니다.
- 수목원 식물 관찰·채집·5/10/14종 자연 성향 분석·기억나무 작성을 개별 하네스 활동으로 기록합니다.
- 베어트리 포토존, 정부청사 전망대, 스마트시티 활동은 최근 기록에만 표시하고 성장 포인트·레이더 분석에서 제외합니다.
- 공개 기억나무 기록을 WIZ `ai_behavior_state` 공용 컬렉션에 저장·조회하도록 연결했습니다.

## 확인 결과

- 신규 회귀 테스트 3건 통과
- 수목원 테스트 통과
- 공동캠퍼스 포탈 테스트 13건 통과
- 동아리 거리제 테스트 2건 통과
- React/TypeScript/Vite/서버 전체 빌드 및 성능 예산 검사 통과
- WIZ Python API 문법 검사 및 WIZ 프로젝트 clean 빌드 성공
- 운영 엔트리 `index-AoB_MmLk.js` HTTP 200 및 새 빌드 식별자 확인
- 운영 기억나무 DB API 조회 HTTP 200, 임시 기록 생성·조회·삭제 확인

## 남은 리스크

- 실제 사용자별 키워드와 레이더 값은 각 공간에서 새 행동을 수행한 뒤부터 누적됩니다.
