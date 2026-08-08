# 최신 React 번들을 WIZ 운영 자산에 동기화·배포

- 원본 요청: 코드 수정 완료 후에도 `https://sj.wizide.com/home`에 변경 사항이 보이지 않으므로 운영 URL이 최신 번들을 제공하도록 원인 확인 및 배포.
- 원인: 운영 iframe의 `index.html`이 이전 `index-B04BFxHj.js`와 이전 GamePage 청크를 참조하고 있었고, 최신 React `dist` 결과가 WIZ의 `src/assets/jochwon-app` 자산 경로에 동기화되지 않았다.
- 변경 파일/자산: `src/assets/jochwon-app/index.html`, `src/assets/jochwon-app/assets/*`의 최신 React dist 번들.
- 배포 작업: 최신 `react-app/dist/index.html` 및 `react-app/dist/assets/*`를 현재 WIZ 정적 자산 경로에 동기화한 뒤 `wiz_project_build(clean=false)`로 `main` 프로젝트를 빌드·반영했다. 데이터베이스 초기화나 기존 데이터를 변경하지 않았다.
- 운영 검증: 운영 iframe이 `index-BYOduYgo.js`, `index-l1NlVt5g.css`를 참조하며 최신 GamePage/추천 번들이 모두 HTTP 200으로 응답했다. 로컬·운영 번들 SHA-256이 일치했다. `experience-signal-bridge.js`도 HTTP 200이다.
- 수정 코드 검증: 운영 번들에서 축제 부스 완료, 포토존 완료, 수목원 완료, 꽃 5개·5칸 화단·E키 안내, 곰 동상, 모집 관리, 곰 체험소 문자열을 확인했다.
- 남은 리스크: 브라우저에서 실제 클릭하는 UI 동작은 자동화 제한으로 사용자의 새로고침 후 확인이 필요하다. 이전 hash 자산은 직접 URL로는 남아 있을 수 있으나 최신 `index.html`에서는 더 이상 참조하지 않는다.
