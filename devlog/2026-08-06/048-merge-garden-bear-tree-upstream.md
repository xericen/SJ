# 원격 수목원·베어트리파크 미션 선택 병합 및 MySQL·WIZ 연동

- **ID**: 048
- **날짜**: 2026-08-06
- **유형**: 선택 병합 · 생태 미션 · MySQL/WIZ 연동
- **리뷰 ID**: `cwbbogxjkwzznuzsqgvyayjbjbpacqgg`
- **원격 기준**: `LeeDoHyung760/JoChiWon-Communications` `0d1a57ad7abef1233146c9e8f8e6efa86d4b1840`

## 작업 요약

기존 ReviewOps 변경을 `3f66a0f` 체크포인트로 먼저 보존하고, 원격 신규 커밋에서 수목원과 베어트리파크에 해당하는 변경만 현재 WIZ·MySQL 구조에 맞춰 선택 병합했다. 수목원 최초 식물 상호작용의 발견 기록, 베어트리파크 먹이 3종 수집·5개 지점 완료·최종 곰 급여, 완료 후 마이홈 곰 조형물 보상을 연결했다. 원격에 함께 포함된 멀티플레이, 맵 ID 통합, 기존 곰 체험소 제거 변경은 적용하지 않았다.

## 원문 요청사항

```text
https://github.com/LeeDoHyung760/JoChiWon-Communications 여기에 새로 푸시되어있는 거 pull해서 가져와주라, 수목원이랑 베어트리파크만 병합해줘
```

## 변경 파일 목록

- `react-app/src/components/GreenhouseExperience.tsx`: 수목원 최초 식물 상호작용 시 발견 기록 즉시 반영
- `react-app/src/components/PersonalFarmProgressExperience.tsx`, `react-app/src/services/personalFarmApi.ts`: 먹이 지점과 최종 곰 급여 UI/API 연결
- `react-app/src/game/renderers/VillageMapRenderer.ts`: 베어트리파크 먹이 지점·곰 급여 근접 판정과 마이홈 곰 보상 렌더링
- `react-app/src/services/bearStatueAssetFactory.ts`: 베어트리파크 GLB 원본 노드 기반 곰 조형물 생성
- `react-app/shared/personal-farm.ts`: `bearFed`, `bearFedAt` 진행도 계약 추가
- `react-app/server/src/models/PersonalFarmProgress.ts`, `react-app/server/src/services/personalFarmProgressService.ts`, `react-app/server/src/routes/personalFarm.ts`: MySQL JSON 진행도 및 최종 급여 규칙/API 적용
- `src/app/page.home/api.py`: WIZ MySQL 진행도 정규화·최종 급여 액션 적용
- `react-app/scripts/bearTreePortals.test.ts`, `react-app/scripts/bearTreeVisualQuality.test.ts`, `react-app/scripts/personalFarmInteractions.test.ts`, `react-app/server/src/services/personalFarmProgressService.test.ts`: 회귀 테스트 갱신
- `react-app/src/runtimeBuild.ts`, `src/app/page.home/view.pug`: 운영 캐시 ID `v143` 갱신
- `src/assets/jochwon-app/`: 최신 React 프로덕션 빌드 동기화
- `devlog.md`, `devlog/2026-08-06/048-merge-garden-bear-tree-upstream.md`: 작업 이력 기록

## 검증 결과

- 원격 신규 커밋 1개(`0d1a57a`) 확인 및 수목원·베어트리파크 변경만 선별
- React·Express 전체 프로덕션 빌드와 성능 예산 검사 통과
- MySQL 실제 연결 기반 서버 테스트 59개 통과
- 수목원 테스트, 베어트리파크 포탈·화질, 마이홈 상호작용·포탈 테스트 통과
- 베어트리파크 GLB의 곰 조형물·받침대 원본 노드 존재 확인
- WIZ Python API 문법 검사 및 WIZ 일반 빌드 통과
- `react-app/dist/`와 `src/assets/jochwon-app/` 파일·내용 일치 확인

## 남은 리스크

- 실제 브라우저에서 수목원 꽃 5종과 베어트리파크 5개 먹이 지점 전체 동선을 연속 수행하는 E2E는 현재 환경에서 자동화하지 못했다.
- 원격 커밋의 멀티플레이 및 맵 ID 변경은 요청 범위 밖이라 의도적으로 제외했다.
