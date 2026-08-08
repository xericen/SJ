# 프로젝트 둘러보기 및 정부청사 운영 수정

- 원 요청: 체험용 프로젝트실 키오스크에서 만든 프로젝트가 내 프로젝트에는 보이지만 프로젝트 둘러보기에서 사라지는 문제 수정, 프로젝트 둘러보기 전체 버튼 좌측 정렬, 프로필 완성도 50% 초과 시 정부청사 진입 허용 및 수정 여부 재확인.
- 원인: 체험용 프로젝트 목록이 서버 동기화 결과에만 의존해 재조회 시 누락될 수 있었고, 실제 운영 청크에는 정부청사 게이트의 이전 completion 조건이 남아 있었다.
- 변경 파일: `src/assets/jochwon-app/assets/GamePage-CeKDUihu.js`, `src/assets/jochwon-app/assets/GamePage-D_Iw1PKd.js`, `src/assets/jochwon-app/assets/GamePage-BaDhP-75.css` 및 동일 프로젝트 청크의 게이트 조건.
- 변경 내용: 프로젝트 생성 목록을 `sejong-project-room-projects-v1`에 저장하고 운영 조회 결과와 병합한다. 필터 nav를 좌측 정렬한다. 정부청사 이동·잠금 UI는 `completion`과 `profileCompletion` 중 높은 값으로 50% 게이트를 판정한다.
- 확인: WIZ 빌드 성공. 운영 `index-Dkx4ELvh.js`, `GamePage-CeKDUihu.js`, `GamePage-D_Iw1PKd.js`, `GamePage-BaDhP-75.css`를 직접 조회해 프로젝트 저장·병합, `profileCompletion`, 좌측 정렬 CSS가 모두 내려오는 것을 확인했다.
- 남은 리스크: 동일 브라우저에 이미 오래된 번들이 캐시된 경우 강력 새로고침이 필요하다.
