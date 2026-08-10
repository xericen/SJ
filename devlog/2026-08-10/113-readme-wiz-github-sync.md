# README 기술 문서 보강 및 WIZ·GitHub 반영 점검

- **ID**: 113
- **날짜**: 2026-08-10
- **유형**: 문서·배포·형상관리

## 작업 요약

기존 README의 사용자 흐름과 기능 설명을 유지하면서 런타임 데이터 흐름, AI 추천 안전장치, 상태 일관성 및 동시 편집 설계를 추가했다. 특정 행사나 평가를 직접 언급하는 표현은 제거하고 일반 서비스 기술 문서로 정리했다. 현재 세션에서 변경된 WIZ 소스와 React 운영 번들을 다시 빌드·동기화하고 GitHub `main` 반영 상태를 점검한다.

## 원문 요청사항

```text
지금까지 한 내용을 https://github.com/xericen/SJ 에 커밋하고 푸시하고, WIZ의 모든 내용이 정상적으로 올라갔는지 확인해 주세요. README는 현재 내용을 유지하면서 기술적인 내용을 더 풍성하게 작성하되 해커톤 관련 내용은 빼 주세요.
```

## 변경 파일 목록

- `README.md`: 기술 아키텍처·데이터 흐름·AI 안전장치·동시 편집 설계 보강 및 행사·평가 표현 제거
- `src/assets/jochwon-app/`: 최신 React `dist`와 삭제 동기화한 WIZ 운영 번들
- `devlog.md`, `devlog/2026-08-10/113-readme-wiz-github-sync.md`: 작업 이력 기록
- 이번 세션의 기능 소스·테스트·API·v25 런타임 변경 전체를 동일 커밋 대상으로 포함

## 검증 결과

- ReviewOps·개인 팜 회귀 테스트 19건, 런타임 엔트리 6건, 운영 API 2건 통과
- Express 전체 테스트 70건 통과
- TypeScript·React·Express 프로덕션 빌드 및 성능 검사 통과
- Python 문법 검사와 WIZ 일반 빌드 통과
- React `dist`와 WIZ 정적 번들 144개 파일 완전 일치
- 운영 정적 파일 143개 HTTP 200·파일 크기 일치, 엔트리 JavaScript·CSS SHA-256 일치
- 운영 index는 v25이며 로컬 index와 ReviewOps SDK 주입 부분만 다름
- `git diff --check` 통과 및 README의 행사·평가 직접 표현 제거 확인
