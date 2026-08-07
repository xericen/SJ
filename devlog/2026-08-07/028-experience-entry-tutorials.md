# 축제부스·먹거리부스 진입 안내 추가

- 원본 요청: `먹거리부스랑, 축제부스 들어가면 세종예술의 전당처럼 처음에 설명 나오게 해줘`
- 변경 파일: `react-app/src/components/ArtsCenterTutorial.tsx`, `react-app/src/pages/GamePage.tsx`, `react-app/scripts/experienceTutorial.test.ts`
- 변경 내용: 세종예술의전당 진입 안내와 같은 모달 흐름을 축제부스·먹거리부스에도 추가하고, 각 공간에 맞는 안내 문구와 3단계 이용 방법을 표시한다.
- 확인: 진입 맵별 안내 상태와 렌더링을 정적 테스트로 검증하고 WIZ 빌드·운영 반영을 확인한다.
- 남은 리스크: 같은 탭에서 해당 공간을 재방문하면 기존 화면 상태에 따라 안내가 다시 표시될 수 있다.
