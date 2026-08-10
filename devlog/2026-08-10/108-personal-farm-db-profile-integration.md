# 개인 팜 MySQL 꽃·곰 진행도를 내 프로필 분석에 병합

- **ID**: 108
- **날짜**: 2026-08-10
- **유형**: 데이터 연동 버그 수정

## 작업 요약

마이홈은 MySQL `personal_farm_progress`를 복원해 꽃과 곰 기록을 표시하지만 내 프로필은 별도 로컬 기록만 분석하여 해당 DB 진행도가 누락되던 문제를 수정했다. 꽃 채집·마이홈 심기와 먹이 수집·곰 급여를 프로필 활동 기록, 점수, 방문 공간 및 성향 분석에 병합하고 개인 팜 진행도 복원 시 프로필을 즉시 다시 계산한다.

## 원문 요청사항

```text
db에 남아있는 거 같긴한데, 내 프로필에 적용만 안되는 거 같아, 현재 마이홈 내가 전에 어떤 꽃 채집했는지, 곰 체험소에서 체험한 거 기록 남아있던데, 원인 파악하고 해결해줘봐
```

## 변경 파일 목록

- `react-app/src/services/profileProgress.ts`: 개인 팜 DB 캐시의 꽃·곰 진행도를 활동·점수·방문 공간에 반영
- `react-app/src/components/AiSejongProfile.tsx`: 개인 팜 복원·변경 시 프로필 즉시 재계산
- `react-app/scripts/reviewOpsRegression.test.ts`: 개인 팜 DB 프로필 연동 회귀 검사
- `react-app/src/runtimeBuild.ts`, `src/app/page.home/view.pug`, `src/assets/jochwon-app/`: 운영 iframe v21 번들 반영
- `devlog.md`, `devlog/2026-08-10/108-personal-farm-db-profile-integration.md`: 작업 이력 기록

## 검증 결과

- ReviewOps 회귀 테스트 8건 통과
- TypeScript·React·Express 프로덕션 빌드 및 성능 검사 통과
- 런타임 엔트리 테스트 6건 통과
- WIZ 일반 빌드 통과
- `git diff --check` 통과
- 기존 SUIT 폰트 런타임 경로 경고는 남아 있으며 이번 변경과 무관함
