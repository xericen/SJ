# 공동캠퍼스 렌더링 선명도 및 캐릭터·맵 비율 개선

- **ID**: 003
- **날짜**: 2026-08-06
- **유형**: UX·3D 렌더링
- **리뷰 ID**: ubhnpywyyudignpzxnhbzznfezhtzgax

## 작업 요약

공동캠퍼스의 기본 렌더링을 낮은 픽셀 비율과 256px 텍스처, 과도한 지오메트리 단순화 설정에서 선명도 우선 설정으로 조정했다. 공동캠퍼스에서만 캐릭터 높이를 150에서 120으로 줄이고 카메라 거리를 1300에서 1450으로 늘려 넓은 맵과 캐릭터의 시각적 비율을 보정했다. 저사양 기기에는 512px 텍스처와 0.8 픽셀 비율의 별도 폴백을 유지했다.

## 원문 요청사항

```text
공동캠퍼스 현재 화질이 너무 안 좋아 이 부분 수정해줘. 맵에 비해서 캐릭터가 큰건지 조금 다른 맵들에 비해서 너무 이상한 느낌이야
```

## 변경 파일 목록

- `react-app/src/game/renderers/VillageMapRenderer.ts`
  - 공동캠퍼스에 안티앨리어싱, 1024px 텍스처, 1배 픽셀 비율, 원본 지오메트리를 적용하고 조명·노출을 보정했다.
  - 저사양 기기용 품질 폴백을 별도로 유지했다.
- `react-app/src/game/worldNavigationProfile.ts`
  - 공동캠퍼스 전용 카메라 거리 1450과 캐릭터 높이 120을 적용했다.
- `react-app/scripts/campusVisualQuality.test.ts`, `react-app/scripts/worldNavigationConsistency.test.ts`, `react-app/package.json`
  - 공동캠퍼스 화질과 캐릭터·카메라 비율 회귀 테스트를 추가했다.
- `react-app/src/runtimeBuild.ts`, `src/app/page.home/view.pug`
  - 런타임 빌드 ID를 `20260806-campus-visual-quality-v99`로 갱신했다.
- `src/assets/jochwon-app/`
  - 최신 React 프로덕션 산출물로 동기화했다.
- `devlog.md`, `devlog/2026-08-06/003-campus-visual-quality.md`
  - 이번 변경과 검증 결과를 기록했다.

## 확인 결과

- 공동캠퍼스 화질·월드 이동·기존 포탈 고정 회귀 테스트 10건 통과
- 런타임 엔트리 테스트 2건 통과
- `npm run build` 성공: 클라이언트 TypeScript, Vite 번들, 성능 예산, 서버 TypeScript 통과
- 성능 예산 통과: 초기 엔트리 286 KiB, 최대 JS gzip 310 KiB, 최대 3D 자산 21.64 MiB
- React `dist`와 WIZ `src/assets/jochwon-app` 143개 파일 일치 확인
- WIZ 일반 빌드(`clean: false`) 성공
- 운영 `/home`, 정적 인덱스, 엔트리 자산 HTTP 200 및 빌드 ID `v99` 반영 확인
- `git diff --check` 통과

## 남은 리스크

- 공동캠퍼스 GLB는 약 21.64 MiB이므로 저사양 기기에서는 폴백 적용 전후로 초기 로딩 및 프레임 성능 차이가 있을 수 있다.
- 스크린샷이 제공되지 않아 실제 운영 브라우저에서 맵 전 구간의 시각적 비율과 선명도를 비교하는 수동 검증은 수행하지 않았다.
