# 세 체험 맵 카메라 거리 1550 및 공연 상세 즉시 표시

- **ID**: 050
- **날짜**: 2026-08-06
- **유형**: UX 개선 · 성능 개선
- **리뷰 ID**: `ucpgkvwdbljhhijvtebeixepohjidmjy`

## 작업 요약

세종예술의전당, 축제부스, 먹거리부스의 캐릭터 추적 카메라 거리를 1400에서 1550으로 확대했다. 공연 `자세히 보기`는 원본 네트워크 요청이 끝날 때까지 로딩 문구만 표시하지 않고, 로컬 공식 포스터와 일정·장소·가격·관람 정보로 구성한 상세 HTML을 즉시 표시한 뒤 원본 상세가 준비되면 교체하도록 변경했다.

## 원문 요청사항

```text
거리를 1550으로 수정하고 공연을 준비하고 있어요 시간 너무 오래걸림 -> 이 부분 수정
```

## 변경 파일 목록

- `react-app/src/game/worldNavigationProfile.ts`: 세 체험 맵 카메라 거리 1550 적용
- `react-app/src/services/foodSourcePreview.ts`: 네트워크 없이 즉시 만들 수 있는 공식 공연 요약 HTML 렌더러 추가
- `react-app/src/components/ArtsCenterPosterKiosk.tsx`: 로딩 문구 제거, 즉시 요약 화면 표시 후 원본 상세 비동기 교체
- `react-app/scripts/worldNavigationConsistency.test.ts`: 거리 기대값 1550으로 갱신
- `react-app/scripts/artsCenterPoster.test.ts`: 즉시 상세 정보와 로딩 문구 제거 회귀 검증 추가
- `react-app/src/runtimeBuild.ts`, `src/app/page.home/view.pug`: 운영 캐시 식별자를 `20260806-camera-1550-instant-arts-detail-v145`로 갱신
- `src/assets/jochwon-app/`: 최신 React 프로덕션 빌드 산출물 동기화
- `devlog.md`, `devlog/2026-08-06/050-camera-1550-instant-arts-detail.md`: 작업 이력 기록

## 검증 결과

- 대상 카메라 거리 테스트 4개 통과
- 공연 상세 및 런타임 경고 테스트 10개 통과
- `npm run build` 성공: TypeScript, Vite 프로덕션 빌드, 성능 예산 검사, 서버 TypeScript 통과
- 런타임 엔트리 테스트 6개 통과
- `react-app/dist/`와 `src/assets/jochwon-app/` 파일·내용 일치 확인
- WIZ 일반 빌드(`clean: false`) 성공
- 운영 v145 HTML, 엔트리 및 GamePage 번들 HTTP 200 확인
- 운영 GamePage 번들에 거리 1550과 즉시 공연 정보가 포함되고 기존 로딩 문구가 없는 것 확인
- `git diff --check` 통과

## 남은 리스크

- 실제 브라우저에서 세 맵의 체감 거리와 공연 상세 첫 프레임을 측정하는 자동 E2E는 현재 환경에서 실행하지 못했다.
- 기존 마이홈 실내 거리 소스값과 회귀 테스트 기대값 불일치 1건은 이번 변경과 무관해 수정하지 않았다.
