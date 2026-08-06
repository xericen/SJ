# 공동캠퍼스 화면 확대 및 캐릭터·건물 비율 재조정

- **ID**: 029
- **날짜**: 2026-08-06
- **유형**: UX·3D 카메라
- **리뷰 ID**: ubhnpywyyudignpzxnhbzznfezhtzgax

## 작업 요약

공동캠퍼스의 기존 포탈·충돌 좌표를 보존하기 위해 맵 모델 자체 크기는 변경하지 않고, 카메라 거리를 1450에서 1350으로 줄여 맵이 화면에서 약 7% 더 크게 보이도록 했다. 캐릭터 높이는 120에서 94로 약 22% 축소해 건물과 캐릭터의 시각적 크기 차이를 강화했다.

## 원문 요청사항

```text
공동 캠퍼스 맵을 조금 더 확대해주고, 캐릭터를 줄이는 느낌으로 가면 좋을 거 같아 현재 캐릭터랑 건물의 크기가 비슷해서 안 좋은 거 같아
```

## 변경 파일 목록

- `react-app/src/game/worldNavigationProfile.ts`
  - 공동캠퍼스 카메라 거리를 1350, 캐릭터 높이를 94로 조정했다.
- `react-app/scripts/campusVisualQuality.test.ts`, `react-app/scripts/worldNavigationConsistency.test.ts`
  - 공동캠퍼스 화면 확대와 캐릭터 축소 기준을 회귀 테스트로 고정했다.
- `react-app/src/runtimeBuild.ts`, `src/app/page.home/view.pug`
  - 런타임 빌드 ID를 `20260806-campus-scale-balance-v126`으로 갱신했다.
- `src/assets/jochwon-app/`
  - 최신 React 프로덕션 산출물로 동기화했다.
- `devlog.md`, `devlog/2026-08-06/029-campus-scale-balance.md`
  - 이번 변경과 검증 결과를 기록했다.

## 확인 결과

- 공동캠퍼스 비율·화질·포탈 고정 관련 회귀 테스트 8건 통과
- 런타임 엔트리 테스트 6건 통과
- `npm run build` 성공: 클라이언트 TypeScript, Vite 번들, 성능 예산, 서버 TypeScript 통과
- 성능 예산 통과: 초기 엔트리 246 KiB, 최대 JS gzip 324 KiB, 최대 3D 자산 21.64 MiB
- React `dist`와 WIZ `src/assets/jochwon-app` 143개 파일 일치 확인
- WIZ 일반 빌드(`clean: false`) 성공
- 운영 `/home`, 정적 인덱스, 엔트리 자산 HTTP 200 및 빌드 ID `v126` 반영 확인
- `git diff --check` 통과

## 남은 리스크

- 스크린샷이 제공되지 않아 실제 운영 화면에서 건물별 체감 비율을 비교하는 수동 시각 검증은 수행하지 않았다.
- 맵 모델 자체 배율은 포탈·충돌 좌표 보존을 위해 유지했으며, 요청한 확대 효과는 카메라 거리로 구현했다.
