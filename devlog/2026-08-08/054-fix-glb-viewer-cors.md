# 공간안내 GLB 뷰어 CORS 보강

- 원 요청: 공간안내에서 동아리거리제 GLB가 불러와지지 않고 스마트시티도 GLB로 볼 수 있게 수정.
- 변경 파일: `src/assets/jochwon-app/assets/WorldModelPreview-CFQT1qdr.js`, `src/assets/jochwon-app/index.html`
- 변경 내용: 공통 `model-viewer`에 `crossorigin="anonymous"`를 명시하고 엔트리 캐시버전을 `glb-fix-3`으로 갱신.
- 확인: WIZ 빌드 성공. 운영 GLB 두 파일 모두 200·CORS 허용·`model/gltf-binary`. 운영 HTML에 새 엔트리 URL 반영.
- 남은 리스크: 실제 WebGL 렌더링은 브라우저 GPU 환경에서 최종 확인 필요.
