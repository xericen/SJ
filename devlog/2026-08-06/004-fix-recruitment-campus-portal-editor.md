# 모집센터 공동캠퍼스 귀환 포탈 위치 이동·공용 저장 연결 수정

- **ID**: 004
- **날짜**: 2026-08-06
- **유형**: 버그 수정
- **리뷰 ID**: udcvbdywmlrnmptjpkcatbtxawfyzjay

## 작업 요약

모집센터의 기존 포탈 편집 버튼이 수신자가 없는 `primary-portal-place-at-player` 이벤트를 호출해 클릭이 무시되던 문제를 수정했다. 편집 권한 사용자에게만 버튼을 노출하고, 현재 캐릭터 위치로 포탈을 옮긴 뒤 WIZ 공용 좌표로 저장하는 `world-portal-place-at-player` 경로에 연결했다.

## 원문 요청사항

```text
모집센터에 있는 공동캠퍼스로 가는 포탈 위치 내가 변경할 수 있게 해줘, 현재 버튼은 있지만 옮겨지지 않음
```

## 변경 파일 목록

- `react-app/src/pages/GamePage.tsx`
  - 모집센터 포탈 버튼을 `canEditPortals` 권한과 연결했다.
  - 버튼 이벤트를 공용 포탈 위치 이동·저장 이벤트로 변경하고 저장 진행 안내 문구를 보강했다.
- `react-app/scripts/campusPortals.test.ts`
  - 모집센터 버튼 권한 조건, 공용 이벤트 연결, 서버 저장소 허용 여부 회귀 테스트를 추가했다.
- `react-app/src/runtimeBuild.ts`, `src/app/page.home/view.pug`
  - 런타임 빌드 ID를 `20260806-recruitment-portal-editor-v100`으로 갱신했다.
- `src/assets/jochwon-app/`
  - 최신 React 프로덕션 빌드 143개 파일을 WIZ 정적 자산에 동기화했다.
- `devlog.md`, `devlog/2026-08-06/004-fix-recruitment-campus-portal-editor.md`
  - 변경 내용과 검증 결과를 기록했다.

## 확인 결과

- `npm run test:campus-portals` 통과: 4건
- `npm run test:runtime-entry` 통과: 2건
- `npm run build` 성공: 클라이언트 TypeScript, Vite 운영 번들, 성능 예산, 서버 TypeScript 통과
- React `dist`와 WIZ `src/assets/jochwon-app` 143개 파일 일치
- WIZ 일반 빌드(`clean: false`) 성공
- 운영 `/home` 및 정적 앱 `index.html` HTTP 200 확인
- 운영 정적 앱에서 빌드 ID `v100`과 엔트리 `index-Bvv0VOJE.js` 반영 확인
- `git diff --check` 통과

## 남은 리스크

- 요청자 계정의 WIZ 역할이 `portal_editor` 또는 `admin`이어야 편집 버튼이 노출된다.
- 실제 요청자 로그인 브라우저에서 버튼을 눌러 DB 저장 후 다른 사용자 세션에 동일 좌표가 보이는 수동 다중 사용자 검증은 수행하지 않았다.
