# 운영 런타임 자산 동기화 및 홈 CSS 복구 흐름 안정화

## 사용자 원문 요청

> 현재 이 문제 생기는데 이거 해결해줘, 그리고 홈 화면 css깨지는 것도 수정해줘

## 변경 내용

- 운영 HTML은 이전 v115 JS·CSS를 참조하지만 정적 자산은 최신 v176으로 교체되어, 엔트리와 스타일시트가 모두 404가 되던 배포 불일치를 확인하고 최신 산출물을 다시 동기화했다.
- 오래된 `_build` 및 `_entry_retry` URL에서 재탐색을 수행하며 두 페이지 생명주기의 엔트리가 겹치던 흐름을 제거하고, 현재 URL만 `history.replaceState`로 정규화하도록 수정했다.
- 재시도 표식을 빌드 ID별로 구분해 이전 버전의 실패 상태가 새 버전까지 이어지지 않도록 수정했다.
- 실제 엔트리 로드가 반복 실패하는 경우에도 깨진 일반 텍스트 대신 독립적인 인라인 스타일 오류 카드와 다시 불러오기 버튼을 제공하도록 보강했다.
- 런타임 빌드를 `20260806-runtime-css-recovery-v177`로 갱신하고 최신 React 산출물과 WIZ 홈 iframe을 함께 배포했다.

## 변경 파일

- `react-app/index.html`
- `react-app/vite.config.ts`
- `react-app/scripts/runtimeEntry.test.ts`
- `react-app/src/runtimeBuild.ts`
- `src/app/page.home/view.pug`
- `src/assets/jochwon-app/index.html`
- `src/assets/jochwon-app/assets/*` (v177 프로덕션 산출물)
- `devlog.md`
- `devlog/2026-08-06/081-fix-runtime-asset-sync-and-css-recovery.md`

## 확인 결과

- `npm run build`: 성공 (클라이언트 TypeScript, Vite 프로덕션 빌드, 성능 예산, 서버 TypeScript)
- `npm run test:runtime-entry`: 6/6 통과
- `npm run test:postmessage`: 2/2 통과
- WIZ `main` 프로젝트 일반 빌드(`clean: false`): 성공
- 운영 v177 HTML, JavaScript, CSS가 모두 HTTP 200이고 JS·CSS SHA-256이 로컬 산출물과 일치함을 확인
- 운영 `/home` iframe에서 스타일시트 1개 적용, 홈 `grid` 레이아웃, 런타임 오류 0건을 확인
- 오래된 v176 빌드·재시도 URL이 v177로 정규화된 뒤 홈 화면을 정상 렌더링하는 것을 확인
- 인증 완료 신규 사용자 응답을 모의해 캐릭터 설정 1단계가 스타일과 함께 정상 렌더링되는 것을 확인
- 엔트리 강제 실패 시 독립 스타일 오류 카드와 재시도 버튼이 정상 표시되는 것을 확인

## 남은 리스크

- 실제 카카오 계정의 인증 입력은 자동화 환경에서 대신 수행할 수 없어, 로그인 이후 화면은 인증 완료 서버 응답을 모의해 검증했다.
