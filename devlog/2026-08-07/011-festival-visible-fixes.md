# 축제부스 화면 기준 가시 수정 재보정

- **ID**: 011
- **날짜**: 2026-08-07
- **유형**: UX 수정

## 작업 요약

첨부 스크린샷 기준으로 이전 수정이 체감되지 않는 항목을 다시 확인했다. 축제부스 NPC가 플레이어보다 작게 보이던 문제를 줄이기 위해 축제부스 로컬 NPC 높이를 220으로 올렸다. 세종호수공원 귀환 포탈 링은 기존 대비 25%로 더 줄이고, 제목은 최종 표시 크기가 절반이 되도록 보정했다. 스탬프 패널 아래 현재 활동 중 패널이 CSS 변수 미적용 상황에서도 숨지지 않도록 fallback 위치를 300px로 내리고 z-index를 올렸다. 렌더 품질은 픽셀 비율 기준을 1.5로 한 단계 더 올렸다.

## 원문 요청사항

```text
축제부스에서 캐릭터 크기 축제부스에 있는 npc랑 크기 맞춰줘, 그리고 세종호수 공원으로 가는 포탈 크기 , 제목 반으로 줄여줘, 그리고 맵 화질이 안 좋은데 좋게 해주고, 충녕이는 삭제해줘, 그리고 좌측 상단에 축제 스탬프 확인 때문에 현재 활동중 그 부분이 가려짐 아래로 내려서 잘 이어지게 해줘 하나도 수정 안됐는데 다시 확인해줘 제발 같은 거 여러 번 하게 하지마
```

## 변경 파일 목록

- `react-app/src/data/festivalNpc.ts`: 축제부스 NPC 높이를 220으로 보정
- `react-app/src/game/renderers/VillageMapRenderer.ts`: 축제부스 귀환 포탈 25% 축소, 제목 최종 50% 크기 유지, 렌더 픽셀 비율 상향
- `react-app/src/components/LakeParkExperiences.tsx`: 스탬프 패널 측정 하단 여유를 18px로 확대
- `react-app/src/pages/GamePage.css`: 현재 활동 중 패널 fallback 위치와 z-index 보강
- `react-app/scripts/festivalExperience.test.ts`: 새 축제부스 가시 기준 회귀 검증
- `react-app/src/runtimeBuild.ts`, `src/app/page.home/view.pug`, `src/assets/jochwon-app/`: `v199` 런타임과 WIZ 진입 캐시 키 반영
- `devlog.md`, `devlog/2026-08-07/011-festival-visible-fixes.md`: 작업 이력 기록

## 확인 결과

- `npm run test:festival-experience` 통과
- `npm run test:festival-portal` 통과
- `npm run build` 통과
- WIZ 일반 빌드(`clean=false`) 통과
- `src`, `build`, `bundle`의 `jochwon-app/index.html` 및 `/home` iframe에서 `20260807-festival-visible-fixes-v199` 반영 확인
- 소스 기준 NPC 220, 충녕이 제거, 포탈 25%, 제목 최종 50%, 품질 상향, HUD fallback 300px 반영 확인

## 남은 리스크

- 실제 브라우저 조작 캡처는 제공 스크린샷 기준 분석으로 대체했다. 카메라 원근 때문에 NPC와 플레이어가 같은 위치에 섰을 때의 체감 크기는 추가 미세 조정이 필요할 수 있다.
