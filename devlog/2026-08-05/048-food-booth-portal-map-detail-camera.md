# 먹거리 부스 포탈 편집·카카오 지도·상세 UX 및 로컬 트럭 카메라 수정

- **ID**: 048
- **날짜**: 2026-08-05
- **유형**: 버그 수정 · UX 수정
- **리뷰 ID**: rssgxmerxcutfpnybrhaspoqnbhihwxh

## 작업 요약

먹거리 부스의 포탈 이동 버튼을 권한이 있는 사용자의 공용 WIZ 포탈 저장 흐름에 연결했다. 맛집·카페·특산물의 지도 URL을 카카오맵 검색 링크로 통일하고, 지도와 출처를 기존 카페 상세와 같은 크기의 현재 화면 패널에서 확인하도록 정리했다. 특산물 이미지는 Vite 배포 기본 경로로 보정했으며, 로컬푸드 트럭 포커스 카메라는 사용자가 실제로 상호작용한 서비스 창 면을 기준으로 방향을 선택하도록 수정했다.

## 원문 요청사항

```text
먹거리부스 맵에서 현재 위치로 포탈 이동 클릭하면 내가 포탈 위치 변경할 수 있게 해줘.

세종 카페 & 디저트 크럭 e 눌러서 보면 각 카페나 장소들이 있잖아, 들어가서 지도보기 누르면 카카오 지도랑 연동해서 그 카페 위치가 어딘지 알 수 있게 해주라

출처확인버튼 혹은 지도보기 버튼을 누르면 화면이 좀 더 확대되는데 카페 눌렀을 때 화면이랑 동일하게 해줘, 그리고 출처확인 에서 원본 페이지 누르면 다이닝코드 원본페이지로 새창이 열려서 넘어가지게 되어있ㄴ는데 그렇게하지말고 현재 화면 동일한 화면에서 볼 수 있게 해주면 좋을 거 같아.

세종 특산물 상점에서는 이미지가 잘 못 불러오는데 이 부분 수정해줘 -> 이것도 동일하게 수정(원본페이지나 이런것들)

로컬푸드 트럭은 수정 좀 해야할 거 같아. 나머지 두 트럭을 e 누르면 잘 나오는데 로컬푸드트럭은 카메라 각도가 반대로 되어있는 느낌이야 제대로 잘 인식하고 있는지 확인하고 수정해줘. 이것도 동일하게 그리고 출처확인 에서 원본 페이지 누르면 다이닝코드 원본페이지로 새창이 열려서 넘어가지게 되어있ㄴ는데 그렇게하지말고 현재 화면 동일한 화면에서 볼 수 있게 해주면 좋을 거 같아.
```

## 변경 파일 목록

- `react-app/src/pages/GamePage.tsx`: 먹거리 부스 버튼을 `food-experience → town` 공용 포탈 저장 이벤트와 권한 상태에 연결
- `react-app/src/game/renderers/VillageMapRenderer.ts`: 로컬푸드 트럭 카메라 면을 사용자 상호작용 위치 기준으로 판정
- `react-app/src/components/FoodTruckExperience.tsx`: 카카오맵 iframe, 현재 탭 원본 이동, 동일 상세 패널 흐름, 특산물 지도 버튼 및 배포 이미지 경로 적용
- `react-app/src/components/FoodTruckEmbedded.css`: 지도·출처 패널을 카페 상세와 같은 900px/90vh 기준으로 통일하고 카카오맵 iframe 레이아웃 추가
- `react-app/src/data/sejongFoodTypes.ts`: 카카오맵 검색 URL 및 Vite 배포 이미지 URL 헬퍼 추가
- `react-app/src/data/sejongDiningCodePlaces.ts`, `react-app/src/data/sejongLocalFoods.ts`: 네이버 검색 URL을 카카오맵 검색 URL로 변경
- `react-app/scripts/foodExperience.test.ts`: 포탈 이벤트, 카카오맵, 이미지 경로, 패널 크기, 카메라 방향 회귀 테스트 추가
- `react-app/index.html`, `src/app/page.home/view.pug`: 운영 캐시 식별자를 v62로 갱신
- `src/assets/jochwon-app/`: 최신 React 프로덕션 빌드 산출물 동기화
- `devlog.md`, `devlog/2026-08-05/048-food-booth-portal-map-detail-camera.md`: 작업 이력 기록

## 검증 결과

- `npx tsx --test scripts/foodExperience.test.ts scripts/lakePortals.test.ts scripts/cameraFollow.test.ts` 성공: 신규 먹거리 회귀와 기존 포탈·카메라 회귀 테스트 16개 통과
- `npm run build` 성공: 클라이언트 TypeScript, Vite 프로덕션 빌드, 성능 예산 검사, 서버 TypeScript 통과
- WIZ 프로젝트 일반 빌드(`clean: false`) 성공
- `react-app/dist/`와 `src/assets/jochwon-app/` 파일·내용 일치 확인
- 운영 엔트리에서 v62 캐시 식별자와 신규 해시 번들 연결 확인
- 특산물 이미지 운영 URL HTTP 200 및 `image/png` 응답 확인
- `git diff --check` 통과

## 남은 리스크

- 실제 브라우저에서 세 트럭의 E 상호작용과 외부 카카오맵 iframe을 끝까지 조작하는 자동 E2E는 현재 환경에서 수행하지 못했다. 카카오맵 또는 다이닝코드가 추후 외부 임베드·프레임 정책을 바꾸면 현재 화면 내 지도 표시나 현재 탭 원본 이동 동작이 영향을 받을 수 있다.
