# 공간 안내 마이홈 월드 추가 및 개인팜 명칭 전환

- **ID**: 065
- **날짜**: 2026-08-05
- **유형**: UX 개선
- **리뷰 ID**: uieobisoicxojmbqqtpwasqphrczmjte

## 작업 요약

기존 `personal-farm` 실제 월드를 공간 안내에 17번째 월드로 추가하고 전용 주택 GLB와 미리보기 이미지를 연결했다. 사용자 화면에 노출되던 “개인 팜”·“나의 팜” 명칭은 포털, 로딩, 진행 UI, 기록, 오류 문구까지 모두 “마이홈”으로 통일했다.

## 원문 요청사항

```text
공간 안내에 개인팜 넣어줘 (개인팜 이름을 -> 마이홈으로 전환)
```

## 변경 파일 목록

- `react-app/src/pages/LandingPage.tsx`: 공간 안내 마이홈 카드·전용 GLB·미리보기 및 17개 월드 순서 추가
- `react-app/shared/world-portals.ts`: 포털 목적지 표시명을 마이홈으로 변경
- `react-app/src/game/GameCanvas.tsx`: 마이홈 로딩 화면 문구 변경
- `react-app/src/game/scenes/WorldScene.ts`: 인게임 위치명을 마이홈으로 변경
- `react-app/src/game/renderers/VillageMapRenderer.ts`: 맵·포털 이름을 마이홈으로 변경
- `react-app/src/components/PersonalFarmProgressExperience.tsx`: 미션·보상 UI 명칭 변경
- `react-app/src/services/experienceHarness.ts`, `profileProgress.ts`, `personalFarmApi.ts`: 기록·진행·오류 명칭 변경
- `src/app/page.home/api.py`: 사용자 노출 오류 문구 변경
- `react-app/src/runtimeBuild.ts`, `src/app/page.home/view.pug`: 운영 빌드 ID v78 갱신
- `src/assets/jochwon-app/`: 최신 React 운영 빌드 반영

## 검증 결과

- Python 구문 검사 통과
- 클라이언트·서버 TypeScript 검사 통과
- React 운영 빌드 및 성능 예산 검사 통과
- 런타임 엔트리 캐시 테스트 2개 통과
- 공간 안내 월드 17개 및 `personal-farm` 포함 확인
- 소스·운영 번들에서 기존 “개인 팜” 명칭 제거 확인
- 운영 v78 엔트리, 마이홈 문구, 실제 주택 GLB HTTP 200 확인
- WIZ 프로젝트 빌드 성공
- `git diff --check` 통과

## 남은 리스크

- 마이홈 미리보기는 주택 GLB 중심이며, 인게임에서 동적으로 배치되는 미션 보상 장식은 공간 안내 정적 미리보기에는 표시되지 않는다.
