# 마이홈 충돌·출입·좌석 상호작용 개선

- **ID**: 075
- **날짜**: 2026-08-05
- **유형**: 버그 수정 · UX 개선
- **리뷰 ID**: eomekrwtkcejfkvaamszzecababygiyc

## 작업 요약

마이홈의 집 외벽·문·가구·정원 식물처럼 중첩된 모델 오브젝트도 충돌 영역에 포함해 캐릭터가 사물을 통과하지 못하도록 수정했다. 출입문 근처에서 E 안내 버튼으로만 집 안팎을 오갈 수 있게 하고, 실내 식탁 의자 4개와 소파 좌석 3개를 각각 독립적인 E 착석 대상으로 연결했다.

## 원문 요청사항

```text
마이홈에서 캐릭터가 사물을 통과하는 것이 있는데, 집이근 식물이든 등 오브젝트랑 부딪치지 않게 수정해줘, 그리고 집 들어가는 거 집 통과되는데 그 부분 고쳐주고, 집 들어갈 떄 E버튼 눌러야지 내부 들어갈 수 있게 해주면 좋을 거 같아. 문에 가까워지면 e버튼으로 집 들어가기 버튼 나오면 좋을듯. 집 내부에 드어가서 집내다 e버튼으로 누을 수 있게 해주고, 의자 4개에 쇼파 3가지로 나눠서 만들어져있는데 각 각 e버튼 눌러서 앉을 수 있게 해줘
```

## 변경 파일 목록

- `react-app/src/game/renderers/VillageMapRenderer.ts`
  - 집 구조물·가구·식물·분수·우편함 충돌 대상을 확장하고 중첩 메시도 충돌 영역에 등록했다.
  - 출입문 E 토글 이벤트와 실내 좌석 탐색·착석·일어나기 로직을 연결했다.
  - 식탁 의자 4개와 소파 쿠션 3개를 각각 별도 좌석으로 인식하고 착석 자세·복귀 위치를 적용했다.
- `react-app/src/pages/GamePage.tsx`, `react-app/src/pages/GamePage.css`
  - 문 근처의 `E 버튼으로 집 들어가기/나가기` 안내와 각 좌석의 `E 버튼으로 앉기/일어나기` 버튼을 추가했다.
- `react-app/scripts/personalFarmInteractions.test.ts`, `react-app/package.json`
  - GLB의 출입문·좌석 노드 수, 충돌 등록, E 전용 출입·착석 연결을 검증하는 회귀 테스트와 실행 명령을 추가했다.
- `react-app/src/runtimeBuild.ts`, `src/app/page.home/view.pug`
  - 런타임 빌드 ID를 `20260805-my-home-collision-seats-v88`로 갱신했다.
- `src/assets/jochwon-app/`
  - 최신 React 프로덕션 산출물로 교체했다.

## 확인 결과

- 마이홈 충돌·출입·좌석 회귀 테스트 성공: 3개 통과
- 기존 마이홈·베어트리파크 회귀 테스트 성공: 9개 통과
- 런타임 엔트리 테스트 성공: 2개 통과
- TypeScript 증분 검사 성공
- `npm run build` 성공: 클라이언트 TypeScript, Vite 번들, 성능 예산, 서버 TypeScript 통과
- 성능 예산 통과: 초기 엔트리 286 KiB, 최대 JS gzip 319 KiB, 최대 3D 자산 21.64 MiB
- React `dist`와 WIZ `src/assets/jochwon-app` 전체 파일 일치 확인
- WIZ 일반 빌드(`clean: false`) 성공
- `git diff --check` 통과

## 남은 리스크

- 실제 브라우저에서 집 외곽 전체와 각 가구·식물 둘레를 걸으며 확인하는 수동 충돌 검증은 수행하지 않았다.
- 좌석별 캐릭터 높이와 모델별 착석 자세는 자동 빌드 기준으로 검증했으며, 모델 체형에 따라 미세한 높이 조정이 추가로 필요할 수 있다.
