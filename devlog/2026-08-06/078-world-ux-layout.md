# 078. 축제·마이홈·알림·기억나무 UX 정리

## 사용자 원문

> 충녕이 NPC 축제부스 옆 포탈에 서있는걸로 하자 지금 통과해서 돌아다니니까 더 이상해 보여 , 마이홈에 마이홈 정원 현황 좀 줄여줘 지금 돌아가기랑 붙어 있다 그리고 항상 뭐 알람 뜰때 왼쪽위에 뜨는데 이거 겹치지 않게 수정해줘 지금 겹쳐 있어서 사람이 확인하기가 힘들다, 꽃도 꽃끼리 붙어 있는데 이거 배치 신경 써서 다시해주고 곰먹이 좀더 잘보이는 곳에 놔줘 이렇게 놔주면 확인하기가 힘들다. 꽃 배치는 왼쪽 3 오른쪽2로 배치해주고 양 사이드에 있는 초록 수풀 말고 집앞에 있는 왼쪽 오른쪽 각각 수풀 2개씩 제거 해줘 꽃 배치하는공간인데 수풀이랑 겹친다. 기억 나무에 있는 내용은 깃 주소에서 따와서 고대로 만들어줘 씨앗 이용하고 그런거 제외해버려 식물 도감도 제외해버리고

## 반영 내용

- 축제 체험 포탈 옆에 고정 충녕이 NPC를 추가하고 충돌 반경을 적용해 캐릭터가 통과하지 못하게 했다.
- 마이홈 정원 현황 카드를 축소하고 우측 상단 돌아가기/맵 이동 버튼과 간격을 확보했다.
- 일반 알림, 1:1 채팅 요청, 친구 요청을 단일 알림 스택으로 묶어 왼쪽 위에서 서로 겹치지 않게 했다.
- upstream Git의 마이홈 화단 기준 좌표를 반영해 꽃 5칸을 왼쪽 3개·오른쪽 2개로 재배치하고 집 앞 좌우 수풀을 2개씩 숨겼다.
- 베어트리파크 먹이 단서와 다섯 급여 지점을 보행 구역으로 옮기고 큰 링과 라벨을 추가했다.
- upstream Git의 기억나무 내 기억/모두의 기억 흐름을 유지하되 씨앗 안내와 식물도감 진입·목록 UI를 제거했다.
- 런타임 빌드를 `20260806-world-ux-layout-v174`로 갱신하고 WIZ 정적 자산과 홈 iframe에 반영했다.

## 변경 파일

- `react-app/src/data/festivalNpc.ts`
- `react-app/src/game/renderers/VillageMapRenderer.ts`
- `react-app/src/pages/GamePage.tsx`
- `react-app/src/pages/GamePage.css`
- `react-app/src/components/PersonalFarmProgressExperience.tsx`
- `react-app/src/components/PersonalFarmProgressExperience.css`
- `react-app/src/components/GreenhouseExperience.tsx`
- `react-app/scripts/worldUxLayout.test.ts`
- `react-app/scripts/personalFarmInteractions.test.ts`
- `react-app/scripts/bearTreePortals.test.ts`
- `react-app/package.json`
- `react-app/src/runtimeBuild.ts`
- `src/app/page.home/view.pug`
- `src/assets/jochwon-app/**`

## 확인 결과

- `npx tsc -b --pretty false`: 통과
- `npm run test:world-ux-layout`: 4/4 통과
- `npm run test:personal-farm-interactions`: 11/11 통과
- `npm run test:festival-experience`: 5/5 통과
- `npm run test:bear-tree-portals`: 11/11 통과
- `npm run test:greenhouse`: 통과
- `npm run test:runtime-entry`: 6/6 통과
- `npm run test:runtime-warnings`: 2/2 통과
- `npm run build`: 통과(성능 예산 검사 및 서버 TypeScript 포함)
- WIZ 프로젝트 빌드: 통과
- 운영 `/home` 및 정적 index에서 `20260806-world-ux-layout-v174` 응답 확인

## 남은 리스크

- 브라우저 캡처가 제공되지 않아 실제 운영 화면에서 NPC/꽃/먹이 표식의 최종 시각 간격은 자동화 검증과 좌표 검증을 기준으로 확인했다.
