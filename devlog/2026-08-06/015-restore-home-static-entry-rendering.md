# 홈 화면 정적 모듈 렌더링 복구

## 사용자 원문 요청

> 홈 화면 디자인이 현재 이상해졌음...다시 수정해줘

## 변경 내용

- 직전 런타임 오류 대응에서 도입한 동적 `import()` 엔트리 로더를 제거하고, Vite의 정적 `type="module"` 엔트리 로딩 방식으로 복구했다.
- 정상 렌더링 경로와 분리된 오류 복구 가드를 추가해 엔트리 로드 실패 시에만 캐시 및 서비스 워커를 정리하고 한 번 재시도하도록 유지했다.
- 홈 iframe과 런타임 빌드 ID를 `20260806-restore-static-entry-v111`로 갱신했다.
- React 프로덕션 빌드를 WIZ 정적 자산 경로에 반영했다.

## 변경 파일

- `react-app/vite.config.ts`
- `react-app/src/runtimeBuild.ts`
- `react-app/scripts/runtimeEntry.test.ts`
- `src/app/page.home/view.pug`
- `src/assets/jochwon-app/index.html`
- `src/assets/jochwon-app/assets/*` (프로덕션 빌드 산출물)
- `devlog.md`
- `devlog/2026-08-06/015-restore-home-static-entry-rendering.md`

## 확인 결과

- `npm run build`: 성공
- `npm run test:runtime-entry`: 4/4 통과
- `npm run test:postmessage`: 2/2 통과
- `npm run test:lake-portals`: 11/11 통과
- WIZ `main` 프로젝트 빌드: 성공
- 운영 v111 HTML에서 정적 모듈 엔트리와 메인 CSS 링크 확인
- 운영 엔트리 JavaScript 구문 검사 및 배포 자산 JavaScript 40개 구문 검사 통과
- 운영 메인 CSS와 로컬 빌드 CSS SHA-256 일치

## 남은 리스크

- 현재 실행 환경에 브라우저 자동화 실행 파일이 없어 실제 화면 픽셀 비교는 수행하지 못했다.
