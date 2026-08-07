# 세 체험 맵 카메라 고정 및 UI 겹침 수정

- **ID**: 008
- **날짜**: 2026-08-07
- **유형**: 버그 수정

## 작업 요약

운영 카메라 편집기에 저장된 세종예술의전당·먹거리부스·축제부스의 최종 값을 소스 고정값으로 반영하고, 세 맵을 카메라 조절 대상에서 제외했다. 내 프로필 최근 활동 헤더의 전체 기록 보기 버튼을 제거하고, 축제부스의 현재 활동 중 패널을 스탬프 패널 아래로 16px 더 내려 겹침을 방지했다.

## 원문 요청사항

```text
현재 내가 카메라 각도 맵마다 수정했는데 세종예술의 전당 카메라 위치 고정, 먹거리부스 카메라 위치 고정,축제부스 카메라 위치 고정 ->  그리고 카메라 위치 조절하는 거 삭제해줘 3개 맵만 우선 적용, 그리고 내 프로필에 있는 최근 활동 기록 옆에 있는 전체기록보기 버튼 없애줘. 축제부스 들어오면 왼쪽에 스탬프하는 거랑 현재 활동중 겹치는데 현제 활동중 을 좀 더 내려서 가리지 않게 수정해줘,
```

## 변경 파일 목록

- `react-app/src/game/fixedWorldCameraProfiles.ts`: 운영 DB의 최종 카메라 값 세트를 고정 프로필로 추가
- `react-app/src/services/worldCameraProfiles.ts`: 세 맵을 카메라 조절 대상과 임시·공용 덮어쓰기 대상에서 제외
- `react-app/src/game/worldNavigationProfile.ts`: 세 맵을 통합 카메라 덮어쓰기 대상에서 제외
- `react-app/src/game/renderers/VillageMapRenderer.ts`: 세 맵 렌더러에 고정 프로필 적용
- `react-app/src/components/AiSejongProfile.tsx`: 최근 활동 기록 옆 전체 기록 보기 버튼 제거
- `react-app/src/pages/GamePage.css`: 축제 현재 활동 중 패널을 스탬프 아래로 16px 이동
- `react-app/scripts/worldCameraEditor.test.ts`, `react-app/scripts/worldNavigationConsistency.test.ts`, `react-app/scripts/festivalPortal.test.ts`, `react-app/scripts/festivalExperience.test.ts`, `react-app/scripts/desktopPageLayout.test.ts`: 회귀 검증 갱신
- `react-app/src/runtimeBuild.ts`, `src/app/page.home/view.pug`, `src/assets/jochwon-app/`: `v196` 런타임과 최신 빌드 산출물 반영
- `devlog.md`, `devlog/2026-08-07/008-lock-experience-cameras-and-fix-hud.md`: 작업 이력 기록

## 확인 결과

- 운영 API에서 세 맵의 마지막 저장 카메라 값 조회 및 소스 고정값과 일치 확인
- 카메라·예술의전당·먹거리·축제·프로필 관련 테스트 38개 통과
- 런타임 엔트리·postMessage·런타임 경고 테스트 10개 통과
- `npm run build` 통과
- WIZ `main` 프로젝트 일반 빌드(`clean: false`) 통과
- 운영 HTML·엔트리·WIZ `main.js`에서 `v196` 반영 확인
- 운영 엔트리와 로컬 산출물 SHA-256 일치 및 JavaScript 구문 검사 통과
