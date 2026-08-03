# WIZ API 비밀 설정 구성

## 사용자 요청

> 그러면 내가 기존에 있는 api 연결하게 해줘 새로 비밀파일 만들어서

## 변경 내용

- Git에서 제외되는 `config/secret.py`를 WIZ 전용 비밀 설정 파일로 만들었다.
- 외부 백엔드, OpenAI, Kakao, 세종시 공공데이터, Tour API 설정 항목을 한곳에 정의했다.
- 실제 비밀값이 포함되지 않은 `config-sample/secret.py`를 추가해 설정 형식을 문서화했다.
- `page.home` API에서 `wiz.config("secret")`을 읽고 키를 노출하지 않은 채 제공자별 설정 여부만 반환하는 `api_config_status` 함수를 추가했다.
- 현재 저장소와 실행 환경에 실제 외부 API 키가 없어 비밀값은 빈 상태로 두었다.

## 변경 파일

- `config/secret.py` (Git 제외 비밀 파일)
- `config-sample/secret.py`
- `src/app/page.home/api.py`
- `devlog.md`
- `devlog/2026-08-03/002-add-wiz-api-secret-config.md`

## 확인 결과

- WIZ `main` 프로젝트 일반 빌드 성공
- `config/secret.py`가 Git ignore 대상임을 확인
- 공개 샘플에 실제 자격증명이 포함되지 않았음을 확인
- 배포된 `/api/*`가 현재 API JSON이 아닌 WIZ HTML fallback을 반환하는 상태임을 확인

## 남은 사항

- 실제 API 키와 별도 Express 백엔드 주소가 제공되지 않아 외부 API 호출은 아직 활성화되지 않았다.
- 기존 React 앱의 `/api/*` 전체 기능을 운영에서 사용하려면 Express 서버를 별도 배포하고 리버스 프록시를 구성하거나 해당 API를 WIZ Python API로 이식해야 한다.
