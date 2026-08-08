# 동아리 거리제 GLB 경로 수정 및 세종 스마트시티 일반 GLB 미리보기 적용

- 원본 요청: “동아리거리제 GLB파일을 못 불러오는데 이거 수정해주고, 세종스마트시티 맵도 다른 맵처럼 GLB파일로 보게 해줘”
- 변경 파일:
  - `src/assets/jochwon-app/assets/index-Brq-JAy6.js`
  - `devlog.md`
  - `devlog/2026-08-07/069-fix-club-smartcity-glb-preview.md`
- 변경 내용:
  - 동아리 거리제 GLB와 세종 스마트시티 GLB를 현재 `/assets/jochwon-app/assets/` 정적 경로로 연결했습니다.
  - 세종 스마트시티 카드가 특수 미리보기로 우회되지 않고 공통 `WorldModelPreview` GLB 뷰어를 사용하도록 했습니다.
- 확인 결과:
  - 두 GLB 파일이 프로젝트에 존재하고 번들에 새 경로가 포함되는 것을 확인했습니다.
  - 세종 스마트시티 레거시 우회 조건이 번들에서 제거된 것을 확인했습니다.
- 남은 리스크: 실제 운영 CDN/브라우저에서 카드 진입 후 WebGL 렌더링과 대용량 GLB 다운로드를 추가 확인해야 합니다.
