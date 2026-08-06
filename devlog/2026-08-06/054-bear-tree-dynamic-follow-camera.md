# 베어트리파크 공동캠퍼스형 추적 카메라 적용

- **ID**: 054
- **날짜**: 2026-08-06
- **유형**: UX·3D 카메라
- **리뷰 ID**: fcxythrwehrrelwteeqgegazjvkxooaz

## 작업 요약

베어트리파크의 맵 전체를 보여주던 고정형 직교 카메라를 공동캠퍼스와 동일한 원근 추적 카메라로 변경했다. 카메라 거리 1000과 캐릭터 높이 80을 적용해 맵을 확대하고 캐릭터 비율을 줄였으며, 캐릭터가 이동할 때 카메라도 따라가 주변 공간을 순차적으로 볼 수 있게 했다. 기존 고화질 렌더링과 확대된 닉네임 설정은 유지했다.

## 원문 요청사항

```text
맵이 뭐랄까 너무 정적인 느낌이라 공동캠퍼스 처럼 보일 수 있어야함 이 부분 수정해줘, 그리고 맵을 좀 더 확대하고 캐릭터를 줄이는 형식으로 바꾸줘, 맵을 캐릭터가 이동하면서 볼 수 있어야하는데 베어트리파크는 맵을 한 눈에 다 보니까 이런 거 수정해주
```

## 변경 파일 목록

- `react-app/src/game/worldNavigationProfile.ts`
  - 베어트리파크를 공통 추적형 내비게이션 대상에 포함하고 공동캠퍼스와 같은 카메라 거리 1000·캐릭터 높이 80을 적용했다.
- `react-app/src/game/renderers/VillageMapRenderer.ts`, `react-app/src/game/cameraFollow.ts`
  - 베어트리파크 전용 직교 카메라·고정 거리 설정을 제거하고 기존 화질·닉네임 배율 설정은 유지했다.
- `react-app/scripts/cameraFollow.test.ts`, `react-app/scripts/worldNavigationConsistency.test.ts`, `react-app/scripts/bearTreeVisualQuality.test.ts`
  - 추적형 원근 카메라, 캐릭터 축소, 카메라 거리, 화질·닉네임 유지 조건을 회귀 테스트로 고정했다.
- `react-app/src/runtimeBuild.ts`, `src/app/page.home/view.pug`
  - 운영 캐시 식별자를 `20260806-bear-tree-dynamic-camera-v149`로 갱신했다.
- `src/assets/jochwon-app/`
  - 최신 React 프로덕션 빌드를 동기화하고 이전 해시 JavaScript 청크를 정리했다.
- `devlog.md`, `devlog/2026-08-06/054-bear-tree-dynamic-follow-camera.md`
  - 이번 변경과 검증 결과를 기록했다.

## 확인 결과

- 카메라·월드 내비게이션·베어트리파크 화질·포탈·공동캠퍼스 화질 관련 회귀 테스트 24건 통과
- 런타임 엔트리 테스트 6건 통과
- `npm run build` 성공: 클라이언트 TypeScript, Vite 프로덕션 번들, 성능 예산, Express TypeScript 통과
- WIZ 일반 빌드(`clean: false`) 성공
- `react-app/dist/`와 `src/assets/jochwon-app/` 파일·내용 일치 확인
- 운영 `/home`, 정적 인덱스, 신규 엔트리와 게임 청크 모두 HTTP 200 확인
- 운영 엔트리와 로컬 엔트리 SHA-256 일치 확인

## 남은 리스크

- 실제 브라우저에서 베어트리파크 전 구간을 캐릭터로 이동하며 나무·건물에 의한 시야 가림을 확인하는 수동 3D 조작 검증은 수행하지 않았다.
- 기존 `bear-photo-zone` 회귀 테스트 1건은 현재 복원된 곰 미션 주민을 제거된 것으로 가정하는 오래된 기대값 때문에 실패하며, 이번 카메라 변경과는 무관하다.
