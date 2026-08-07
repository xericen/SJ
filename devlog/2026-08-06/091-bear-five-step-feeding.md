# 곰 체험소 5회 순차 급여·두 마리 고정 곰·마이홈 동상 보상 복구

## 사용자 원문

> 곰체험소에서 먹이 하나 주울때마다 곰한테 한번씩 먹이주는걸로 바꿔주고 그렇게 총 5번 먹이주는걸로 해주고 지금 곰이 뒤로 걷고 있는데 그냥 가운데에 가만히 서있다가  내가 만약에 먹이 주우면 먹이 주라고 비는 모션 하고 먹이 받으면 점프나 스핀이나 힙합 등등 비는 모션을 제외하고 랜덤으로 돌려서 나오게 해줘 ,그리고 곰은 두마리로 설정해주고 이거 먹이 다주면 원래 마이홈에 곰 동상 세워지게 내가 깃에 넣어놨는데 지금 안되는거 같아서 그 부분 다시 한번 봐줘야될거같아

## 변경 내용

- 먹이 획득 진행도와 급여 완료 진행도를 분리해 `1개 줍기 → 1회 급여`를 총 5회 반복하도록 React, Express/MySQL, WIZ API, 게스트 진행도를 통일했다.
- 곰 두 마리를 체험소 중앙에 고정하고, 먹이를 들면 두 곰 모두 `praying`, 급여 후에는 `praying`을 제외한 GLB 애니메이션을 각자 무작위로 재생하도록 변경했다.
- 다섯 번째 급여 완료 시 `bear-statue` 보상이 해제되도록 완료 판정을 급여 기록 기준으로 고쳤고, 마이홈 곰 동상에 받침대를 추가해 노출을 명확히 했다.
- 런타임 빌드를 `20260806-bear-five-feeds-v186`으로 올리고 React 산출물을 WIZ 정적 자산에 동기화했다.

## 변경 파일

- `react-app/shared/personal-farm.ts`
- `react-app/server/src/models/PersonalFarmProgress.ts`
- `react-app/server/src/services/personalFarmProgressService.ts`
- `react-app/server/src/services/personalFarmProgressService.test.ts`
- `react-app/src/services/guestPersonalFarmProgress.ts`
- `react-app/src/services/personalFarmApi.ts`
- `react-app/src/components/PersonalFarmProgressExperience.tsx`
- `react-app/src/game/renderers/VillageMapRenderer.ts`
- `react-app/src/services/bearStatueAssetFactory.ts`
- `react-app/scripts/bearFeedingExperience.test.ts`
- `react-app/scripts/personalFarmInteractions.test.ts`
- `react-app/scripts/bearTreePortals.test.ts`
- `react-app/scripts/bearPhotoZone.test.ts`
- `src/app/page.home/api.py`
- `react-app/src/runtimeBuild.ts`
- `src/app/page.home/view.pug`
- `src/assets/jochwon-app/**`

## 확인 결과

- `npm run build`: 성공(TypeScript, Vite, 성능 예산, 서버 TypeScript).
- 곰 체험/포탈/포토존/마이홈 회귀 테스트 34개: 모두 성공.
- `personalFarmProgressService.test.ts` MySQL 통합 테스트 12개: 모두 성공.
- `python -m py_compile src/app/page.home/api.py`, `git diff --check`: 성공.
- `react-app/dist`와 `src/assets/jochwon-app` 비교: 차이 없음.
- WIZ 프로젝트 일반 빌드(`clean: false`): 성공.
- 운영 정적 엔트리·게임 청크·곰 GLB: HTTP 200, 런타임 기능 문자열 확인, 곰 GLB SHA-256 원본 일치.

## 남은 리스크

- 두 곰의 실제 위치·크기, 동상 배치는 브라우저 3D 화면에서 최종 시각 확인이 필요하다.
