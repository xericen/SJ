# ReviewOps SDK 단일 식별자 ReferenceError 격리

## 사용자 원문 요청

> reviewops-sdk.js:1 Uncaught ReferenceError: e is not defined
>
> 해결해줘

## 변경 내용

- 앱 호스트가 실행되기 전에 오류 격리 가드를 등록해, 외부 `reviewops-sdk.js`에서 발생한 단일 식별자 `ReferenceError`가 앱 오류처럼 전파되거나 콘솔에 미처리 오류로 남지 않도록 했다.
- 파일명과 오류 형태가 모두 일치하는 경우만 격리해 앱 자체 오류와 다른 외부 오류는 기존처럼 전달되도록 범위를 제한했다.
- 런타임 빌드를 `20260806-stable-runtime-identifiers-v123`으로 갱신하고 새 해시 산출물을 WIZ 정적 자산에 반영했다.

## 변경 파일

- `src/angular/index.pug`
- `react-app/src/runtimeBuild.ts`
- `react-app/scripts/runtimeEntry.test.ts`
- `src/app/page.home/view.pug`
- `src/assets/jochwon-app/index.html`
- `src/assets/jochwon-app/assets/*` (v123 프로덕션 산출물)
- `devlog.md`
- `devlog/2026-08-06/026-isolate-reviewops-sdk-reference-error.md`

## 확인 결과

- `npm run build`: 성공 (TypeScript, Vite 프로덕션 빌드, 성능 예산, 서버 TypeScript)
- `npm run test:runtime-entry`: 6/6 통과
- `npm run test:postmessage`: 2/2 통과
- `npm run test:runtime-warnings`: 2/2 통과
- WIZ `main` 프로젝트 일반 빌드(`clean: false`): 성공
- 운영 Chromium에서 랜딩·월드 미리보기 진입 시 콘솔 오류가 없고 v123 런타임이 적용된 것을 확인
- 운영 페이지에서 같은 SDK 파일명과 오류를 재현했을 때 후속 오류 수신 0건·콘솔 오류 0건, 다른 파일명의 동일 오류는 정상 전달되는 것을 확인

## 남은 리스크

- 외부 ReviewOps SDK 자체의 결함은 이 프로젝트에서 수정할 수 없어, 앱 동작과 오류 수집에 영향을 주지 않도록 해당 오류만 경계에서 격리했다.
