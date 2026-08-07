# 공간 안내 Meshopt 디코더 초기화 수정

- 요청: `THREE.GLTFLoader: setMeshoptDecoder must be called before loading compressed files` 오류를 수정한다.
- 원인: 공간 안내용 `model-viewer` 번들에 내부 Meshopt 디코더가 포함되어 있었지만, 로더의 디코더 Promise가 설정되기 전에 압축 GLB를 요청했다.
- 변경 파일: `src/assets/jochwon-app/assets/model-viewer-BSv3BDab.js`, `devlog.md`.
- 변경 내용: 번들 초기화 시 내부 Meshopt 디코더 Promise를 로더에 연결해 압축 GLB 로드 전에 `setMeshoptDecoder`가 실행되도록 했다.
- 확인: WIZ 빌드와 `git diff --check`를 수행한다.
