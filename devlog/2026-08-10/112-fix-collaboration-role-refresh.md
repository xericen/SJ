# 협업 역할 이중 상태 통합 및 새로고침 응답 복구

- **ID**: 112
- **날짜**: 2026-08-10
- **유형**: 실시간 협업 동기화 버그 수정

## 작업 요약

역할 전용 상태와 협업 초안의 역할 배열이 별도로 저장되면서 역할 변경 revision이 증가하지 않고, 상대방이 새로고침하면 오래된 초안 역할이 표시되던 문제를 수정했다. 역할 변경 시 두 저장값과 revision을 함께 갱신하고, 조회 시 역할 전용 상태를 초안에 다시 적용한다. 클라이언트도 역할 변경을 전용 API로 확정하고 서버 역할 맵을 화면에 병합한다. 협업 요청에는 8초 제한을 추가해 저장 요청이 멈췄을 때 역할·장소·테마/먹거리 새로고침 버튼이 계속 대기하는 문제를 방지했다.

## 원문 요청사항

```text
상대방이 내 역할을 일정 관리로 바꿨는데 새로고침해도 프로젝트 리더로 보입니다. 아이디어 보드의 장소, 테마 및 먹거리 새로고침도 실행되지 않습니다. 원인을 찾고 해결해 주세요.
```

## 변경 파일 목록

- `react-app/src/components/ProjectRoomInteractions.tsx`: 역할 전용 저장·서버 역할 병합·협업 요청 제한시간 적용
- `src/app/page.home/api.py`: 역할 맵과 초안 역할 동시 갱신 및 revision 증가
- `react-app/scripts/reviewOpsRegression.test.ts`: 역할·revision·새로고침 중단 방지 회귀 검사
- `react-app/src/runtimeBuild.ts`, `src/app/page.home/view.pug`, `src/assets/jochwon-app/`: 운영 iframe v25 번들 반영
- `devlog.md`, `devlog/2026-08-10/112-fix-collaboration-role-refresh.md`: 작업 이력 기록

## 검증 결과

- ReviewOps 회귀 테스트 8건 통과
- TypeScript·React·Express 프로덕션 빌드 및 성능 검사 통과
- 런타임 엔트리 테스트 6건 통과
- WIZ 일반 빌드 통과
- `git diff --check` 통과
- 기존 SUIT 폰트 런타임 경로 경고는 남아 있으며 이번 변경과 무관함
