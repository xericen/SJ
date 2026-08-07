# 059 전체 맵 진입 안내문을 세종예술의전당 GUIDE 디자인으로 통일

- 요청: 각 맵 설명문을 세종예술의전당 진입 안내문과 동일한 디자인으로 변경.
- 변경 파일: `react-app/src/components/CampusMapIntro.tsx`, `react-app/src/assets/jochwon-app/*` 빌드 산출물.
- 변경 내용: 기존 전용 카드 스타일을 제거하고 세종예술의전당과 동일한 `GUIDE` 헤더, 충녕이 아이콘, 3단계 안내 카드, 팁 박스, 하단 확인 버튼 구조와 공통 CSS 클래스를 사용하도록 통일했다.
- 확인: `npm run build` 성공, `git diff --check` 통과, WIZ `main` 프로젝트 빌드 성공.
