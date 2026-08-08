# React 운영 dist 정적 자산 동기화 및 재배포

- 원본 요청: 예술의전당 포스터별 관심 저장 시 선택한 공연이 최근활동에 정확히 표시되도록 수정하고 운영 반영한다.
- 원인: React 수정 후 `react-app/dist`가 WIZ 정적 자산 `src/assets/jochwon-app`에 동기화되지 않아 운영 URL이 이전 해시 번들을 제공하고 있었다.
- 변경: 최신 `react-app/dist` 산출물을 `src/assets/jochwon-app`에 반영하고 WIZ `main` 프로젝트를 재빌드했다.
- 확인: 운영 index가 `index-0sgRUhdo.js`를 참조하고, 운영 lazy chunk `GamePage-BDCegZtq.js`에서 `performanceTitle` 구현을 확인했다. WIZ 빌드 성공.
- 남은 리스크: 실제 체험 브라우저에서 5개 포스터를 모두 클릭·저장하는 수동 검증은 별도 필요하다.
