# 마이홈 실내 카메라 거리 40% 확대 적용 경로 고정

- **ID**: 011
- **날짜**: 2026-08-06
- **유형**: UX 개선
- **리뷰 ID**: uieobisoicxojmbqqtpwasqphrczmjte

## 원문 요청사항

```text
마미홈 내부도 2/5정도 멀어지게 해줘
```

## 작업 요약

마이홈 실내 카메라가 기존 거리 800보다 2/5(40%) 멀어진 1120을 항상 사용하도록 실내·야외 거리 선택 로직을 공통 함수로 만들고 실제 카메라 추적 경로에 직접 연결했다. 마이홈 야외 거리는 기존 1820을 유지했다. 새 런타임 빌드 ID를 적용하고 React 프로덕션 산출물을 WIZ 정적 자산에 동기화했다.

## 변경 파일 목록

- `react-app/src/game/worldNavigationProfile.ts`: 마이홈 실내·야외 카메라 거리 선택 함수 추가
- `react-app/src/game/renderers/VillageMapRenderer.ts`: 모든 마이홈 카메라 추적 상태에서 전용 거리 선택 함수 사용
- `react-app/scripts/worldNavigationConsistency.test.ts`: 실내 1120·야외 1820 거리 회귀 검사 추가
- `react-app/src/runtimeBuild.ts`: 런타임 빌드 ID를 `20260806-my-home-interior-camera-v107`로 갱신
- `src/app/page.home/view.pug`: iframe 빌드 쿼리 갱신
- `src/assets/jochwon-app/`: 최신 React 프로덕션 빌드 동기화
- `devlog.md`
- `devlog/2026-08-06/011-fix-my-home-interior-camera-distance.md`

## 검증 결과

- `npm run test:world-navigation`: 4개 테스트 성공, 마이홈 실내 거리 1120 확인
- `npm run test:camera-follow`: 3개 테스트 성공
- `npm run build`: 성공
- TypeScript 클라이언트·서버 컴파일 및 성능 예산 검사: 성공
- `npm run test:runtime-entry`: 2개 테스트 성공
- WIZ 프로젝트 일반 빌드(`clean: false`): 성공
- 운영 `/home`: HTTP 200
- 운영 런타임 `20260806-my-home-interior-camera-v107` 및 배포 번들의 실내 1120·야외 1820 선택 로직 확인
- `git diff --check`: 성공

## 남은 리스크

- 넓어진 실내 구도에서는 방 가장자리에서 벽 바깥이나 빈 공간이 이전보다 더 보일 수 있어 실제 화면에서 한 차례 시각 확인이 필요하다.
