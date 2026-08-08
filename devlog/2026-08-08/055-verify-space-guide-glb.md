# 공간안내 GLB 운영 직접 검증

- 원 요청: 공간안내 동아리거리제 3D 모형 로딩 수정 및 스마트시티 3D 모형 제공.
- 확인 대상: 운영 HTML, 공통 `WorldModelPreview` 청크, 동아리거리제 GLB, 세종 스마트시티 GLB.
- 확인 결과: 운영 HTML에 GLB preload와 `glb-fix-3` 엔트리 반영. 뷰어에 `crossorigin="anonymous"` 반영. `/home` 200. 두 GLB 모두 `200`, `model/gltf-binary` 응답.
- 남은 리스크: 현재 환경에서 브라우저 GPU 화면 캡처 도구는 제공되지 않아 실제 픽셀 렌더링까지는 확인하지 못함.
