# 월드별 카메라 비율·재방문 안정화 및 프로젝트실 포탈 수정

- 날짜: 2026-08-06
- ID: 072
- 리뷰 ID: `mecvnhcnxwvdbqtvascztasvufgoawkz`

## 사용자 원문

> 수목원(캐릭터랑 맵 거리),공동 캠퍼스 글자 줄이기,베어트리파크(볼록렌즈처럼보임)
> 다른곳 갔다가 오면 카메라가 달라짐 수정
> 프로젝트실 공동캠퍼스 가는포탈 수정

## 변경 내용

- 수목원 카메라 거리·줌과 캐릭터 높이를 전용 프로필로 분리해 맵과 캐릭터 비율을 조정했다.
- 공동캠퍼스 인월드 이름표 크기를 80%로 축소했다.
- 베어트리파크 카메라 거리를 늘리고 FOV를 38도로 낮춰 볼록렌즈처럼 보이던 원근 왜곡을 완화했다.
- 맵 재방문 시 서버 공용 프로필의 비동기 반영이 세션 편집값을 덮어쓰지 않도록 세션 카메라 초안을 우선 적용했다.
- 프로젝트실 공동캠퍼스 귀환 포탈에 3초 충전 이동과 안정적인 활성 반경을 적용하고 안내 문구를 명확히 했다.
- 캐시 갱신용 런타임 식별자를 `20260806-stable-map-cameras-v169`로 올리고 새 정적 번들을 배포했다.

## 변경 파일

- `react-app/src/game/worldNavigationProfile.ts`
- `react-app/src/game/renderers/VillageMapRenderer.ts`
- `react-app/src/game/GameCanvas.tsx`
- `react-app/scripts/worldNavigationConsistency.test.ts`
- `react-app/scripts/campusVisualQuality.test.ts`
- `react-app/scripts/worldCameraEditor.test.ts`
- `react-app/scripts/campusPortals.test.ts`
- `react-app/src/runtimeBuild.ts`
- `src/app/page.home/view.pug`
- `src/assets/jochwon-app/`
- `devlog.md`
- `devlog/2026-08-06/072-stabilize-map-cameras-project-portal.md`

## 확인 결과

- 카메라·공동캠퍼스 시각 품질·포탈 관련 회귀 테스트 30건이 모두 통과했다.
- `npm run build`의 TypeScript, Vite, 성능 예산, 서버 TypeScript 검사가 모두 통과했다.
- React `dist`와 WIZ 정적 자산 디렉터리가 완전히 일치함을 확인했다.
- WIZ 일반 빌드(`clean=false`)가 오류 없이 완료됐다.
- 운영 URL에서 신규 런타임 식별자와 엔트리 번들의 HTTP 200 응답을 확인했다.

## 남은 리스크

- 리뷰 캡처가 제한되어 실제 브라우저에서 각 월드를 왕복하는 시각 검증은 수행하지 못했다.
- 카메라 수치는 증상 설명과 기존 월드 설정을 기준으로 조정했으므로 사용자 선호에 따라 소폭 미세 조정이 필요할 수 있다.
