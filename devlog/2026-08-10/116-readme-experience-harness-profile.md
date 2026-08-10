# 116. 17개 월드 Experience Harness 프로필 생성 구조 문서화

## 사용자 요청

> 각 맵들 사용자 체험이 하네스 구조로 저장되는데, 17개 맵에서 어떻게 프로필이 작성되는지도 README에 추가하고 푸시해줘

## 변경 내용

- Experience Harness의 수집·해석·저장·집계·활용 흐름을 README에 추가했습니다.
- 공개된 17개 월드별 대표 수집 행동과 프로필 반영 항목을 표로 정리했습니다.
- 방문 영역과 실제 행동을 함께 사용해 완성도와 6개 성향 점수를 계산하는 방식을 설명했습니다.
- 카카오 로그인 DB 기록과 게스트 체험 기록의 분리 원칙을 명시했습니다.

## 변경 파일

- `README.md`
- `devlog.md`
- `devlog/2026-08-10/116-readme-experience-harness-profile.md`

## 확인 결과

- 실제 `ExperienceHarnessCollector`, `experienceHarness.ts`, `profileProgress.ts` 구현과 문서 내용 대조
- 공개 월드 목록 17개 일치 확인
- Markdown 공백 검사 통과 후 GitHub `main` 반영
