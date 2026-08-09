# 최신 README 갱신 및 GitHub 배포

## 사용자 요청

> 지금까지한 거 https://github.com/xericen/SJ 여기에 새로 커밋하고 푸시해줘, 그리고 readme 지금 맵에 맞춰서 다시 수정해줘!

## 변경 내용

- README의 현재 22개 맵 구성을 실제 `MapId` 정의와 다시 대조했습니다.
- 로그아웃 후 카카오 재인증, 전체 GLB Meshopt 로더, 동아리 거리제·스마트시티 공간안내 미리보기 구조를 README에 추가했습니다.
- 이전 커밋 이후 누적된 인증 및 공간안내 GLB 변경과 운영 빌드 산출물을 새 커밋으로 정리해 GitHub `xericen/SJ`의 `main` 브랜치에 배포합니다.

## 변경 파일

- `README.md`
- 카카오 로그아웃·재인증 관련 React/WIZ API 파일
- GLB·Meshopt 로더 및 공간안내 미리보기 관련 React 파일
- 관련 회귀 테스트와 운영 빌드 산출물
- `devlog.md`
- `devlog/2026-08-09/010-*.md` ~ `015-*.md`

## 확인 결과

- README의 맵 수와 실제 `MapId` 22개 일치
- 카카오 재로그인 및 GLB 공간안내 회귀 테스트 통과
- React·서버, 성능 예산 및 WIZ 빌드 성공
- 비밀 설정 파일이 커밋 대상에서 제외됨을 확인
