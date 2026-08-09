# 비가입자 동아리 콘텐츠 차단 운영 번들 누락 수정

- 사용자 요청: 가입하지 않았는데도 동아리 활동과 사진이 보이는 문제 수정
- 원인: React 빌드 결과가 현재 WIZ 프로젝트 정적 자산에 동기화되지 않음
- 변경 파일: `react-app/src/runtimeBuild.ts`, `src/app/page.home/view.pug`, `src/assets/jochwon-app/**`
- 확인: React 빌드·성능 검사, WIZ 빌드 성공, 운영 엔트리 `index-DhfVT8K2.js` 확인
- 남은 리스크: 기존 열린 페이지는 한 번 새로고침 필요
