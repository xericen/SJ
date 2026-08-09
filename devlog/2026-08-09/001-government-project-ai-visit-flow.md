# 정부청사 보행 성능·속도 및 완료 프로젝트 기반 AI 일정 3단계 연결

- 원 요청: 정부청사 보행 렉을 줄이고 플레이어 속도를 약 2/3로 낮추며, 프로젝트실에서 팀원과 완료한 프로젝트를 01에서 불러와 02 홀로그램·AI 분석/최적화에 사용하고 03에서 코스를 저장·방문 기록하며 QR을 제거하고 카카오지도를 HTML 내부에 표시.
- 변경 파일: `react-app/src/game/renderers/VillageMapRenderer.ts`, `react-app/src/game/scenes/WorldScene.ts`, `react-app/src/components/GovernmentCentralPlazaWebUI.tsx`, `react-app/src/components/GovernmentThreeStage.css`, `react-app/src/services/experienceHarness.ts`, `devlog.md`, 본 상세 기록.
- 변경 내용: 정부청사 렌더링을 30fps, 저픽셀 비율, 빠른 지면 샘플링·간소 충돌로 조정하고 이동속도를 2/3로 낮췄다. 01은 프로젝트실의 `completed` 프로젝트와 팀원·장소·활동만 표시하고, 02는 해당 코스를 홀로그램에서 편집·최적화·확정하며, 03은 확정 코스 저장·방문 기록과 내부 카카오지도만 제공하도록 분리했다. QR UI를 제거하고 방문 결과를 프로필 체험 하네스에 반영했다.
- 확인: React TypeScript/Vite/서버 전체 빌드 성공, 성능 예산 검증 성공. 기존 SUIT 폰트 빌드 경고 외 오류 없음.
- 남은 리스크: 카카오 지도 서비스가 iframe 표시를 제한하는 브라우저 정책에서는 내부 지도 로딩이 차단될 수 있다. 실제 OpenAI 호출은 서버의 `OPENAI_API_KEY` 설정과 네트워크 상태에 의존하며 실패 시 기존 맞춤 규칙 결과로 대체된다.
