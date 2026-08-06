# 공동캠퍼스 카메라 거리 1000 적용

- **ID**: 049
- **날짜**: 2026-08-06
- **유형**: UX·3D 카메라
- **리뷰 ID**: ubhnpywyyudignpzxnhbzznfezhtzgax

## 작업 요약

공동캠퍼스 전용 카메라 거리를 요청한 정확한 값인 1000으로 변경했다. 기존 캐릭터 높이 80과 맵 모델·포탈·충돌 좌표는 그대로 유지했다.

## 원문 요청사항

```text
공동캠퍼스 카메라 거리를 더 좁혀서 1000으로 해줘
```

## 변경 파일 목록

- `react-app/src/game/worldNavigationProfile.ts`
  - 공동캠퍼스 카메라 거리를 1000으로 변경했다.
- `react-app/scripts/campusVisualQuality.test.ts`, `react-app/scripts/worldNavigationConsistency.test.ts`
  - 공동캠퍼스 카메라 거리 1000을 회귀 테스트로 고정했다.
- `react-app/src/runtimeBuild.ts`, `src/app/page.home/view.pug`
  - 런타임 빌드 ID를 `20260806-campus-camera-1000-v144`로 갱신했다.
- `src/assets/jochwon-app/`
  - 최신 React 프로덕션 산출물로 동기화했다.
- `devlog.md`, `devlog/2026-08-06/049-campus-camera-distance-1000.md`
  - 이번 변경과 검증 결과를 기록했다.

## 확인 결과

- 공동캠퍼스 카메라·화질·포탈 고정 관련 회귀 테스트 13건 통과
- 런타임 엔트리 테스트 6건 통과
- `npm run build` 성공: 클라이언트 TypeScript, Vite 번들, 성능 예산, 서버 TypeScript 통과
- 성능 예산 통과: 초기 엔트리 246 KiB, 최대 JS gzip 324 KiB, 최대 3D 자산 21.64 MiB
- React `dist`와 WIZ `src/assets/jochwon-app` 143개 파일 일치 확인
- WIZ 일반 빌드(`clean: false`) 성공
- 운영 `/home`, 정적 인덱스, 엔트리 자산 HTTP 200 및 빌드 ID `v144` 반영 확인
- `git diff --check` 통과

## 남은 리스크

- 스크린샷이 제공되지 않아 카메라 거리 1000에서의 건물 가림과 이동 중 체감 구도를 수동 검증하지는 못했다.
