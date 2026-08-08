# 공간안내 구번들 캐시 수정

- 원 요청: 새로고침해도 동아리거리제·스마트시티 GLB 수정이 보이지 않음.
- 원인: 운영 JS 번들이 동일한 해시 파일명과 `immutable` 1년 캐시로 제공되어 브라우저가 기존 번들을 재사용함.
- 변경 파일: `src/assets/jochwon-app/index.html`
- 변경 내용: 엔트리 JS와 modulepreload URL에 `v=20260808-glb-fix-1` 캐시버스터 적용.
- 확인: WIZ 빌드 성공 및 운영 HTML 반영 확인. GLB URL은 계속 200/model/gltf-binary 응답.
- 남은 리스크: 이미 열린 탭은 새로고침 또는 탭 재진입이 필요함.
