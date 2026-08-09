# 중앙광장 STEP 8 추천 요청 취소 결함 및 영구 대기 복구

- **ID**: 099
- **날짜**: 2026-08-09
- **유형**: 버그 수정

## 작업 요약

중앙광장 AI 코스 선행 요청의 결과가 단계 전환과 상태 갱신 때 취소 처리되어 STEP 8에서 영구 대기하던 문제를 수정했다. 요청 식별자를 사용해 현재 실행 중인 요청만 반영하고, 화면 종료 때만 이전 요청을 무효화하도록 수명주기를 분리했다. STEP 8에는 실제 장소 경로 생성 상태와 실패 시 직접 다시 생성할 수 있는 버튼을 추가했다.

## 원문 요청사항

```text
지금 추천 경로 생성 스텝 8에서 시작이 안되는 문제가 있음 이거 하면 경로 생성 뜰거같은데 여기서 발목이 잡혀버림
```

## 원인

- 추천 effect가 요청 시작 직후 `recommendationAttempted`를 변경하면서 다시 실행됐다.
- 기존 effect 정리 함수가 진행 중 요청의 `cancelled` 값을 즉시 `true`로 바꿔 정상 응답도 화면 상태에 반영하지 않았다.
- 이미 시도 완료 상태였기 때문에 요청은 다시 시작되지 않았고, 실제 장소가 없는 STEP 8의 진행 차단 조건에서 영구 정지했다.
- 오류·재시도 UI가 STEP 6에만 있어 STEP 8에서는 사용자가 복구할 방법도 없었다.

## 변경 파일 목록

- `react-app/src/components/GovernmentAiRecommendationCenter.tsx`: 요청 ID 기반 결과 반영, 종료 시 요청 무효화, STEP 8 진행·오류·재시도 UI
- `react-app/src/components/GovernmentAiRecommendationCenter.css`: STEP 8 경로 생성 상태 패널 스타일
- `react-app/scripts/reviewOpsRegression.test.ts`: 상태 변경에 의한 요청 취소 재발 방지와 STEP 8 재시도 검사
- `react-app/src/runtimeBuild.ts`, `src/app/page.home/view.pug`: 운영 iframe 캐시 버전 v12 반영
- `src/assets/jochwon-app/`: 새 React 프로덕션 번들 반영
- `devlog.md`, `devlog/2026-08-09/099-fix-government-step8-route-stall.md`: 작업 이력 기록

## 검증 결과

- ReviewOps 회귀 테스트 6건 통과
- TypeScript·React·Express 프로덕션 빌드, 성능 검사, WIZ 일반 빌드, `git diff --check` 통과
- 운영 `/main.js`와 iframe에서 v12 확인
- 운영 GamePage 번들이 로컬 배포 파일과 SHA-256 일치
- 운영 번들에서 STEP 8 생성 상태와 `추천 경로 다시 생성` UI 확인
- 기존 SUIT 폰트 런타임 경로 경고는 남아 있으며 이번 변경과 무관함
