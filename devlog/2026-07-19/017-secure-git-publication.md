# 공개 저장소 보안 정리 및 Git 배포 준비

## 사용자 원본 요청

> 연결했고, 오늘 한 거 중요한 부분은 가려서 커밋한 후에 푸시해줘, 다른 기업들이 GIT사용하는 거 처럼 올려주고, READE는 자세히 작성해줘

## 작업 내용

- 오늘까지 누적된 서비스 구현 변경분을 커밋 대상으로 정리했다.
- 문서에 남아 있던 실제 인프라 접속 정보와 테스트 인증값을 비공개 처리했다.
- 데모 계정과 평문 비밀번호가 포함된 기존 README를 제품·기술·운영 중심 문서로 전면 개편했다.
- 환경변수 예시 파일을 추가하고 비밀정보, 개인키, DB 파일, 런타임 산출물에 대한 Git 제외 규칙을 강화했다.
- Deploy Key를 사용하는 SSH 원격 연결과 빌드 검증 후 `main` 브랜치에 게시하도록 준비했다.

## 변경 파일

- `README.md`
- `.gitignore`
- `.env.example`
- `devlog.md`
- `devlog/2026-07-18/003-phone-auth-sejong-masil-flow.md`
- `devlog/2026-07-19/005-mysql-auth-integration.md`
- `devlog/2026-07-19/017-secure-git-publication.md`
- 오늘까지 작업된 `src/` 애플리케이션 및 자산 파일

## 확인 결과

- 공개 저장소 대상 파일의 실제 DB 호스트·비밀번호와 기존 데모 비밀번호 제거를 확인했다.
- Deploy Key로 GitHub 원격 저장소를 조회할 수 있음을 확인했다.
- Git 공백 오류 검사를 통과했다.
- WIZ 일반 빌드(`clean=false`)가 EsBuild 오류 없이 성공했다.
