# 프로젝트 생성 500 원인 수정 및 저장 fallback 보강

## 사용자 원본 요청

> 프로젝트 생성 시 community API가 500을 반환하고 프로젝트 둘러보기에 추가되지 않는 문제를 수정해줘.

## 변경 파일

- `src/app/page.home/api.py`: 공유 저장 시 필수 `user_id`·`version` 컬럼을 기록하고, 프로젝트 생성 실패 시 전용/공유/응답 fallback을 순서대로 적용
- `devlog.md`
- `devlog/2026-08-08/026-project-create-500-root-cause.md`

## 확인 결과

- WIZ 프로젝트 `main` 연결 확인
- WIZ 빌드 성공: `Project 'main' build completed.`
- WIZ 파일 재조회로 수정 코드 반영 확인

## 남은 리스크

- 외부 브라우저의 기존 번들·서버 캐시가 남아 있을 수 있어 배포 후 강력 새로고침이 필요합니다.
