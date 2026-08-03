# React 백엔드 MySQL 전환

## 사용자 요청

> env 파일은 어떻게 변경해야하지? 그리고 몽고디비 사용하는 거 mysql 연결해서 백엔드해주라. `[DB_HOST]`에서 사용했던 DB를 다시 연결해줘

공개 devlog 보안 원칙에 따라 원문에 포함된 실제 DB 호스트는 마스킹했다.

## 변경 내용

- Express 백엔드의 MongoDB·Mongoose·내장 MongoDB 의존성을 제거하고 `mysql2` 연결 풀로 교체했다.
- 기존 REST·Socket.IO 코드의 모델 호출 형태를 유지하는 MySQL JSON 문서 저장 계층을 추가했다.
- 사용자, 커뮤니티, 채팅방, 메시지, 장소 추천, 포탈 위치, 리스폰 위치 모델을 MySQL 저장소에 연결했다.
- 인증 진단 API가 MySQL 연결 상태와 데이터베이스 이름을 보고하도록 변경했다.
- 추적되지 않는 로컬 `server/.env`에 기존 MySQL 접속 설정을 복원하고, 공개 가능한 `server/.env.example`에는 자리표시자만 기록했다.
- React 프로젝트 README에 MySQL 환경변수 설정과 데이터 저장 구조를 문서화했다.

## 변경 파일

- `react-app/server/src/config/env.ts`
- `react-app/server/src/config/database.ts`
- `react-app/server/src/database/mysqlJsonModel.ts`
- `react-app/server/src/models/*.ts`
- `react-app/server/src/routes/auth.ts`
- `react-app/server/src/routes/community.ts`
- `react-app/server/src/routes/jointCampusRecommendations.ts`
- `react-app/server/src/services/chat/directChatPolicyService.ts`
- `react-app/server/src/socket/registerSocketHandlers.ts`
- `react-app/server/package.json`
- `react-app/server/package-lock.json`
- `react-app/server/.env.example`
- `react-app/README.md`
- `README.md`
- `devlog.md`

## 확인 결과

- 실제 MySQL 접속 및 `sj_hackathon` 데이터베이스 선택 성공
- `jochwon_documents` 테이블 생성 확인
- 임시 문서 생성·조회·수정·삭제 성공 후 테스트 데이터 제거
- 서버 TypeScript 타입 검사 성공
- 서버 자동 테스트 41개 통과
- React·Vite·Express 전체 빌드 성공
- WIZ `main` 프로젝트 일반 빌드 성공
- Express 서버 기동 후 `/health` 200 응답 및 인증 진단 API의 MySQL 연결 상태 `true` 확인
- 실제 `server/.env`가 Git ignore 대상임을 확인

## 남은 사항

- Express·Socket.IO 서버는 WIZ Python 런타임과 별도 프로세스이므로 운영용 프로세스 관리 및 `/api`, Socket.IO 리버스 프록시 구성이 필요하다.
- JSON 문서 호환 저장은 기존 코드 이식을 위한 구조이며, 데이터가 커지면 도메인별 정규화 테이블과 인덱스로 전환해야 한다.
- 운영 환경에서는 MySQL `root` 대신 최소 권한 전용 계정과 Secret 저장소를 사용해야 한다.
