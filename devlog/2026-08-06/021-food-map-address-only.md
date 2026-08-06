# 먹거리 부스 카카오맵 검색어를 주소 전용으로 변경

- **ID**: 021
- **날짜**: 2026-08-06
- **유형**: 버그 수정
- **리뷰 ID**: `rssgxmerxcutfpnybrhaspoqnbhihwxh`

## 작업 요약

먹거리 부스의 로컬 맛집·세종 특산물·카페/디저트 트럭에서 `지도 보기`를 열 때 카카오맵 검색어에 장소명을 섞지 않고 주소만 전달하도록 변경했다. 세 트럭의 모든 현재 장소 데이터가 주소 전용 링크를 생성하는지 전수 회귀 테스트를 추가했다.

## 원문 요청사항

```text
먹거리 부스 맵에서 각 트럭에서 지도 보기를 클릭하면, 카카오 지도에 연결되어 장소가 보여지는데, 카카오 지도에 이름 + 주소가 같이 입력되어서 장소가 잘 안 뜨는 경우가 많아, 그래서 주소만 입력되게 하면 좋을 거 같아. 예를 들어
세종특별자치시 조치원읍 허만석1로 32 2층 이게 주소면 카카오 검색에
세종특별자치시 조치원읍 허만석1로 32 2층 이것만 뜨게 ㅇㅋ?
```

## 변경 파일 목록

- `react-app/src/data/sejongFoodTypes.ts`: 카카오맵 검색 URL을 주소 한 개만 받는 함수로 변경
- `react-app/src/data/sejongDiningCodePlaces.ts`: 음식점·카페 링크 생성 시 주소만 전달
- `react-app/src/data/sejongLocalFoods.ts`: 특산물 링크 생성 시 주소만 전달
- `react-app/scripts/foodExperience.test.ts`: 예시 주소 및 세 트럭 전체 장소의 주소 전용 검색 검증 추가
- `react-app/src/runtimeBuild.ts`, `src/app/page.home/view.pug`: 운영 캐시 식별자를 `20260806-food-map-address-only-v118`로 갱신
- `src/assets/jochwon-app/`: 최신 React 프로덕션 번들 동기화
- `devlog.md`, `devlog/2026-08-06/021-food-map-address-only.md`: 작업 이력 기록

## 검증 결과

- `npx tsx --test scripts/foodExperience.test.ts`: 먹거리 관련 테스트 6개 통과
- `npm run build`: 클라이언트·서버 TypeScript, Vite 빌드, 성능 예산 검사 통과
- `react-app/dist/`와 `src/assets/jochwon-app/` 파일 목록 및 `index.html` 일치 확인
- 운영 번들과 홈 iframe에 캐시 식별자 `20260806-food-map-address-only-v118` 반영 확인
- WIZ 일반 빌드(`clean=false`) 통과
- `git diff --check` 통과

## 남은 리스크

- 카카오맵 검색 결과는 카카오의 주소 인식 상태에 따라 달라질 수 있으며, 데이터에 등록된 주소 자체가 부정확하거나 범위 주소인 경우 정확한 단일 장소가 표시되지 않을 수 있다.
