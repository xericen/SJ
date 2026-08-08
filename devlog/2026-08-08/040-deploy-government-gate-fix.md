# 정부청사 게이트 운영 반영

- 원 요청: 다시 원인 확인해봐 아직도 안 들어가짐,, 위즈 배포된건가? 빌드만하지말고.
- 원인: 이전 수정 대상 `GamePage-CRcC7DUd.js`는 운영 엔트리에서 사용되지 않았고, 실제 운영 청크 `GamePage-CeKDUihu.js` 및 `GamePage-D_Iw1PKd.js`에 기존 `completion<50` 조건이 남아 있었다.
- 변경 파일: `src/assets/jochwon-app/assets/GamePage-CeKDUihu.js`, `src/assets/jochwon-app/assets/GamePage-D_Iw1PKd.js` 및 동일 게이트가 포함된 GamePage 청크 6개.
- 변경 내용: 맵 이동 핸들러와 포탈 잠금 UI 모두 계산된 completion과 `profileCompletion` 중 높은 값을 사용하도록 수정했다.
- 확인: WIZ 빌드 성공. `https://sj.wizide.com`에서 최신 인덱스와 실제 운영 청크를 조회해 두 청크 모두 `profileCompletion` 조건이 내려오는 것을 확인했다.
- 남은 리스크: 브라우저 캐시가 오래된 청크를 유지할 수 있으므로 강력 새로고침 후 실제 클릭 확인이 필요하다.
