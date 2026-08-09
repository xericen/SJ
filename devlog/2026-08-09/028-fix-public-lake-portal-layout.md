# 세종호수공원 포탈 공용 위치 고정

## 사용자 요청

체험용에서 직접 옮긴 세종호수공원 포탈 5개의 현재 위치를 모든 사용자에게 동일하게 적용하고, 위치 이동 버튼과 카메라 조절 바를 제거한다.

## 변경 파일

- `react-app/src/game/lakeParkPortals.ts`
- `react-app/src/pages/GamePage.tsx`
- `react-app/src/runtimeBuild.ts`
- `src/app/page.home/view.pug`

## 확인 결과

- 서버 공용 저장소에서 현재 포탈 좌표 5개 확인
- 코드 기본 좌표를 공용 저장 좌표와 동일하게 변경
- 세종호수공원 포탈·카메라 편집 조건 비활성화
- React/Vite 및 WIZ 빌드 결과 확인
