# 축제부스 캐릭터·포탈·화질·HUD 보정

- **ID**: 010
- **날짜**: 2026-08-07
- **유형**: UX 수정

## 작업 요약

축제부스 맵에서 플레이어 캐릭터 높이를 NPC 기준에 맞추고, 세종호수공원 귀환 포탈과 포탈 제목을 절반 크기로 줄였다. 축제부스 렌더링 픽셀 비율과 안티앨리어싱을 올려 맵 화질을 개선했으며, 축제부스의 충녕이 NPC를 제거했다. 스탬프 패널 아래 현재 활동 중 패널이 실제 패널 높이를 기준으로 더 아래에 이어지도록 HUD 간격을 보정했다.

## 원문 요청사항

```text
축제부스에서 캐릭터 크기 축제부스에 있는 npc랑 크기 맞춰줘, 그리고 세종호수 공원으로 가는 포탈 크기 , 제목 반으로 줄여줘, 그리고 맵 화질이 안 좋은데 좋게 해주고, 충녕이는 삭제해줘, 그리고 좌측 상단에 축제 스탬프 확인 때문에 현재 활동중 그 부분이 가려짐 아래로 내려서 잘 이어지게 해줘
```

## 변경 파일 목록

- `react-app/src/data/festivalNpc.ts`: 축제부스 충녕이 NPC 제거
- `react-app/src/game/fixedWorldCameraProfiles.ts`: 축제부스 캐릭터 높이를 150으로 보정
- `react-app/src/game/renderers/VillageMapRenderer.ts`: 축제부스 귀환 포탈과 제목 50% 축소, 렌더 픽셀 비율·안티앨리어싱 상향
- `react-app/src/components/LakeParkExperiences.tsx`: 스탬프 패널 측정 하단값에 10px 여유 추가
- `react-app/src/pages/GamePage.css`: 현재 활동 중 패널을 스탬프 패널 하단 변수 기준으로 배치
- `react-app/scripts/festivalExperience.test.ts`: 축제부스 스케일·품질·HUD 회귀 테스트 추가
- `react-app/src/runtimeBuild.ts`, `src/app/page.home/view.pug`, `src/assets/jochwon-app/`: `v198` 런타임과 최신 빌드 산출물 및 `/home` iframe 캐시 키 반영
- `devlog.md`, `devlog/2026-08-07/010-festival-booth-scale-quality-hud.md`: 작업 이력 기록

## 확인 결과

- `npm run test:festival-experience` 통과
- `npm run test:festival-portal` 통과
- `npm run build` 통과
- WIZ 정적 자산 `src/assets/jochwon-app/index.html`에 `20260807-festival-scale-hud-quality-v198` 반영 확인
- `/home` iframe의 `_build` 값이 v197에 남아 있던 문제를 확인하고 `20260807-festival-scale-hud-quality-v198`로 수정
- WIZ 일반 빌드(`clean=false`) 통과
- `build/src/app/page.home/view.html`, `bundle/www/main.js`, `build/src/assets/jochwon-app/index.html`, `bundle/src/assets/jochwon-app/index.html`에서 v198 반영 확인

## 남은 리스크

- 실제 로그인 브라우저 캡처가 제한되어 축제부스 화면에서의 체감 간격과 화질은 수동 확인이 필요하다.
