# 카카오 재로그인 활동 스냅샷 복원 대기 및 프로필 즉시 재계산

- **ID**: 107
- **날짜**: 2026-08-10
- **유형**: 데이터 복원 버그 수정

## 작업 요약

카카오 재로그인 시 계정 프로필은 먼저 복원되지만 활동 스냅샷은 비동기로 늦게 복원되어, 게임과 내 프로필 화면이 빈 브라우저 저장소 기준 0%부터 렌더링되던 문제를 수정했다. 계정 활동 데이터 복원이 완료될 때까지 게임 진입 로딩을 유지하고, 복원 직후 프로필 진행도 재계산 이벤트를 발생시킨다.

## 원문 요청사항

```text
카카오로그인을 로그아웃을 하고 다시 카카오 로그인을 해서 들어오면 내 프로필이 0에서 부터 다시 시작하는데 왜 그런거야?
```

## 변경 파일 목록

- `react-app/src/App.tsx`: 계정 활동 복원 준비 상태와 게임 진입 게이트 추가, 복원 직후 프로필 재계산
- `react-app/scripts/reviewOpsRegression.test.ts`: 재로그인 복원 대기 회귀 검사
- `react-app/src/runtimeBuild.ts`, `src/app/page.home/view.pug`, `src/assets/jochwon-app/`: 운영 iframe v20 번들 반영
- `devlog.md`, `devlog/2026-08-10/107-kakao-relogin-profile-progress-restore.md`: 작업 이력 기록

## 검증 결과

- ReviewOps 회귀 테스트 7건 통과
- TypeScript·React·Express 프로덕션 빌드 및 성능 검사 통과
- 런타임 엔트리 테스트 6건 통과
- WIZ 일반 빌드 통과
- `git diff --check` 통과
- 기존 SUIT 폰트 런타임 경로 경고는 남아 있으며 이번 변경과 무관함
