# 전체 맵 AI 행동 데이터 MySQL 동기화

- **ID**: 003
- **날짜**: 2026-08-04
- **리뷰 ID**: dlmjprouqbkgpwouqweoxyufxujesyzk
- **유형**: 데이터 영속화 및 운영 연결

## 사용자 원본 요청

> 현재 MySQL 서버 자체는 연결되지만, 각 맵의 AI 행동 데이터는 운영 환경에서 MySQL까지 전달되지 않습니다. … 다 연결해줘

## 작업 내용

- WIZ 로그인 사용자별 AI 행동 상태를 저장하는 MySQL `ai_behavior_state` 모델을 추가했다.
- `/wiz/api/page.home/behavior_state`에 인증 기반 저장·복원 API를 구현했다.
- 저장 키, 개별 값, 전체 요청 크기를 제한하고 허용된 맵 행동 키 접두사만 받도록 검증했다.
- 공연장·먹거리·축제·수목원·베어트리파크·캠퍼스·정부청사·프로젝트실 등 기존 `localStorage` 행동 기록을 하나의 동기화 계층에서 MySQL로 자동 전송하도록 연결했다.
- 로그인 후 서버 상태를 먼저 복원하고, 로컬 캐시 변경은 2초 단위 및 온라인 복귀·페이지 종료 시 서버에 반영하도록 했다.
- 서버 복원이 끝나기 전에 게임이 시작되지 않도록 초기 로딩 흐름을 연결했다.
- React 프로덕션 번들을 WIZ 정적 자산에 반영하고 운영 WIZ 빌드 캐시를 갱신했다.

## 변경 파일

- `src/model/db/ai_behavior_state.py`
- `src/model/struct.py`
- `src/app/page.home/api.py`
- `react-app/src/services/behaviorStateSync.ts`
- `react-app/src/App.tsx`
- `src/assets/jochwon-app/index.html`
- `src/assets/jochwon-app/assets/*` 중 이번 React 빌드 해시 파일
- `devlog.md`
- `devlog/2026-08-04/003-connect-map-ai-behavior-to-mysql.md`

기존 세션의 카카오 콜백 수정과 관련 빌드 파일은 보존했다.

## 확인 결과

- Python 구문 검사 성공.
- React·Vite·Express 전체 프로덕션 빌드 성공.
- Express 서버 자동 테스트 43개 통과.
- 캐릭터 이동 테스트 통과.
- Greenhouse 테스트 통과. 기본 파일 감시 한도 오류가 있어 polling 모드로 재실행했다.
- WIZ `main` 일반 빌드 성공 및 운영 WIZ 빌드 API 반영 성공.
- 비로그인 저장 API가 JSON 401을 반환해 인증 보호를 확인했다.
- 체험용 인증 세션에서 2개 맵 행동 키 POST·GET 왕복 성공.
- MySQL `ai_behavior_state`에서 동일 사용자·버전·2개 항목 저장을 직접 확인했다.
- 검증용 행동 상태와 체험 계정은 확인 후 삭제했다.
- 운영 정적 번들이 새 WIZ 행동 저장 API 경로를 포함한 것을 확인했다.
- `git diff --check` 통과.

## 남은 리스크

- 로그아웃 사용자와 게스트 맵 체험은 계정 식별자가 없으므로 서버에 저장하지 않고 로컬 캐시만 사용한다.
- 브라우저별 마지막 변경 시각을 기준으로 전체 스냅샷을 병합하므로, 같은 계정을 여러 기기에서 동시에 수정하면 마지막 동기화가 우선한다.
- Express 전용 채팅·Socket.IO·외부 AI API 경로의 운영 프록시는 별도 인프라 작업이 필요하지만, 각 맵에서 생성된 로컬·fallback AI 행동 결과의 MySQL 저장·복원은 WIZ API로 동작한다.
