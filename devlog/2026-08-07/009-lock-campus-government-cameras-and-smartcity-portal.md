# 공동캠퍼스 계열·정부 맵 카메라 및 스마트시티 포탈 고정

- **ID**: 009
- **날짜**: 2026-08-07
- **유형**: 버그 수정

## 작업 요약

공동캠퍼스·프로젝트실·모집센터·학생회관·정부청사·세종 스마트시티 국가시범도시의 카메라를 운영 저장값 기준으로 고정하고 편집 대상에서 제외했다. 스마트시티의 정부청사 귀환 포탈을 현재 공용 기준 좌표 `(1200, 1690)`에 고정하고 전용 위치 이동 버튼 및 로컬 편집 속성을 제거했다.

## 원문 요청사항

```text
공동캠퍼스,프로젝트실, 모집센터, 학생회관,정부청사, 세종스마트시티 국가 시범도시 도 카메라 위치 고정해주고, 조절하는 거 없애줘, 그리고 스마트 시티맵에서 정부청사로 돌아가는 포탈 위치 내가 수정했는데 이 위치로 픽스해주고, 위치 옮기는 버튼 없애줘
```

## 변경 파일 목록

- `react-app/src/game/fixedWorldCameraProfiles.ts`: 여섯 맵의 고정 카메라 프로필 추가
- `react-app/src/game/GameCanvas.tsx`: 고정 프로필을 DB·세션·편집 이벤트보다 우선 적용하고 변경 이벤트 차단
- `react-app/src/services/worldCameraProfiles.ts`: 고정된 아홉 맵을 카메라 편집 대상에서 제외
- `react-app/src/components/WorldCameraEditor.tsx`: 남은 편집 가능 맵 수를 8개로 갱신
- `react-app/src/game/renderers/VillageMapRenderer.ts`: 스마트시티 귀환 포탈의 위치 편집 속성 제거
- `react-app/src/pages/GamePage.tsx`: 스마트시티 정부청사 포탈 이동 버튼 제거
- `react-app/scripts/worldCameraEditor.test.ts`, `react-app/scripts/smartCityPortalPosition.test.ts`: 고정값 우선순위와 포탈 편집 제거 회귀 검증
- `react-app/src/runtimeBuild.ts`, `src/app/page.home/view.pug`, `src/assets/jochwon-app/`: `v197` 런타임과 최신 빌드 산출물 반영
- `devlog.md`, `devlog/2026-08-07/009-lock-campus-government-cameras-and-smartcity-portal.md`: 작업 이력 기록

## 확인 결과

- 운영 카메라 API에서 공동캠퍼스·모집센터·학생회관·정부청사·스마트시티 저장값 확인
- 프로젝트실은 운영 DB에 별도 저장값이 없어 현재 실제 적용 중인 공통 카메라 값으로 고정
- 운영 포탈 API에서 스마트시티 → 정부청사 좌표 `(1200, 1690)` 확인
- 카메라·공동캠퍼스·정부청사·스마트시티 관련 테스트 39개 통과
- 런타임 엔트리·postMessage·런타임 경고 테스트 10개 통과
- `npm run build` 통과
- WIZ `main` 프로젝트 일반 빌드(`clean: false`) 통과
