# 모집글과 프로젝트글 종류·화면 분리

- **ID**: 111
- **날짜**: 2026-08-10
- **유형**: 데이터 모델·화면 분리

## 작업 요약

모집센터가 프로젝트 저장소 전체를 읽어 프로젝트글까지 모집글로 표시하던 문제를 수정했다. 저장 데이터에 `recruitment`와 `project` 종류를 명시하고, 모집센터는 모집글 전용 조회·저장 함수를 사용하며 프로젝트실과 로비 전광판은 모집글을 제외하도록 분리했다. 기존 모집글은 `recruitment-` ID를 통해 자동 분류해 호환성을 유지한다.

## 원문 요청사항

```text
모집센터에 있는 모집글과 프로젝트실에 있는 프로젝트는 다릅니다. 모집글에서는 모집글만, 프로젝트글에서는 프로젝트만 보여야 합니다.
```

## 변경 파일 목록

- `react-app/src/services/projectRoomProjects.ts`: 글 종류와 모집글 전용 조회·저장 API 추가
- `react-app/src/components/RecruitmentCenterDesk.tsx`: 모집글 데이터만 조회·표시·저장
- `react-app/src/components/ProjectRoomInteractions.tsx`, `react-app/src/components/ProjectLobbyBoard.tsx`: 프로젝트 화면에서 모집글 제외
- `src/app/page.home/api.py`: 서버 저장 데이터에 글 종류 정규화
- `react-app/scripts/reviewOpsRegression.test.ts`: 모집글·프로젝트글 분리 회귀 검사
- `react-app/src/runtimeBuild.ts`, `src/app/page.home/view.pug`, `src/assets/jochwon-app/`: 운영 iframe v24 번들 반영
- `devlog.md`, `devlog/2026-08-10/111-separate-recruitment-and-project-posts.md`: 작업 이력 기록

## 검증 결과

- ReviewOps 회귀 테스트 8건 통과
- TypeScript·React·Express 프로덕션 빌드 및 성능 검사 통과
- 런타임 엔트리 테스트 6건 통과
- WIZ 일반 빌드 통과
- `git diff --check` 통과
- 기존 SUIT 폰트 런타임 경로 경고는 남아 있으며 이번 변경과 무관함
