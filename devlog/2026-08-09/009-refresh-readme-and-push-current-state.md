# 현재 맵 기준 README 갱신 및 GitHub 배포

## 사용자 요청

> 지금까지한 거 https://github.com/xericen/SJ 여기에 새로 커밋하고 푸시해줘, 그리고 readme 지금 맵에 맞춰서 다시 수정해줘!

## 변경 내용

- README의 22개 맵 구성을 현재 `MapId`와 대조했습니다.
- 정부청사 중앙광장의 완료 프로젝트 기반 01 PROJECT → 02 AI → 03 VISIT 흐름을 문서화했습니다.
- 전체 프로필 기반 OpenAI 분석, 9단계 분석, 확정 코스 분리 저장과 인라인 카카오지도 동작을 반영했습니다.
- 정부청사 보행 최적화와 베어트리파크 밝기 개선을 현재 기능에 추가했습니다.
- 현재 정적 번들만 유지하고 누적된 과거 해시 번들을 저장소에서 정리했습니다.

## 변경 파일

- `README.md`
- 이번 세션의 React·서버·WIZ 소스 및 최신 정적 빌드 산출물
- `devlog.md`
- `devlog/2026-08-09/009-refresh-readme-and-push-current-state.md`

## 확인 결과

- 실제 `MapId` 22개와 README 맵 수 일치
- React TypeScript, Vite, 서버 및 WIZ 빌드 성공
- 비밀 설정 파일 제외 확인 후 GitHub `xericen/SJ`의 `main` 브랜치에 새 커밋 푸시
