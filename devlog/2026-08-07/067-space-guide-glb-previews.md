# 공간 안내 GLB 미리보기 연결 보완

- 요청: 공간 안내에서 동아리거리제 GLB가 로드되지 않는 문제를 수정하고 스마트시티도 GLB로 표시한다.
- 원인: 동아리거리제는 해시된 GLB 경로를 사용하고 있었지만 최신 캐시가 남을 수 있었고, 스마트시티 공간 안내는 GLB 경로가 있어도 별도 커스텀 미리보기 컴포넌트를 사용하고 있었다.
- 변경 파일: `src/assets/jochwon-app/assets/index-Brq-JAy6.js`, `src/assets/jochwon-app/index.html`, `devlog.md`.
- 변경 내용: 동아리거리제·스마트시티의 실제 해시 GLB 자산 경로를 공간 안내 미리보기에 사용하도록 정리하고 런타임 캐시 버전을 갱신했다.
- 확인: 두 GLB URL HTTP 200 및 `model/gltf-binary` 응답, WIZ 빌드, `git diff --check`를 확인한다.
