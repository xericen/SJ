# NPC·친구 프로필 및 신고·차단 안전 설정

- **ID**: 041
- **날짜**: 2026-08-06
- **유형**: 기능 추가
- **리뷰 ID**: sdpnckxiwdllqofimnhuovxfuiofjomy

## 작업 요약
T키로 마주 본 NPC와 다른 사용자의 프로필을 내 프로필과 유사한 확장형 화면으로 열도록 통합했다. 친구 추가 상태는 친구 삭제로 즉시 전환되며, 신고 사유와 신고 후 조치(차단하지 않기·대화만 차단·캐릭터 숨기기)를 선택할 수 있도록 구현했다. 함께 둘러보기 메뉴는 제거했다.

## 원문 요청사항
```text
Npc 즉 다른 캐릭터를 만나면 t버튼을 눌러서 마주보잖아, 프로필을 누르면 내 프로필처럼 친구 프로필도 그렇게 보일 수 있게 해줘, 그리고 친구추가 누르면 친구추가 -> 친구삭제로 변경, 신고하기 누르면 어떤 거 때문에 신고하는지 나오게 해주고, 캐릭터를 안 보이게할지 대화차단만할지 등 결정할 수 있게 해줘, 함께 둘러보기는 없애줘
```

## 변경 파일 목록
- `react-app/src/components/SocialProfileModal.tsx`, `SocialProfileModal.css`: 친구·NPC 공통 프로필과 신고 사유·안전 설정 모달 추가
- `react-app/src/services/socialSafety.ts`: 친구, 신고, 대화 차단, 캐릭터 숨김의 로컬 저장 로직 추가
- `react-app/src/pages/GamePage.tsx`, `GamePage.css`: T 상호작용 메뉴, 친구 추가·삭제, 공통 프로필, 신고·차단 상태를 게임 UI에 연결하고 함께 둘러보기 제거
- `react-app/src/game/scenes/WorldScene.ts`, `react-app/src/game/renderers/VillageMapRenderer.ts`: 숨긴 사용자·NPC를 3D 월드와 근접 감지에서 제외하고 차단한 사용자의 채팅 버블 차단
- `react-app/scripts/socialProfileActions.test.ts`: 친구 상태, 신고 저장, 메뉴 및 월드 차단 연결 회귀 테스트 추가
- `react-app/src/runtimeBuild.ts`: 운영 캐시 ID를 `20260806-social-profile-safety-v138`로 갱신
- `src/assets/jochwon-app/`: 최신 React 프로덕션 번들 동기화

## 확인 결과
- `npx tsx --test scripts/socialProfileActions.test.ts`: 3개 테스트 통과
- `npx tsc -b --pretty false`: TypeScript 검사 통과
- `npm run build`: Vite 클라이언트, 성능 예산, 서버 TypeScript 빌드 통과
- React `dist`와 WIZ `src/assets/jochwon-app` 전체 파일 비교 일치
- `wiz_project_build(clean=false)`: WIZ 프로젝트 빌드 성공
- 운영 정적 진입점에서 캐시 ID `20260806-social-profile-safety-v138` 및 엔트리 `index-DcM2X4tr.js` 연결 확인

## 남은 리스크
- 신고 내역과 친구·차단 상태는 현재 브라우저 로컬 저장소에 보관되므로 다른 기기 간 동기화나 운영자 신고 검토 큐 연동은 별도 서버 기능이 필요하다.
