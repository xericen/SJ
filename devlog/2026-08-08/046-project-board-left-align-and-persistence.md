# 프로젝트 둘러보기 좌측 정렬 및 생성 목록 보존

- 원 요청: 프로젝츠가 만들어지는데 프로젝트 둘러보기에도 바로 사라짐 원인찾고 해결해줘..체험용으로 프로필 완성도 50넘는데, 정부청사로 못 들어감 제발 원인 찾고 수정해줘,,,, 진짜 두개 해줘라 좀 안되잖아.. 정확하게 원인파악하고 해줘.. 그리고 프로젝트 둘러보기 전체 좌측정렬로 바꿔줘
- 변경 파일: `react-app/src/services/projectRoomProjects.ts`, `react-app/src/components/ProjectRoomInteractions.css`, `src/assets/jochwon-app/index.html` 및 최신 빌드 assets
- 원인: 공유 저장이 완료되기 전 재조회가 이전 목록을 반환하거나 키오스크 패널이 재마운트될 때, 인증 사용자 프로젝트의 로컬 즉시 스냅샷이 없어 목록이 비어 보일 수 있었습니다.
- 조치: 인증 사용자도 프로젝트 목록을 로컬 즉시 스냅샷으로 저장하고, 서버·메모리·로컬 목록을 병합했습니다. 프로젝트 둘러보기 패널과 카드의 텍스트 정렬을 좌측으로 통일했습니다. 정부청사 잠금 UI는 `buildProfileProgress` 기준을 유지했습니다.
- 확인: React/Vite/TypeScript 및 성능 검증 통과, WIZ 빌드 성공. 운영 index는 `index-Dkx4ELvh.js`를 제공하고 프로젝트 갱신 이벤트·정부청사 50% 문구가 포함된 GamePage 청크를 확인했습니다. `experience-signal-bridge.js` HTTP 200 확인.
