# 정부청사 프로필 완성도 게이트 수정

- 원본 요청: 체험용 프로필 완성도가 50%를 넘었는데 정부청사에 들어가지 못하는 문제 수정.
- 변경 파일: `react-app/src/game/scenes/WorldScene.ts`
- 변경 내용: 포탈 게이트가 사용하던 AI 추천 프로필 완성도 대신 프로필 화면과 동일한 `buildProfileProgress(profile).completion` 값을 사용하도록 변경했다. 50% 미만만 차단한다.
- 검증: React 및 WIZ 빌드 후 운영 번들에서 게이트 로직 확인.
