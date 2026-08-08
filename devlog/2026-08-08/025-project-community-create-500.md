# 프로젝트 저장 community 500 오류 보정

## 사용자 원본 요청

> 프로젝트 생성 API 요청에서 HTTP 500 Internal Server Error가 발생하니 수정해줘.

## 변경 파일

- `src/app/page.home/api.py`: `kind=project-room-project` 요청을 프로젝트 저장기로 분기하고, 구형 DB 스키마에서는 공유 저장소로 안전하게 fallback
- `devlog.md`
- `devlog/2026-08-08/025-project-community-create-500.md`

## 확인 결과

- WIZ `main` 프로젝트 연결 확인
- `python -m py_compile src/app/page.home/api.py` 성공
- WIZ 빌드 성공: `Project 'main' build completed.`
- 기존 전용 프로젝트 목록 API는 HTTP 200으로 응답함을 확인

## 남은 리스크

- 외부 URL의 생성 요청은 인증·배포 캐시 상태에 따라 즉시 재현 결과가 달라질 수 있습니다. 배포 후 동일 URL을 강력 새로고침하여 재시도해야 합니다.
