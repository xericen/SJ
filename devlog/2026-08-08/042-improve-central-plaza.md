# 중앙광장 개선

- 원 요청: 중앙광장을 밝게 하고 `Marker_SaveCourse` 위치에 정부청사 포탈을 배치하며 맵 렉을 줄이고, 원형 공간에서 여행 추천이 어떻게 동작하는지 확인.
- 변경 파일: `src/assets/jochwon-app/assets/GamePage-DHO1psZk.js`
- 변경 내용: 중앙광장 노출을 `toneMappingExposure 1.18`, `lightingIntensityMultiplier 1.12`, 밝은 배경색으로 조정했다. 모델의 `Marker_SaveCourse` 월드 변환 좌표를 읽어 정부청사 귀환 포탈 위치에 적용했다. 픽셀 비율 0.75, 최대 0.9, 30fps, geometry simplification 0.28, 단순 충돌·빠른 지면 샘플링을 중앙광장에만 적용했다.
- 여행 추천 동작: 중앙 원형 `AI_Platform_Base` 접근 반경에서 `AI 추천센터` 안내가 나타나며 E키로 진입한다. 오른쪽 프로젝트 가져오기, 중앙 AI 여행 일정 확정, 왼쪽 일정 저장·방문 화면의 3단계 흐름이다.
- 확인: WIZ 빌드 성공. 운영 엔트리 `index-Dkx4ELvh.js`가 로드하는 `GamePage-DHO1psZk.js`에서 마커 기반 포탈 코드와 밝기·성능 설정을 직접 확인했다.
- 남은 리스크: 실제 장치별 FPS 측정은 브라우저 성능 패널에서 추가 확인이 필요하며, geometry simplification으로 일부 세부 형상이 단순화될 수 있다.
