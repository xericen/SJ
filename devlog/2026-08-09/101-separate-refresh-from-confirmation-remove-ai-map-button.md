# 프로젝트 새로고침 확정 상태 분리 및 AI 일정 지도 버튼 제거

- **ID**: 101
- **날짜**: 2026-08-09
- **유형**: 버그 수정·UI 정리

## 작업 요약

프로젝트실 새로고침이 다른 플레이어의 최신 협업 내용과 함께 서버의 코스 확정 상태까지 덮어쓰던 문제를 수정했다. 아이디어·역할·대화·코스 내용은 최신화하되 현재 사용자의 `status`와 `courseConfirmed`는 유지해 새로고침과 확정 동작을 분리했다. 중앙광장 `AI 추천 일정 준비 완료`의 장소 목록은 읽기 전용으로 바꾸고 `지도 보기` 버튼과 지도 모달을 제거했다.

## 원문 요청사항

```text
프로젝트실에서 새로고침 하는거 누르면 확정되는 버튼이 아니라 같이 프로젝트 하는 사람이 바뀐 내용 볼 수 있게  최신화 해주는 버튼인데 지금 확정 되는 버튼으로 되어있는거 같아서 그거 수정해주고 AI 추천 일정 준비 완료에서 장소 나오고 옆에 지도보기 있는데 그 버튼은 빼주라
```

## 원인

- 수동·주기 새로고침이 서버의 `TravelProjectDraft` 전체를 현재 화면에 덮어썼다.
- 서버 초안에 다른 사용자가 저장한 `approved` 및 `courseConfirmed` 값이 있으면 새로고침만 해도 현재 화면이 확정된 것처럼 바뀌었다.
- AI 추천 완료 장소 목록이 각각 버튼으로 구현되어 불필요한 지도 모달을 열었다.

## 변경 파일 목록

- `react-app/src/components/ProjectRoomInteractions.tsx`: 최신 협업 초안 적용 시 현재 확정 상태 보존
- `react-app/src/components/GovernmentAiRecommendationCenter.tsx`: 추천 완료 장소 목록의 지도 버튼·모달 제거
- `react-app/src/components/GovernmentAiRecommendationCenter.css`: 읽기 전용 장소 목록 스타일
- `react-app/scripts/reviewOpsRegression.test.ts`: 새로고침 확정 상태 보존과 지도 버튼 제거 회귀 검사
- `react-app/src/runtimeBuild.ts`, `src/app/page.home/view.pug`: 운영 iframe 캐시 버전 v14 반영
- `src/assets/jochwon-app/`: 새 React 프로덕션 번들 반영
- `devlog.md`, `devlog/2026-08-09/101-separate-refresh-from-confirmation-remove-ai-map-button.md`: 작업 이력 기록

## 검증 결과

- ReviewOps 회귀 테스트 6건 통과
- TypeScript·React·Express 프로덕션 빌드, 성능 검사, WIZ 일반 빌드, `git diff --check` 통과
- 운영 `/main.js`와 iframe에서 v14 확인
- 운영 GamePage 번들이 로컬 배포 파일과 SHA-256 일치
- 운영 `AI 추천 일정 준비 완료` 화면 코드 주변에 `지도 보기` 문구가 없음을 확인
- 기존 SUIT 폰트 런타임 경로 경고는 남아 있으며 이번 변경과 무관함
