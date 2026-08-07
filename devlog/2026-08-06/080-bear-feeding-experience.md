# 곰 체험소 먹이 찾기·동적 곰 모션·마이홈 동상 연결

- **ID**: 080
- **날짜**: 2026-08-06
- **유형**: 3D 체험·진행도·보상
- **리뷰 ID**: fcxythrwehrrelwteeqgegazjvkxooaz

## 작업 요약

베어트리파크에 있던 곰 먹이 미션을 곰 체험소로 이동했다. 곰 체험소의 기존 곰 두 마리를 제거하고 첨부된 `bear.glb` 한 마리로 교체했으며, 길가의 사과·당근·도토리 5개를 주워 움직이는 곰에게 전달하도록 변경했다. 곰은 평소 순찰하고, 먹이를 모두 찾은 뒤 급여 전에는 `praying`, 급여 후에는 `breakdance` 또는 `Jump` 모션을 실행한다. 완료 시 같은 곰 모델을 청동 재질로 변환한 마이홈 동상을 잠금 해제한다.

## 원문 요청사항

```text
현재 베어트리 파크에서 곰 먹이주는걸 체험하고 있는데 곰 먹이 주는 체험을 곰 체험소에서 하는걸로 바꾸고 곰 GLB 파일을 이용해서 곰이 곰 체험소에서 움직이는걸로 해주고 길가에 먹이 떨어뜨려놓고 그거 주워서 곰에서 먹이 주는걸로 바꿔줘 그거 다하면 마이 홈에 곰 동상 세워지는걸로 해주고 먹이 다찾고 곰한테 안주면 곰이 빌면서 먹이주라고 하고 먹으면 브레이크 댄스나 점프를 하거나 모션 둘중에 하나 하는걸로 바꿔줘 현재 있는 곰 체험소에 있는 곰 두마리는 없애주고 지금 올린 곰GLB로 새로 만들어줘
```

## 변경 파일 목록

- `react-app/src/assets/characters/bear.glb`
  - 첨부된 곰 GLB를 원본 SHA-256 그대로 반영했다.
- `react-app/src/game/renderers/VillageMapRenderer.ts`
  - 베어트리파크의 곰·먹이 요소를 제거하고 곰 체험소에 새 곰 한 마리, 순찰 경로, 길가 먹이 5개와 급여 근접 판정을 배치했다.
  - 먹이 완료 전 기도 모션과 급여 후 랜덤 브레이크댄스·점프 모션을 연결했다.
- `react-app/shared/personal-farm.ts`, `react-app/server/src/services/personalFarmProgressService.ts`, `react-app/src/services/guestPersonalFarmProgress.ts`, `src/app/page.home/api.py`
  - 먹이 위치별 종류 매핑과 줍기 즉시 저장을 Express·MySQL·WIZ·게스트 진행도에 동일하게 적용했다.
- `react-app/src/components/PersonalFarmProgressExperience.tsx`
  - 곰 체험소 전용 먹이 줍기, 진행도, 곰 급여 UI로 변경했다.
- `react-app/src/services/bearStatueAssetFactory.ts`
  - 첨부 곰 모델을 청동 동상으로 변환해 완료 보상으로 렌더링하도록 변경했다.
- `react-app/src/game/GameCanvas.tsx`, `react-app/src/pages/LandingPage.tsx`, `react-app/src/components/BearTreeParkTutorial.tsx`, `react-app/src/services/personalFarmApi.ts`
  - 로딩·공간 안내·오류 문구를 새 먹이 찾기 체험에 맞게 수정했다.
- `react-app/scripts/bearFeedingExperience.test.ts` 및 관련 곰·마이홈 테스트
  - GLB 해시·애니메이션, 단일 곰, 미션 위치, 저장, 동상 보상을 회귀 테스트로 고정했다.
- `react-app/src/runtimeBuild.ts`, `src/app/page.home/view.pug`, `src/assets/jochwon-app/`
  - 운영 캐시 ID를 `20260806-bear-feeding-experience-v176`으로 갱신하고 프로덕션 번들을 동기화했다.

## 확인 결과

- 첨부·원본·프로덕션·운영 곰 GLB SHA-256 `996fdc922bc9a0f0e4dbf116101d7e376639b00953cda5f3cf1b0d9624163252` 일치
- 곰 체험소·베어트리파크·마이홈·런타임 관련 회귀 테스트 43건 통과
- MySQL 실제 연결 기반 개인 팜 진행도 테스트 11건 통과
- `npm run build` 성공: 클라이언트 TypeScript, Vite 번들, 성능 예산, 서버 TypeScript 통과
- WIZ Python API 문법 검사 및 WIZ 일반 빌드 성공
- `react-app/dist/`와 `src/assets/jochwon-app/` 내용 일치 확인
- 운영 `/home`, 정적 인덱스, 엔트리·게임 청크·곰 GLB 모두 HTTP 200 확인

## 남은 리스크

- 실제 브라우저에서 먹이 5개를 순서대로 줍고 움직이는 곰에게 급여하는 전체 3D 동선을 수동 조작 검증하지는 못했다.
- 곰 순찰 및 먹이 좌표는 현재 지형 기준으로 설정했으며, 실제 이동 시 나무·바위 가림이 있으면 좌표 미세 조정이 필요할 수 있다.
