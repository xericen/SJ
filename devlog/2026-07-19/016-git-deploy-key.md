# Git Deploy Key 생성

## 사용자 원본 요청

> GIT 연결하려고하는데 Deploy keys 만듫어줘 내가 연결할게.

## 작업 내용

- 리뷰 ID 전용 ED25519 SSH 키 쌍을 생성했다.
- 개인키가 소스 및 Git 이력에 포함되지 않도록 `.git/deploy-keys/`에 저장했다.
- 자동 배포용으로 암호 없이 생성하고 개인키 권한을 소유자 전용으로 제한했다.

## 변경 파일

- `.git/deploy-keys/cwbbogxjkwzznuzsqgvyayjbjbpacqgg_ed25519`
- `.git/deploy-keys/cwbbogxjkwzznuzsqgvyayjbjbpacqgg_ed25519.pub`
- `devlog.md`
- `devlog/2026-07-19/016-git-deploy-key.md`

## 확인 결과

- 공개키 형식: ED25519
- 지문: `SHA256:JkeMouoWh+K3TMkWY8gU2EnXD6uDWgx88tAgkrBkvYg`
- 디렉터리/개인키/공개키 권한: `700` / `600` / `644`
- `ssh-keygen -lf`로 공개키를 정상적으로 읽고 지문이 출력되는 것을 확인했다.
