# 비로그인 체험용 포탈·카메라 편집 UI 노출 및 세션 저장

## 사용자 요청

> 체험용으로 들어가니까 새종호수 공원 포탈 위치 옮기는 거랑, 카메라 각도 조절바 없는데??

## 원인 및 변경 내용

- 편집 UI가 서버의 관리자·포탈 편집자 권한 응답에만 의존해 비로그인 체험용에서 숨겨지던 원인을 수정했다.
- 앱의 `local` 체험 모드를 게임 화면에 명시적으로 전달해 포탈 및 카메라 편집 UI를 즉시 표시한다.
- 비로그인 체험용에서 바꾼 포탈 위치와 카메라 설정은 브라우저 세션 전용 저장소에 보관하고 해당 체험 세션에 즉시 재적용한다.
- 로그인용 관리자 설정과 체험용 설정을 분리해 체험 사용자가 공용 운영 배치를 변경하지 않도록 했다.

## 변경 파일

- `react-app/src/App.tsx`
- `react-app/src/pages/GamePage.tsx`
- `react-app/src/services/worldPortalPositions.ts`
- `react-app/src/services/worldCameraProfiles.ts`
- `react-app/scripts/experiencePortalCustomizer.test.ts`

## 확인 결과

- 관련 회귀 테스트 21건 통과
- React TypeScript, Vite, Node 서버 빌드 성공
- 성능 예산 검사 통과
