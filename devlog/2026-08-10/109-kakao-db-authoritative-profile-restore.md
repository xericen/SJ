# 카카오 프로필 DB 원본 우선 복원 및 로컬 기록 혼입 차단

- **ID**: 109
- **날짜**: 2026-08-10
- **유형**: 계정 데이터 동기화 버그 수정

## 작업 요약

카카오 로그인 후 DB 활동 스냅샷을 브라우저의 기존 로컬 기록 위에 병합하고, 개인 팜 DB 조회가 끝나기 전에 내 프로필을 표시하던 문제를 수정했다. 카카오 계정에서는 기존 계정 활동 캐시를 먼저 비운 뒤 DB 스냅샷으로 교체하고, 로그인 식별 정보는 보존한다. 꽃·곰 개인 팜 진행도도 DB에서 다시 조회한 뒤 프로필 화면을 열도록 변경했다.

## 원문 요청사항

```text
아니 카카오 로그인했을 때 db에 예전 기록은 남아있는데, 내 프로필에 적용이 안되는 거 같다니까? 그리고 카카오로그인인데 왜 로컬기록이 나와?
```

## 변경 파일 목록

- `react-app/src/App.tsx`: 카카오 계정의 로컬 활동 캐시를 DB 스냅샷으로 교체하고 개인 팜 DB 복원을 완료한 뒤 게임 표시
- `react-app/scripts/reviewOpsRegression.test.ts`: DB 우선 복원·로컬 초기화·개인 팜 복원 회귀 검사
- `react-app/src/runtimeBuild.ts`, `src/app/page.home/view.pug`, `src/assets/jochwon-app/`: 운영 iframe v22 번들 반영
- `devlog.md`, `devlog/2026-08-10/109-kakao-db-authoritative-profile-restore.md`: 작업 이력 기록

## 검증 결과

- ReviewOps 회귀 테스트 8건 통과
- TypeScript·React·Express 프로덕션 빌드 및 성능 검사 통과
- 런타임 엔트리 테스트 6건 통과
- WIZ 일반 빌드 통과
- `git diff --check` 통과
- 기존 SUIT 폰트 런타임 경로 경고는 남아 있으며 이번 변경과 무관함
