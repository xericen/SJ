# v129 런타임 ReferenceError 수정

- **ID**: 033
- **날짜**: 2026-08-06
- **유형**: 버그 수정

## 작업 요약
장기 캐시가 적용된 `index-profile-records-v129.js` 고정 엔트리를 더 이상 참조하지 않도록 런타임 빌드 ID를 `v130`으로 갱신했다.
Vite가 생성한 콘텐츠 해시 엔트리를 그대로 배포하고, 기능명·버전명이 들어간 수동 엔트리 파일명을 회귀 테스트에서 차단했다.

## 원문 요청사항
```text
index-profile-records-v129.js:1 Uncaught ReferenceError: e is not defined
    at index-profile-records-v129.js:1:1 해결해줘
```

## 변경 파일 목록

- `react-app/src/runtimeBuild.ts`
  - 런타임 빌드 ID를 `20260806-runtime-entry-reference-fix-v130`으로 갱신했다.
- `react-app/scripts/runtimeEntry.test.ts`
  - 프로덕션 엔트리가 Vite 콘텐츠 해시 형식인지, HTML과 엔트리의 빌드 ID가 일치하는지 검증하도록 보강했다.
- `src/app/page.home/view.pug`
  - 홈 iframe이 새 `v130` 런타임을 요청하도록 변경했다.
- `src/assets/jochwon-app/index.html`, `src/assets/jochwon-app/assets/*`
  - 새 빌드 산출물을 반영해 `index-Cmb_wzZQ.js` 콘텐츠 해시 엔트리를 사용하도록 변경했다.
- `devlog.md`, `devlog/2026-08-06/033-fix-v129-runtime-reference-error.md`
  - 작업 이력을 기록했다.

## 확인 결과

- `npm run build` 통과
- `npm run test:runtime-entry` 6개 통과
- `npm run test:postmessage` 2개 통과
- `npm run test:runtime-warnings` 2개 통과
- `npm run test:campus-portals` 6개 통과
- WIZ 일반 빌드(`clean: false`) 통과
- 운영 HTML이 `v130`과 `index-Cmb_wzZQ.js`를 반환하는지 확인
- 운영 엔트리 JavaScript 구문 검사 통과 및 로컬 산출물과 SHA-256 일치 확인
