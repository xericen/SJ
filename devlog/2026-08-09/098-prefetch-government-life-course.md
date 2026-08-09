# 중앙광장 STEP 6 AI 코스 선행 생성으로 대기 시간 제거

- **ID**: 098
- **날짜**: 2026-08-09
- **유형**: 성능·UX 개선

## 작업 요약

중앙광장 프로필 분석 시작과 동시에 카카오 Local 장소 검색과 OpenAI 코스 생성을 선행 실행하도록 변경했다. STEP 6에 진입한 뒤 요청을 시작하던 직렬 처리 구조를 분석 애니메이션과 병렬 처리하도록 바꾸고, STEP 6~7은 생성 중에도 진행하며 실제 장소가 필요한 최종 완료 직전에서만 결과를 기다리도록 했다.

## 원문 요청사항

```text
중앙광장 step6에서 라이프 코스 짜는게 지금 너무 느려 이거 원인 찾고 해결해주라
```

## 원인

- 실제 카카오 장소 검색과 OpenAI 코스 생성 요청이 STEP 6에 도착한 뒤에야 시작됐다.
- 운영 요청에 약 10초가 필요한데 이 시간이 이전 분석 단계와 겹치지 않아 STEP 6 화면에서 전부 대기 시간으로 노출됐다.
- STEP 6은 장소 응답 전까지 다음 단계로 진행하지 못하도록 고정되어 네트워크 변동이 곧 화면 정지로 보였다.

## 변경 파일 목록

- `react-app/src/components/GovernmentAiRecommendationCenter.tsx`: 분석 시작 시 코스 선행 생성, STEP 6~7 비차단 진행, 완료 직전 실제 장소 검증
- `react-app/scripts/reviewOpsRegression.test.ts`: 선행 요청과 STEP 6 비차단 회귀 검사
- `react-app/src/runtimeBuild.ts`, `src/app/page.home/view.pug`: 운영 iframe 캐시 버전 v11 반영
- `src/assets/jochwon-app/`: 새 React 프로덕션 번들 반영
- `devlog.md`, `devlog/2026-08-09/098-prefetch-government-life-course.md`: 작업 이력 기록

## 검증 결과

- 기존 단계 기준 STEP 6 도달 전 13.7초 동안 약 10초의 코스 API 처리가 병렬 실행되는 구조 확인
- ReviewOps 회귀 테스트 6건 통과
- TypeScript·React·Express 프로덕션 빌드, 성능 검사, WIZ 일반 빌드, `git diff --check` 통과
- 운영 `/main.js`와 iframe에서 v11 확인
- 운영 신규 엔트리·GamePage 번들이 로컬 배포 파일과 SHA-256 일치
- 기존 SUIT 폰트 런타임 경로 경고는 남아 있으며 이번 변경과 무관함
