# 먹거리 부스 포탈 고정·카메라 하단 제한 및 내부 원본 웹 뷰 적용

- **ID**: 054
- **날짜**: 2026-08-05
- **유형**: 버그 수정 · UX 개선
- **리뷰 ID**: `rssgxmerxcutfpnybrhaspoqnbhihwxh`

## 작업 요약

사용자가 마지막으로 저장한 먹거리 부스의 세종호수공원 귀환 포탈 좌표 `(1193, 546)`을 공용 기본값과 안내 진입 좌표로 고정하고, 먹거리 부스의 포탈 편집 UI와 서버 저장을 차단했다. 캐릭터가 포탈 아래쪽으로 이동하더라도 카메라 중심이 귀환 포탈보다 더 내려가지 않도록 하단 추적 한계를 추가했다. 세 트럭의 카카오맵과 원본 페이지는 외부 탭으로 이동하지 않고 먹거리 부스 HTML 패널 안에서 표시하며, 원본 사이트의 프레임 차단에 대응해 허용 출처만 서버에서 정제하고 샌드박스 문서로 렌더링한다. WIZ 런타임이 신규 API 동작을 아직 반영하지 않은 경우에는 최신 원본 읽기 문서를 같은 패널에 표시하는 폴백을 적용했다.

## 원문 요청사항

```text
먹거리 부스에 내가 포탈위치 옮겼는데, 이 위치로 픽스해줘(다른 사용자도 이 위치로 보일 수 있게해야됨), 그리고 포탈 위치 바꾸는 거 사라지게 해줘. 그리고 캐릭터가 아래로 내려갈 때 카메라도 아래로 내려가잖아, 그 아래로 내려가는 위치를 세종 호수 공원으로 돌아가기 포탈 다 보이는 곳 까지만 내려가게해줘, 그 이상 내려가지 않게,, 그리고 카카오 현재 웹에서 보기 버튼은 진짜 현재 웹에서 보이는 게 아니라 그 맵 안에 있는 HTML을 통해서 웹을 볼 수 있게 해줘야지 원본페이지 보기도 마찬가지로-> 나머지 트럭도 마찬가지로
```

## 변경 파일 목록

- `react-app/shared/world-portals.ts`, `react-app/src/game/worldGuideEntryPoints.ts`: 먹거리 부스 귀환 포탈 공용 좌표를 `(1193, 546)`으로 고정
- `src/app/page.home/api.py`: 먹거리 부스 공용 포탈 좌표를 정본으로 고정하고 해당 맵 저장 차단, 허용된 먹거리 출처의 HTML 정제 프록시 추가
- `react-app/src/pages/GamePage.tsx`: 먹거리 부스 포탈 위치 편집 버튼 제거
- `react-app/src/game/renderers/VillageMapRenderer.ts`: 먹거리 부스 카메라의 하단 추적 한계를 귀환 포탈 Z 좌표로 적용
- `react-app/src/components/FoodTruckExperience.tsx`, `react-app/src/components/FoodTruckEmbedded.css`: 세 트럭 공통 카카오맵·원본 페이지 내부 웹 뷰와 로딩·오류 상태 적용
- `react-app/src/services/foodSourcePreview.ts`: 자체 WIZ 프록시 우선 호출과 허용 출처 최신 읽기 문서 폴백 구현
- `react-app/scripts/foodExperience.test.ts`: 포탈 고정, 편집 제거, 카메라 제한, 샌드박스 웹 뷰와 폴백 회귀 검증
- `react-app/index.html`, `src/app/page.home/view.pug`: 운영 캐시 식별자를 `20260805-food-portal-inline-web-v68`로 갱신
- `src/assets/jochwon-app/`: 최신 React 프로덕션 빌드 산출물 동기화
- `devlog.md`, `devlog/2026-08-05/054-freeze-food-portal-and-inline-source-web.md`: 작업 이력 기록

## 검증 결과

- 운영 공용 포탈 API에서 `food-experience → town` 좌표가 `(1193, 546)`으로 반환되는 것 확인
- `npx tsx --test scripts/foodExperience.test.ts scripts/lakePortals.test.ts scripts/cameraFollow.test.ts` 성공: 18개 테스트 통과
- `python -m py_compile src/app/page.home/api.py` 및 `git diff --check` 통과
- `npm run build` 성공: 클라이언트 TypeScript, Vite 프로덕션 빌드, 성능 예산 검사, 서버 TypeScript 통과
- WIZ 클린 빌드와 후속 일반 빌드 성공
- `react-app/dist/`와 `src/assets/jochwon-app/` 파일·내용 일치 확인
- 운영 v68 GamePage 번들에서 `(1193, 546)`, `foodSourceUrl`, 내부 원본 읽기 폴백 포함 확인
- 다이닝코드, 세종시 마을기록문화관, 세종로컬푸드 원본 읽기 요청이 각각 HTTP 200으로 응답하는 것 확인

## 남은 리스크

- 실제 브라우저에서 세 트럭의 E 상호작용부터 지도·원본 웹 스크롤까지 수행하는 자동 E2E는 현재 환경에서 실행하지 못했다.
- 원본 사이트나 외부 읽기 서비스의 응답 정책이 바뀌면 내부 원본 웹 뷰가 일시적으로 실패할 수 있으며, 스크립트와 링크 이동은 보안을 위해 제한된다.
