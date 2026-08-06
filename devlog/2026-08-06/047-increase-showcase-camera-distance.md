# 예술의전당·축제·먹거리 부스 카메라 거리 소폭 확대

- **ID**: 047
- **날짜**: 2026-08-06
- **유형**: UX 개선 · 카메라 조정
- **리뷰 ID**: `ucpgkvwdbljhhijvtebeixepohjidmjy`

## 작업 요약

실제 렌더링 단계에서 공통 1300 거리를 사용하던 세종예술의전당, 축제부스, 먹거리부스의 카메라 거리를 1400으로 약 7.7% 확대했다. 세 맵에만 전용 거리 분기를 적용해 다른 월드의 카메라 거리와 기존 각도·시야각은 유지했다.

## 원문 요청사항

```text
카메라랑 캐릭터랑 조금만 더 멀어지게 해줘, (세종 예술의 전당, 축제부스, 먹거리부스모두)
```

## 변경 파일 목록

- `react-app/src/game/worldNavigationProfile.ts`: 세 개 전시·체험 맵 전용 카메라 거리 1400 적용
- `react-app/scripts/worldNavigationConsistency.test.ts`: 요청한 세 맵만 거리가 늘고 다른 맵은 유지되는 회귀 테스트 추가
- `react-app/src/runtimeBuild.ts`, `src/app/page.home/view.pug`: 운영 캐시 식별자를 `20260806-showcase-camera-distance-v142`로 갱신
- `src/assets/jochwon-app/`: 최신 React 프로덕션 빌드 산출물 동기화
- `devlog.md`, `devlog/2026-08-06/047-increase-showcase-camera-distance.md`: 작업 이력 기록

## 검증 결과

- 대상 세 맵 및 다른 월드 유지 회귀 테스트 4개 통과
- 예술의전당·축제부스·먹거리부스 관련 테스트에서 이번 변경 항목을 포함한 22개 통과
- `npm run build` 성공: TypeScript, Vite 프로덕션 빌드, 성능 예산 검사, 서버 TypeScript 통과
- 런타임 엔트리 테스트 6개 통과
- `react-app/dist/`와 `src/assets/jochwon-app/` 파일·내용 일치 확인
- WIZ 일반 빌드(`clean: false`) 성공
- 운영 v142 HTML, 엔트리 및 GamePage 번들 HTTP 200과 거리 1400 포함 확인
- `git diff --check` 통과

## 남은 리스크

- 실제 사용자 화면에서 세 맵의 체감 구도를 비교하는 브라우저 자동 E2E는 현재 환경에서 실행하지 못했다.
- 기존 마이홈 실내 거리 소스값 1400과 회귀 테스트 기대값 1120의 불일치 1건은 이번 변경과 무관해 수정하지 않았다.
