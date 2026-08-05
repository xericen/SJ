# 첫 호수공원 입장 충녕이 소개·조작 온보딩 전환

- **ID**: 059
- **날짜**: 2026-08-05
- **유형**: UX 개선
- **리뷰 ID**: jahgxwxaynzpihiucrsjgkwswczcjgnc

## 사용자 원문 요청

> 처음에 로그인하고 세종호수 공원 들어왔을 떄 충녕이가 다가와서 대화를 하잖아, 그 부분 말고 현재 사진처럼 호수 공원을 소개시켜주는 거가 나왔으면 좋겠어, 예를 들어 처음이니까 조작방법, 메타버스 약간의 소개?

## 변경 내용

- 첫 세종호수공원 입장 시 충녕이가 자동으로 다가오는 연출을 중단했습니다.
- 첨부 예시처럼 중앙 안내 카드가 열리도록 기존 미연결 튜토리얼을 실제 첫 입장 흐름에 연결했습니다.
- 1단계에서 메타버스·빛나는 체험존·포탈·이웃 교류를 소개하고, 2단계에서 방향키/WASD 이동·Shift 달리기·Space 점프·T/E 상호작용을 안내합니다.
- 안내가 열린 동안 캐릭터 입력과 충녕이 대화 버튼을 잠그고, 마지막 단계 완료 후에만 자유 이동을 시작하도록 했습니다.
- 안내 완료 여부 키를 v3로 갱신해 기존 이용자도 새 안내를 한 번 확인할 수 있도록 했습니다.

## 변경 파일

- `react-app/src/components/LakeParkTutorial.tsx`
- `react-app/src/pages/GamePage.tsx`
- `react-app/src/game/renderers/VillageMapRenderer.ts`
- `react-app/src/App.tsx`
- `react-app/src/runtimeBuild.ts`
- `src/app/page.home/view.pug`
- `src/assets/jochwon-app/` 신규 프로덕션 빌드
- `devlog.md`
- `devlog/2026-08-05/059-lake-first-visit-guide.md`

## 검증 결과

- `npm run build` 성공: 클라이언트 TypeScript, Vite 프로덕션 빌드, 성능 예산 검사, 서버 TypeScript 통과
- `npm run test:runtime-entry` 2개 통과
- `npm run test:lake-portals` 11개 통과
- 생성된 화면 번들에서 2단계 안내 문구, v3 완료 키, 첫 입장 렌더링 연결을 정적 확인했습니다.
- 생성된 3D 엔진 번들에서 충녕이 자동 접근이 비활성화된 것을 정적 확인했습니다.
