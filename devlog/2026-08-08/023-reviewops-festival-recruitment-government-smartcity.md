# 023. 축제 NPC 대화·모집·정부청사·스마트시티 수정

## 사용자 요청

축제부스 NPC 대화창과 E 상호작용 UI가 겹치지 않게 하고, 모집글 작성 결과를 내 모집 관리에 남기며, 프로필 50% 달성 전 정부청사를 잠그고 관련 포탈을 3초 체류 이동으로 변경한다. 중앙광장 귀환 포탈은 AI 여행 일정 확정 센터에서 멀리 배치하고, 스마트시티 6개 체험 완료 결과를 즉시 표시한다.

## 변경 파일

- `react-app/src/pages/GamePage.tsx`
- `react-app/src/components/SmartCityExperience.tsx`
- `react-app/src/game/renderers/VillageMapRenderer.ts`
- `react-app/src/game/scenes/WorldScene.ts`
- `src/app/page.home/api.py`
- `src/assets/jochwon-app/index.html` 및 최신 `assets/*`

## 확인

- React/Vite 빌드 및 성능 검증 통과.
- WIZ `main` 프로젝트 일반 빌드 성공.
- 운영 index가 `index-y2tvrcsr.js`를 제공하고 해당 entry가 `GamePage-BQz6omrp.js`, `GamePage-CHjfl4HU.js`, `SmartCityExperience-Cep-JTID.js`를 참조함.
- 운영 최신 번들에서 정부청사 잠금 문구, 모집글 완료 문구, 스마트시티 완료 문구 확인.
- `experience-signal-bridge.js` 운영 응답 200 확인.
