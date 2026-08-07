# 공동캠퍼스 계열 활동 프로필 저장·HUD 펼침·정부청사 3초 포탈 적용

- **날짜**: 2026-08-07
- **리뷰 ID**: ubhnpywyyudignpzxnhbzznfezhtzgax
- **유형**: UX · 프로필 저장 · 포탈

## 사용자 원 요청

공동캠퍼스 안에 있는 모집센터, 프로젝트실, 학생회관, 동아리 거리제에서 하는 활동이 SQL에 저장되고 프로필을 채워주는지 확인. 모집센터처럼 공동캠퍼스·학생회관·프로젝트실도 좌측 현재 위치와 지금 함께하는 사람 영역이 연결되게 변경하고, 모든 맵에서 현재 활동 중은 펼쳐져 있게 수정. 동아리 거리제 카메라 위치를 고정하고 조절바 삭제. 정부청사 포탈은 E 버튼이 아니라 모두 3초 체류로 들어가게 변경.

## 변경 내용

- `react-app/src/pages/GamePage.tsx`
  - 공동캠퍼스, 학생회관, 모집센터, 프로젝트실, 동아리 거리제 진입 시 `recordCampusProfileSignal`을 호출해 통합 프로필 캠퍼스 신호로 저장되도록 보강했다.
  - 포커스형 맵 진입 시 `현재 활동 중` 패널을 자동 접지 않도록 변경했다.
- `react-app/src/game/renderers/VillageMapRenderer.ts`
  - 정부청사 내 공동캠퍼스, 중앙광장, 전망대, 스마트시티 포탈 모두 `chargeSeconds:3`을 적용했다.
- `react-app/src/game/fixedWorldCameraProfiles.ts`, `react-app/src/components/WorldCameraEditor.tsx`, `react-app/src/services/worldCameraProfiles.ts`
  - 동아리 거리제를 고정 카메라 맵으로 추가해 카메라 조절바가 노출되지 않도록 했다.
- `react-app/scripts/campusPortals.test.ts`, `react-app/scripts/worldCameraEditor.test.ts`
  - 정부청사 3초 포탈과 동아리 거리제 카메라 고정 회귀 검증을 추가·갱신했다.
- `react-app/src/runtimeBuild.ts`, `src/app/page.home/view.pug`, `src/assets/jochwon-app/`
  - 런타임 빌드 ID를 `20260807-campus-profile-hud-government-portals-v201`로 갱신하고 React 빌드 산출물을 WIZ 정적 자산에 반영했다.

## 확인한 내용

- 공동캠퍼스 계열 활동 저장 경로 확인:
  - 클라이언트 `recordCampusProfileSignal`
  - API `/api/account/me/unified-profile/campus-signal`
  - 서버 `UserModel.clubs.campusProfileSignals`
  - MySQL JSON 저장소 `jochwon_documents`
- `npm run test:campus-portals` 통과: 13개
- `npm run test:world-camera-editor` 통과: 8개
- `npm run build` 통과

## 남은 리스크

- `npm run test:world-ux-layout`는 기존 축제 NPC 기대값과 현재 소스가 맞지 않아 1건 실패했다. 이번 변경 대상은 아니며, 축제 NPC 소스가 이미 충녕이 없는 상태라 별도 정리가 필요하다.
- 실제 운영 브라우저에서 좌측 HUD 연결 모양과 정부청사 포탈 3초 체류 UX는 수동 시각 검증하지 못했다.
