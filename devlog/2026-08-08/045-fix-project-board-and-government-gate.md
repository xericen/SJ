# 프로젝트 둘러보기 재조회 보존 및 정부청사 50% 게이트 운영 반영

- 원 요청: 프로젝츠가 만들어지는데 프로젝트 둘러보기에도 바로 사라짐 원인찾고 해결해줘..체험용으로 프로필 완성도 50넘는데, 정부청사로 못 들어감 제발 원인 찾고 수정해줘,,,, 진짜 두개 해줘라 좀 안되잖아.. 정확하게 원인파악하고 해줘
- 변경 파일: `react-app/src/services/projectRoomProjects.ts`, `react-app/src/pages/GamePage.tsx`, `src/assets/jochwon-app/index.html` 및 최신 빌드 assets
- 원인: 프로젝트 생성 직후 서버 재조회가 이전 스냅샷을 반환해 현재 프로젝트 목록을 덮어쓸 수 있었고, 정부청사 UI 잠금 표시가 프로필 화면과 다른 계산기(`buildAiSejongProfile`)를 사용했습니다.
- 조치: 현재 사용자 소유 프로젝트를 재조회 결과에 병합해 서버 반영 전에도 둘러보기에서 유지하고, 정부청사 포탈 잠금 UI도 프로필 화면과 동일한 `buildProfileProgress` 기준(50% 미만만 차단)으로 통일했습니다.
- 확인: React/Vite/TypeScript 빌드와 성능 검증 통과, WIZ 빌드 성공. 운영 index가 `index-7kd1CH2b.js`를 제공하고 해당 GamePage 청크에 프로젝트 갱신 이벤트·정부청사 50% 문구가 포함됨. `experience-signal-bridge.js` HTTP 200 확인.
