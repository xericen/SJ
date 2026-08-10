# 모집센터 내 모집 관리·소유자 신청 차단·승인 및 정원 완료 연동

- **ID**: 105
- **날짜**: 2026-08-10
- **유형**: 기능 보완·버그 수정

## 작업 요약

로그인 사용자가 작성한 모집글을 충녕이 내 모집 관리와 키오스크에서 동일하게 확인하도록 공용 프로젝트 DB를 먼저 최신화하고 커뮤니티 모집글을 병합하도록 변경했다. 키오스크에서 작성자 본인의 모집글 신청 버튼을 비활성화했으며 서버에서도 소유자 신청을 차단한다. 내 모집 상세에서 신청자의 프로필을 확인해 승인·거절할 수 있고, 승인으로 정원이 차면 프로젝트 상태를 자동으로 완료 처리하도록 클라이언트와 WIZ API를 함께 수정했다.

## 원문 요청사항

```text
로그인했을 때, 모집센터에서 모집글 작성하면 충녕이 내 모집관리에도 들어가고 키오스크에서 들어가야함. 내 모집관리에는 안 들어가는 거 같음 수정해줘. 그리고 내 모집들에는 내가 신청 못하게 해주고, 내 모집글 상세보기 들어가면 신청한 사람 떠서 수락, 거절할 수 있게 해줘, 인원 다 차면 모집글 완성되게 해줘.
```

## 변경 파일 목록

- `react-app/src/components/RecruitmentCenterDesk.tsx`: 공용 모집 최신화, 내 모집 신청 차단, 상세 신청자 승인·거절, 정원 완료 UI 상태 반영
- `src/app/page.home/api.py`: 로그인 소유권 기반 신청·심사 권한 검사 및 승인 인원·완료 상태 저장
- `react-app/scripts/reviewOpsRegression.test.ts`: 모집 관리·소유자 신청 차단·완료 처리 회귀 검사
- `react-app/src/runtimeBuild.ts`, `src/app/page.home/view.pug`, `src/assets/jochwon-app/`: 운영 iframe v18 번들 반영
- `devlog.md`, `devlog/2026-08-10/105-recruitment-owner-management-capacity-completion.md`: 작업 이력 기록

## 검증 결과

- ReviewOps 회귀 테스트 6건 통과
- Python 문법 검사 통과
- TypeScript·React·Express 프로덕션 빌드 및 성능 검사 통과
- 런타임 엔트리 테스트 6건 통과
- WIZ 일반 빌드 통과
- `git diff --check` 통과
- 기존 SUIT 폰트 런타임 경로 경고는 남아 있으며 이번 변경과 무관함
