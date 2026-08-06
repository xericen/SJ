# 공동캠퍼스 포탈 4개 3초 충전 이동 및 동아리 거리제 명칭 통일

## 사용자 원문 요청

> 각 공동캠퍼스에 있는 포탈 똑같이 3초 동안해서 맵 이동할 수 있게 변경해줘, 그리고 동아리관 -> 동아리 거리제로 변경

## 변경 내용

- 공동캠퍼스의 학생회관·동아리 거리제·모집센터·프로젝트실 포탈을 공통 `PortalTravelGate` 대상에 포함했다.
- 네 포탈 모두 활성 반경 140 안에서 3초 동안 계속 머물러야 이동하며, 범위를 벗어나면 충전 진행도가 초기화되도록 변경했다.
- 공동캠퍼스 포탈의 기존 `E` 키 즉시 이동 분기를 제거하고 기존 포탈 이동 카운트다운 UI를 사용하도록 통일했다.
- `동아리관` 표기를 포탈, 공간 안내, 캠퍼스 메뉴, 동아리방, AI 공간 안내 전반에서 `동아리 거리제`로 통일했다.
- 런타임 빌드 ID를 `20260806-campus-portals-charge-v128`로 갱신하고 WIZ 정적 자산을 다시 빌드했다.

## 변경 파일

- `react-app/src/game/campusFeaturePortals.ts`
- `react-app/src/game/renderers/VillageMapRenderer.ts`
- `react-app/scripts/campusPortals.test.ts`
- `react-app/src/services/campusVisits.ts`
- `react-app/src/components/CampusCommunicationHub.tsx`
- `react-app/src/components/CampusClubRoom.tsx`
- `react-app/src/game/GameCanvas.tsx`
- `react-app/src/pages/LandingPage.tsx`
- `react-app/server/src/services/chungnyeong/chungnyeongTools.ts`
- `react-app/src/runtimeBuild.ts`
- `src/app/page.home/view.pug`
- `src/assets/jochwon-app/index.html`
- `src/assets/jochwon-app/assets/*` (프로덕션 빌드 산출물)
- `devlog.md`
- `devlog/2026-08-06/031-campus-portals-three-second-charge.md`

## 확인 결과

- `npm run test:campus-portals`: 6/6 통과
- `npm run test:campus-visual`: 3/3 통과
- `npm run test:club-street`: 2/2 통과
- `npm run test:runtime-entry`: 6/6 통과
- `npm run test:postmessage`: 2/2 통과
- `npm run build`: 성공
- WIZ `main` 프로젝트 빌드: 성공
- 운영 v128 HTML 및 게임 엔진 청크 HTTP 200·JavaScript 구문 검사 통과
- 운영 게임 청크에서 네 포탈의 목적지, `chargeSeconds:3`, `activationRadius:140`, `동아리 거리제` 명칭 확인

## 남은 리스크

- `test:world-navigation`의 공동캠퍼스 항목은 통과했지만, 이번 변경과 무관한 기존 마이홈 카메라 기대값이 현재 구현값과 달라 전체 4개 중 1개가 실패한다 (`1400 !== 1120`).
- 현재 환경에서는 브라우저에서 캐릭터를 직접 움직이는 수동 시각 검증을 수행하지 못했다.
