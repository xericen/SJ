# 축제부스 캐릭터 축소와 먹거리부스형 포탈 적용

- **ID**: 012
- **날짜**: 2026-08-07
- **유형**: UX 수정

## 작업 요약

축제부스 플레이어와 NPC 크기를 모두 작게 맞추기 위해 축제부스 고정 캐릭터 높이와 로컬 NPC 높이를 120으로 통일했다. 과하게 작아진 세종호수공원 귀환 포탈은 별도 25% 축소 로직을 제거하고, 먹거리부스와 동일한 `energy-rift` 포탈 형태와 기본 스케일을 사용하도록 변경했다. 좌측 HUD는 `현재 위치 → 축제 스탬프 → 현재 활동 중` 순서로 붙어 보이도록 스탬프 패널을 현재 위치 패널 하단에 맞추고 현재 활동 중 fallback 위치를 조정했다.

## 원문 요청사항

```text
축제부스 플레이어 캐릭터 높이를 NPC 기준인 150으로 맞췄습니다. -> 플레이어랑 npc 크기 작게 변경,하고 포탈 크기 너무 작잖아, 먹거리부스 포탈 크기랑 동일하게 바꿔줘,그리고 왼쪽에 축제부스 스탬프 현제활동 이렇게 아래로 차례대로 나오게 연결해줘,,
```

## 변경 파일 목록

- `react-app/src/game/fixedWorldCameraProfiles.ts`: 축제부스 플레이어 캐릭터 높이 120으로 축소
- `react-app/src/data/festivalNpc.ts`: 축제부스 NPC 높이 120으로 축소
- `react-app/src/game/renderers/VillageMapRenderer.ts`: 축제부스 귀환 포탈을 먹거리부스와 동일한 `energy-rift` 기본 스케일로 변경
- `react-app/src/components/LakeParkExperiences.css`: 축제 스탬프 패널을 현재 위치 패널 바로 아래에 붙임
- `react-app/src/components/LakeParkExperiences.tsx`: 스탬프 하단 측정 여유를 8px로 조정
- `react-app/src/pages/GamePage.css`: 현재 활동 중 패널 fallback 위치를 스탬프 하단 기준으로 재조정
- `react-app/scripts/festivalExperience.test.ts`: 캐릭터 축소, 먹거리부스형 포탈, HUD 순서 회귀 검증 갱신
- `react-app/src/runtimeBuild.ts`, `src/app/page.home/view.pug`, `src/assets/jochwon-app/`: `v200` 런타임과 WIZ 진입 캐시 키 반영
- `devlog.md`, `devlog/2026-08-07/012-festival-small-characters-food-portal.md`: 작업 이력 기록

## 확인 결과

- `npm run test:festival-experience` 통과
- `npm run test:festival-portal` 통과
- `npm run build` 통과
- WIZ 일반 빌드(`clean=false`) 통과
- `src`, `build`, `bundle`의 정적 진입점과 `/home` iframe에서 `20260807-festival-small-characters-food-portal-v200` 반영 확인
- 소스 기준 플레이어 120, NPC 120, 충녕이 제거 유지, `energy-rift` 포탈, 포탈 25% 축소 제거, HUD 순서 보정 확인

## 남은 리스크

- 실제 브라우저 캡처가 없어 원근감에 따른 체감 크기는 수동 확인이 필요하다.
