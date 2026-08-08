# 지연 사용 GLB preload 경고 해소

- 원 요청: 동아리거리제·세종 스마트시티 GLB가 preload 후 수 초 내 사용되지 않았다는 브라우저 콘솔 경고 해결.
- 변경 파일: `src/assets/jochwon-app/index.html`, `devlog.md`, `devlog/2026-08-08/056-remove-unused-glb-preloads.md`.
- 변경 내용: 첫 화면에서 즉시 사용하지 않는 두 GLB의 `link rel="preload"` 선언을 제거하고, 공간안내 3D 뷰어 진입 시 기존 로더가 필요 시점에 요청하도록 유지.
- 확인 결과: WIZ 일반 빌드 성공. 소스·빌드·운영 `jochwon-app/index.html`에서 두 GLB preload 선언이 없음을 확인. 운영 `/home` 및 두 GLB 자산 HTTP 200 확인.
- 남은 리스크: 이미 열린 탭의 기존 문서에는 preload 태그가 남아 있을 수 있으므로 새 문서 로드 후 경고가 사라짐.
