# 예술의전당 캐릭터 발과 GLB 바닥 높이 정렬

- **ID**: 055
- **날짜**: 2026-08-05
- **유형**: 버그 수정 · 3D 정렬
- **리뷰 ID**: `ucpgkvwdbljhhijvtebeixepohjidmjy`

## 작업 요약

세종예술의전당 GLB의 시각적 바닥 마감과 캐릭터 발이 맞닿도록 해당 맵의 캐릭터 모델만 8만큼 올렸다. 충돌 지면, 점프 높이, 카메라 추적 기준은 기존 값을 유지하도록 시각 높이 보정을 분리했으며 로컬 캐릭터와 원격 사용자 캐릭터에 동일하게 적용했다. 좌석 착석 위치에는 이 보정을 적용하지 않았다.

## 원문 요청사항

```text
예술의 전당 현재 캐릭터의 발과 glb 바닥이 맞닿아있지 않음. 그래서 발이 땅에 묻혀있는 거 처럼 나오는데 이 부분 수정해줘.
```

## 변경 파일 목록

- `react-app/src/game/groundTraversal.ts`: 예술의전당 전용 발 높이 보정값과 캐릭터 시각 Y 계산 함수 추가
- `react-app/src/game/renderers/VillageMapRenderer.ts`: 로컬·원격 캐릭터에만 발 높이 보정을 적용하고 카메라 지면 기준 분리
- `react-app/scripts/artsCenterJump.test.ts`: 발 높이 보정과 기존 지면 기준 분리 회귀 테스트 추가
- `react-app/index.html`, `src/app/page.home/view.pug`: 운영 캐시 식별자를 `20260805-arts-character-foot-lift-v69`로 갱신
- `src/assets/jochwon-app/`: 최신 React 프로덕션 빌드 산출물 동기화
- `devlog.md`, `devlog/2026-08-05/055-align-arts-character-feet-with-floor.md`: 작업 이력 기록

## 검증 결과

- `npx tsx --test scripts/artsCenterJump.test.ts scripts/artsCenterPoster.test.ts scripts/cameraFollow.test.ts scripts/lakePortals.test.ts scripts/foodExperience.test.ts` 성공: 27개 테스트 통과
- `npm run build` 성공: TypeScript, Vite 프로덕션 빌드, 성능 예산 검사, 서버 TypeScript 통과
- `react-app/dist/`와 `src/assets/jochwon-app/` 파일·내용 일치 확인
- WIZ 일반 빌드(`clean: false`) 성공
- 운영 HTML에서 v69 캐시 식별자와 신규 엔트리 번들 응답 확인
- `git diff --check` 통과

## 남은 리스크

- 실제 사용자 캐릭터 모델과 예술의전당 GLB 바닥을 브라우저에서 시각 비교하는 자동 E2E는 현재 환경에서 실행하지 못했다.
