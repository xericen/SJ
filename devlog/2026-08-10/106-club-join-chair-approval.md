# 동아리 가입 즉시 승인 제거 및 회장 승인·거절 절차 복구

- **ID**: 106
- **날짜**: 2026-08-10
- **유형**: 버그 수정

## 작업 요약

동아리 거리제 가입 API가 신청자를 즉시 구성원으로 추가하던 원인을 수정했다. 가입 시 대기 신청만 생성하고 신청자에게 승인 대기 상태를 표시한다. 회장은 구성원 화면에서 대기 신청자를 승인하거나 거절할 수 있으며, 승인된 경우에만 구성원에 추가되고 동아리 콘텐츠 접근 권한을 얻는다.

## 원문 요청사항

```text
동아리 거리제에서 가입하고, 회장이 승인을 해줘야지 가입할 수 있게 구조 만들어놨는데, 현재 바로 승인됨, 이 부분 해결해줘
```

## 변경 파일 목록

- `src/app/page.home/api.py`: 가입 신청 대기 저장, 회장 전용 승인·거절 API 및 신청 정보 공개 범위 적용
- `react-app/src/components/ClubStreetExperience.tsx`: 승인 대기 버튼과 회장 신청 관리 UI 추가
- `react-app/scripts/reviewOpsRegression.test.ts`: 대기 신청·회장 권한·승인 UI 회귀 검사
- `react-app/src/runtimeBuild.ts`, `src/app/page.home/view.pug`, `src/assets/jochwon-app/`: 운영 iframe v19 번들 반영
- `devlog.md`, `devlog/2026-08-10/106-club-join-chair-approval.md`: 작업 이력 기록

## 검증 결과

- ReviewOps 회귀 테스트 6건 통과
- Python 문법 검사 통과
- TypeScript·React·Express 프로덕션 빌드 및 성능 검사 통과
- 런타임 엔트리 테스트 6건 통과
- WIZ 일반 빌드 통과
- `git diff --check` 통과
- 기존 SUIT 폰트 런타임 경로 경고는 남아 있으며 이번 변경과 무관함
