# 프로젝트 보드 3종 정리 및 협업 최신 revision 강제 조회

- **ID**: 110
- **날짜**: 2026-08-10
- **유형**: 협업 동기화·콘텐츠 정리

## 작업 요약

프로젝트 둘러보기에는 세종 야간축제 탐방, 수목원 사진 기록, 전통시장 문화 기록 프로젝트만 지정 순서로 표시하도록 정리했다. 협업 테이블의 역할·아이디어·테마/먹거리 새로고침이 동일한 GET 주소의 이전 응답을 재사용할 수 있던 문제를 해결하기 위해 모든 협업 요청에 고유 동기화 토큰과 `no-store` 정책을 적용했다. 게스트 환경에서도 세 프로젝트가 동일하게 보이도록 누락된 야간축제 기본 프로젝트도 추가했다.

## 원문 요청사항

```text
PROJECT BOARD 프로젝트 둘러보기에 세종 야간축제 탐방, 수목원 사진 기록, 전통시장 문화 기록 프로젝트만 남기고 다른 것은 삭제해 주세요. 상대방이 바꾼 역할과 아이디어 보드, 테마·먹거리 내용이 새로고침 후에도 반영되지 않는 문제도 수정해 주세요.
```

## 변경 파일 목록

- `react-app/src/components/ProjectRoomInteractions.tsx`: 보드 프로젝트 3종 제한·정렬 및 협업 API 캐시 방지
- `react-app/src/services/projectRoomProjects.ts`: 게스트 기본 목록에 야간축제 프로젝트 추가
- `react-app/scripts/reviewOpsRegression.test.ts`: 보드 목록과 최신 협업 조회 회귀 검사
- `react-app/src/runtimeBuild.ts`, `src/app/page.home/view.pug`, `src/assets/jochwon-app/`: 운영 iframe v23 번들 반영
- `devlog.md`, `devlog/2026-08-10/110-project-board-collaboration-refresh.md`: 작업 이력 기록

## 검증 결과

- ReviewOps 회귀 테스트 8건 통과
- TypeScript·React·Express 프로덕션 빌드 및 성능 검사 통과
- 런타임 엔트리 테스트 6건 통과
- WIZ 일반 빌드 통과
- `git diff --check` 통과
- 기존 SUIT 폰트 런타임 경로 경고는 남아 있으며 이번 변경과 무관함
