# 프로젝트실 아이디어·역할·테마/먹거리 수동 새로고침 추가

- **ID**: 100
- **날짜**: 2026-08-09
- **유형**: 협업 UX 개선

## 작업 요약

프로젝트실의 장소 아이디어보드, 역할 및 멤버, 축제·테마·먹거리 아이디어 영역에 수동 새로고침 버튼을 추가했다. 버튼을 누르면 현재 프로젝트의 공용 WIZ 협업 초안을 서버에서 강제로 다시 읽어 다른 플레이어가 추가하거나 변경한 장소·역할·테마·먹거리 내용을 즉시 화면과 로컬 초안에 반영한다.

## 원문 요청사항

```text
프로젝트실에서도 어이디어보드,장소추가버튼 왼쪽에 새로고침버튼 추가, 역학에도 새로고침,테마및어쩌구에도 새로고침추가,해서 다른 플레이어가 추가한 거 새로고침해서 가져올 수 있게 수정해줘.
```

## 변경 파일 목록

- `react-app/src/components/ProjectRoomInteractions.tsx`: 공용 초안 강제 조회 함수, 중복 요청 차단, 완료 안내 및 세 화면 새로고침 버튼
- `react-app/src/components/ProjectRoomInteractions.css`: 아이디어·역할·테마/먹거리 새로고침 버튼 배치와 로딩 회전 효과
- `react-app/scripts/reviewOpsRegression.test.ts`: 서버 강제 조회와 세 화면 버튼 회귀 검사
- `react-app/src/runtimeBuild.ts`, `src/app/page.home/view.pug`: 운영 iframe 캐시 버전 v13 반영
- `src/assets/jochwon-app/`: 새 React 프로덕션 번들 반영
- `devlog.md`, `devlog/2026-08-09/100-project-room-manual-collaboration-refresh.md`: 작업 이력 기록

## 검증 결과

- ReviewOps 회귀 테스트 6건 통과
- TypeScript·React·Express 프로덕션 빌드, 성능 검사, WIZ 일반 빌드, `git diff --check` 통과
- 운영 `/main.js`와 iframe에서 v13 확인
- 운영 GamePage 번들이 로컬 배포 파일과 SHA-256 일치
- 운영 번들에서 장소 아이디어, 역할, 테마·먹거리 새로고침 문구와 최신 협업 내용 안내 확인
- 기존 SUIT 폰트 런타임 경로 경고는 남아 있으며 이번 변경과 무관함
