# 예술의전당 관심 저장 및 포스터 내부 상세 웹 화면 추가

- **ID**: 052
- **날짜**: 2026-08-05
- **유형**: 버그 수정 및 UX 개선
- **리뷰 ID**: ucpgkvwdbljhhijvtebeixepohjidmjy

## 작업 요약

관심 버튼의 포인터 이벤트가 3D 캔버스 쪽으로 전달되지 않도록 차단하고, 포스터별 저장/해제 로직을 별도 순수 함수로 분리했다. 저장 직후 아이콘과 문구가 `관심 저장됨`으로 바뀌어 동작 여부를 명확히 확인할 수 있다. 포스터 하단에는 `영상 선택`, `관심 있어요`, `자세히 보기` 3개 버튼을 동일한 간격으로 배치했으며 3D 포스터 캔버스와 클릭 후 HTML 포스터의 모양을 함께 갱신했다. `자세히 보기`는 현재 HTML 포스터 안에서 세종예술의전당 공식 상세 페이지 iframe을 열고, 포스터 복귀·새 창·닫기 조작을 제공한다.

## 원문 요청사항

```text
각 포스터에 관심있어요 버튼이 안 눌려 이 부분 수정해줘. 그리고 영상선택, 관심있어요 , 자세히 보기 버튼 하나 추가해서 자세히 보기 버튼 누르면 현재 html에서 웹 화면 연동해서 현재 이 html안에서 자세히 웹 볼 수 있게 해주면 좋을 거 같아.
```

## 변경 파일 목록

- `react-app/src/game/artsCenterFavorites.ts`: 관심 목록 파싱과 포스터별 저장/해제 로직 추가
- `react-app/src/components/ArtsCenterPosterKiosk.tsx`: 포인터 전파 차단, 저장 상태 피드백, 자세히 보기 버튼과 내부 공식 페이지 iframe 추가
- `react-app/src/components/ArtsCenterPosterKiosk.css`: 3버튼 비율·클릭 영역과 포스터 내부 웹 상세 화면 스타일 추가
- `react-app/src/game/renderers/VillageMapRenderer.ts`: 3D 포스터에도 영상 선택·관심 있어요·자세히 보기 3버튼을 동일하게 표시
- `react-app/scripts/artsCenterPoster.test.ts`: 관심 저장/해제, 3버튼, 내부 iframe, 하단 여백 회귀 테스트 보강
- `react-app/index.html`, `src/app/page.home/view.pug`: 운영 캐시 식별자를 v65로 통일
- `src/assets/jochwon-app/index.html`, `src/assets/jochwon-app/assets/GamePage-BpLZ9n8M.js`, `src/assets/jochwon-app/assets/GamePage-BVzthX4e.js`, `src/assets/jochwon-app/assets/GamePage-CjGCP89s.css`: 새 운영 포스터 인터랙션 번들 반영
- `devlog.md`, `devlog/2026-08-05/052-fix-arts-favorite-and-add-inline-detail.md`: 작업 이력 기록

## 검증 결과

- `npx tsx --test scripts/artsCenterPoster.test.ts scripts/artsCenterJump.test.ts scripts/cameraFollow.test.ts scripts/lakePortals.test.ts scripts/foodExperience.test.ts` 성공: 포스터 관심 저장·내부 상세를 포함한 최신 회귀 테스트 총 24개 통과
- 공식 상세 페이지 5개가 모두 HTTP 200이며 `X-Frame-Options` 및 iframe 차단 CSP 헤더가 없음을 확인
- `npm run build` 성공: 클라이언트 TypeScript, Vite 프로덕션 빌드, 성능 예산 검사, 서버 TypeScript 통과
- WIZ 프로젝트 일반 빌드(`clean: false`) 성공
- `react-app/dist/index.html`과 WIZ 정적 산출물의 엔트리 일치, v65 캐시 식별자 통일 확인
- 운영 v65 HTML 및 GamePage 청크에서 3버튼, `관심 저장됨`, 내부 상세 iframe 코드 반영 확인
- 대상 파일 `git diff --check` 통과

## 남은 리스크

- 공식 사이트가 향후 `X-Frame-Options` 또는 CSP를 추가하면 내부 iframe이 차단될 수 있다. 현재는 `새 창` 링크를 함께 제공해 우회할 수 있으며, 실제 브라우저에서 공식 페이지의 전체 탐색 동작은 화면 단위 E2E로 자동 검증하지 못했다.
