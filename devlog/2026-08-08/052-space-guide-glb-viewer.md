# 공간안내 GLB 뷰어 실제 연결

- 원 요청: 새로고침 후에도 공간안내 화면이 바뀌지 않고 동아리거리제 GLB가 보이지 않음.
- 원인: 공간 카드의 스마트시티 분기만 별도 미리보기 컴포넌트를 사용했고, 카드의 실제 `modelUrl` GLB를 공통 뷰어에 전달하지 않았음. 또한 동일 해시 번들 캐시 문제가 함께 존재함.
- 변경 파일: `src/assets/jochwon-app/assets/index-Bd4TeqBb.js`, `src/assets/jochwon-app/index.html`
- 변경 내용: 스마트시티도 카드의 `modelUrl`을 공통 GLB 뷰어에 직접 전달하고, 런타임 캐시버스터를 `glb-fix-2`로 갱신.
- 확인: WIZ 빌드 성공. 운영 번들에 공통 `modelUrl` 뷰어 호출 반영. `/home` 및 동아리거리제·스마트시티 GLB 모두 200.
- 남은 리스크: 이미 열린 탭은 새 탭으로 다시 접속해야 새 캐시버전이 적용됨.
