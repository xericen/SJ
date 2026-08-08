# 운영 번들 동기화 및 WIZ 런타임 재시작

## 사용자 원본 요청

> 운영 서버 로그 확인 또는 런타임 재시작을 진행해 외부 HTTP 500을 해결해줘.

## 변경 파일

- `src/app/page.home/api.py`: WIZ Source에 직접 동기화
- `devlog.md`
- `devlog/2026-08-08/028-sync-runtime-and-restart.md`

## 확인 결과

- 운영 로그에서 원인 확인: `ai_behavior_state.model_user_id`에 빈 값 중복 INSERT
- WIZ Source `api.py` 직접 동기화
- WIZ 빌드 성공
- 실행 중 WIZ 런타임 재시작
- 외부 `community?action=create` 재검증 결과 HTTP 200 확인

## 남은 리스크

- 구형 프로젝트 DB 저장이 실패하는 환경에서는 응답에 `persisted:false`가 포함될 수 있으며, 이 경우 클라이언트 로컬 목록에는 반영되지만 서버 영구 저장은 별도 DB 마이그레이션이 필요합니다.
