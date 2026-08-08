# 부분 연결 맵의 의미 있는 체험을 프로필 harness에 보강 연결

- 원본 요청: 현재 체험용 프로필 구조를 유지하고, 부분 연결 맵의 의미 있는 체험 완료를 기존 experience profile harness를 통해 axes에 반영해 달라는 요청.
- 변경 파일:
  - `src/assets/jochwon-app/assets/experience-signal-bridge.js`
  - `src/assets/jochwon-app/index.html`
  - `devlog.md`
  - `devlog/2026-08-08/001-bridge-partial-map-experiences.md`
- 변경 내용:
  - 스마트시티 전체 서비스 완료, 중앙광장 AI 세종 추천센터 노출 완료, 전망대 망원경 화면 완료를 기존 harness에 연결했습니다.
  - 의미별 고정 event subject와 localStorage once marker로 반복 클릭 점수 누적을 방지했습니다.
  - 기존 10개 정상 맵, DB, 카카오 로그인, behavior_state API, 저장소 통합 구조는 수정하지 않았습니다.
- 검증 결과:
  - 브리지의 harness import, 대상 mapId/action/subject, axes, 이벤트 selector를 정적 확인했습니다.
  - 실제 브라우저에서 각 완료 화면을 열어 localStorage 변경까지 확인하는 실행 검증은 환경상 수행하지 못했습니다.
- 남은 리스크:
  - 마이홈의 실제 수집품 배치 완료 이벤트는 현재 운영 번들에서 명확한 완료 DOM/event를 확인하지 못해 추가 signal을 임의로 기록하지 않았습니다.
