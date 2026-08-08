# 공간안내 GLB 로딩 보강

- 원 요청: 공간안내 페이지에서 동아리거리제 GLB가 불러와지지 않으며, 스마트시티도 GLB로 볼 수 있도록 수정 요청.
- 변경 파일: `src/assets/jochwon-app/index.html`
- 변경 내용: 동아리거리제와 세종 스마트시티 GLB를 `fetch` preload 대상으로 명시해 공간안내 진입 전에 3D 자산을 확보하도록 보강.
- 확인: WIZ 프로젝트 빌드 성공. 운영 `/home` 200. 두 GLB 운영 URL 모두 `200` 및 `model/gltf-binary` 응답. 운영 HTML에 두 preload 태그 반영 확인.
- 남은 리스크: 실제 GPU/WebGL 환경별 렌더링 성능과 브라우저 캐시 상태는 사용자 환경에서 추가 확인 필요.
