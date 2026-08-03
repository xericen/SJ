# WIZ API 비밀값 확인 및 연결 보정

## 사용자 요청

> 넣어놨는ㄴ데 확인해줘

## 변경 내용

- 사용자가 `config/secret.py`에 입력한 `.env` 형식 값을 Python 문자열 문법으로 안전하게 보정했다.
- 변수 선언이나 주석이 아닌 구분 문장을 주석 처리해 WIZ 설정 파일 문법 오류를 제거했다.
- 활성 WIZ 런타임 설정 경로인 `/opt/app/config/secret.py`에 동일 비밀파일을 권한 `600`으로 배치했다.
- Express 환경 로더가 기존 `server/.env`와 WIZ `config/secret.py`를 함께 읽도록 변경했다.
- `page.home`이 비밀 설정 로딩 실패 시 전체 API를 500으로 만들지 않도록 지연 로딩과 안전한 상태 응답을 적용했다.

## 변경 파일

- `config/secret.py` (Git 제외 비밀 파일)
- `/opt/app/config/secret.py` (WIZ 런타임 비밀 파일)
- `react-app/server/src/loadEnv.ts`
- `src/app/page.home/api.py`
- `devlog.md`
- `devlog/2026-08-03/003-verify-wiz-api-secrets.md`

## 확인 결과

- 프로젝트 및 WIZ 런타임 비밀파일 Python 문법 검사 성공
- WIZ 설정 상태 API 200 응답 및 OpenAI·Kakao 설정 인식 확인
- Express 서버 TypeScript 타입 검사 성공
- OpenAI 실제 요청 성공
- Kakao 실제 요청은 키를 인식했으나 OPEN_MAP_AND_LOCAL 서비스 비활성화로 403 응답
- React·Vite·Express 전체 빌드 성공
- WIZ 일반 빌드 및 클린 빌드 성공
- 기존 `page.home/me` API 200 응답 복구 확인

## 남은 사항

- Kakao Developers에서 해당 앱의 OPEN_MAP_AND_LOCAL 서비스를 활성화해야 장소 API가 성공한다.
- 세종시·Tour API 키와 별도 Express 백엔드 주소는 입력되지 않았다.
- 입력 형식 검사 과정에서 API 키가 오류 로그에 포함될 가능성이 있었으므로 운영 사용 전 해당 키를 재발급하는 것이 안전하다.
