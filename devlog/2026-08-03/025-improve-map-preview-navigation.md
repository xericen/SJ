# 비로그인 맵 구경하기 자유 카메라 조작 개선

## 사용자 원문 요청

> 맵 구경하기 눌러서 들어가서 보면, 맵 보는데 너무 힘들어 , 자유롭게 이동이 어려워 이 부분 해결해줘

## 원인

- 맵 구경 모드도 숨겨진 캐릭터의 이동 좌표를 카메라가 따라가는 구조여서 마우스와 터치로 시점을 직접 조작할 수 없었다.
- 화면에는 WASD 안내만 있어 넓은 3D 공간을 이동·회전·확대해 살펴보기 어려웠다.

## 변경 내용

- 구경 모드 전용 자유 카메라를 추가했다.
- 좌클릭 드래그 이동, 우클릭 드래그 회전, 휠 확대·축소, 터치 이동·두 손가락 회전/확대와 WASD 이동을 지원한다.
- Shift 빠른 이동과 `시점 초기화` 버튼을 추가했다.
- 구경 모드에서는 숨겨진 캐릭터의 충돌·포털 이동 대신 카메라만 직접 움직이도록 분리했다.
- 새 빌드 ID `20260803-map-navigation-v2`를 적용하고 빌드 산출물을 WIZ 정적 자산에 반영했다.

## 변경 파일

- `react-app/index.html`
- `react-app/src/game/GameCanvas.tsx`
- `react-app/src/game/renderers/VillageMapRenderer.ts`
- `react-app/src/game/scenes/WorldScene.ts`
- `react-app/src/pages/MapPreviewPage.tsx`
- `react-app/src/pages/MapPreviewPage.css`
- `src/app/page.home/view.pug`
- `src/assets/jochwon-app/`
- `devlog.md`
- `devlog/2026-08-03/025-improve-map-preview-navigation.md`

## 확인 결과

- `npm run build` 성공
- WIZ `main` 프로젝트 일반 빌드 성공
- 공개 운영 번들에서 비로그인 상태로 세종호수공원 `맵 구경하기` 진입 확인
- 실제 Chromium 입력으로 좌클릭 드래그, 우클릭 드래그, 휠 조작 후 각각 WebGL 화면이 변경됨을 확인
- 자유 카메라 캔버스의 `pointer-events: auto`, `touch-action: none` 적용 확인
- 브라우저 콘솔 애플리케이션 오류 없음

## 남은 리스크

- 트랙패드와 기기별 터치 제스처 감도는 브라우저 및 운영체제 설정에 따라 다소 다를 수 있다.
