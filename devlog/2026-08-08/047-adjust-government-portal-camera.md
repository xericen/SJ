# 정부청사 포탈·카메라 조정

- 원 요청: 정부청사에 있는 포탈크기 2/3정도로 줄여주라. 그리고 캐릭터 크기를 조금 키워줘, 카메라랑 캐릭터 사이 좁혀줘
- 변경 파일: `react-app/src/game/campusPortalVisual.ts`, `react-app/src/game/fixedWorldCameraProfiles.ts`, `react-app/src/game/worldNavigationProfile.ts`, `src/assets/jochwon-app/index.html` 및 최신 빌드 assets
- 조치: 정부청사 포탈에 원형 통합 비주얼 스케일 `2/3`을 적용했습니다. 정부청사 카메라 프로필은 캐릭터 높이 65→78, 카메라 거리 770→650으로 조정했습니다.
- 확인: React/Vite/TypeScript 및 성능 검증 통과, WIZ 빌드 성공. 운영 index가 `index-BeNWstdU.js`를 제공하고 GamePage 청크에 `characterHeight:78`, `cameraDistance:650`, `2/3`가 포함된 것을 확인했습니다. `experience-signal-bridge.js` HTTP 200 확인.
