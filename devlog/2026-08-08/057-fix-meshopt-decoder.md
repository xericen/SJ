# 압축 GLB 로딩 시 MeshoptDecoder 기본 설정 누락 수정

- 사용자 원 요청: `reviewops-sdk.js:1437 Error: THREE.GLTFLoader: setMeshoptDecoder must be called before loading compressed files` 해결.
- 변경 파일: `src/assets/jochwon-app/assets/GLTFLoader-BEVLqbIS.js`
- 변경 내용: GLTFLoader 생성 시 번들에 포함된 Meshopt 디코더를 기본값으로 지정해, 공간안내 3D 뷰어처럼 명시적 설정을 거치지 않는 호출 경로에서도 EXT_meshopt_compression GLB를 디코딩하도록 수정.
- 확인 결과: WIZ `main` 프로젝트 빌드 성공, 수정 번들에 `this.meshoptDecoder=oh` 반영 확인, 운영 `/home?_build=20260808-meshopt-fix` HTTP 200 확인.
- 남은 리스크: 현재 자동 환경에서는 실제 브라우저 GPU 렌더링 픽셀 검증은 제한되며, 실제 GLB 화면 진입 시 최종 확인이 필요함.
