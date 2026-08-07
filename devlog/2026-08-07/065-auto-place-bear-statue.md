# 곰 동상 자동 설치 보완

- 요청: 곰 체험소에서 먹이 5개를 모두 주면 마이홈에 곰 동상이 자동으로 나타나도록 수정한다.
- 원인: 서버가 `bear-statue` 보상을 잠금 해제해도 `activeRewardIds`에 자동 추가하지 않아 마이홈 배치 상태가 비어 있을 수 있었다.
- 변경 파일: `src/app/page.home/api.py`, `devlog.md`.
- 변경 내용: 곰 5회 급여 완료 시 `bear-statue`를 `activeRewardIds`에 자동 추가한다.
- 확인: WIZ 프로젝트 빌드 및 Python 구문 검사를 수행한다.
