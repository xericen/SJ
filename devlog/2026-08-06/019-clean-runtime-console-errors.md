# Three.js 경고·프로필 JSON 오류 및 공연 상세 외부 스크립트 제거

## 사용자 원문 요청

> reviewops-sdk.js:1437 THREE.THREE.Clock: This module has been deprecated. Please use THREE.Timer instead.
>
> THREE.WebGLShadowMap: PCFSoftShadowMap has been deprecated. Using PCFShadowMap instead.
>
> [experience profile update failed] SyntaxError: Unexpected token '<', "<!DOCTYPE "... is not valid JSON
>
> GET https://kit.fontawesome.com/97feec9948.js net::ERR_ABORTED 403 (Forbidden)
>
> 해결해줘

## 변경 내용

- 캐릭터 미리보기의 애니메이션 시간을 `THREE.Clock` 대신 `requestAnimationFrame` 타임스탬프로 계산하도록 변경하고, 월드 그림자 맵을 `PCFShadowMap`으로 전환했다.
- 경험 프로필 API가 JSON이 아닌 HTML을 반환할 때 본문을 JSON으로 파싱하지 않고 로컬 경험 프로필 캐시로 조용히 대체하도록 공통 응답 판별 로직을 추가했다.
- 세종예술의전당 공연 상세를 외부 페이지 iframe 대신 스크립트를 제거한 읽기 전용 HTML로 표시해 Font Awesome Kit 403 요청이 앱에서 발생하지 않도록 했다.
- 공연 상세 원문 리더와 WIZ 허용 출처 검증을 추가하고, 로딩·오류 상태를 보강했다.
- 런타임 빌드를 `20260806-clean-runtime-warnings-v116`으로 갱신하고 프로덕션 산출물을 WIZ 정적 자산에 반영했다.

## 변경 파일

- `react-app/src/components/ThreeCharacterPreview.tsx`
- `react-app/src/game/renderers/VillageMapRenderer.ts`
- `src/app/page.home/avatar-preview-renderer.ts`
- `react-app/src/services/optionalJson.ts`
- `react-app/src/services/experienceHarness.ts`
- `react-app/src/services/foodSourcePreview.ts`
- `react-app/src/components/ArtsCenterPosterKiosk.tsx`
- `react-app/src/components/ArtsCenterPosterKiosk.css`
- `src/app/page.home/api.py`
- `react-app/src/runtimeBuild.ts`
- `src/app/page.home/view.pug`
- `react-app/package.json`
- `react-app/scripts/runtimeWarnings.test.ts`
- `react-app/scripts/artsCenterPoster.test.ts`
- `react-app/scripts/foodExperience.test.ts`
- `src/assets/jochwon-app/index.html`
- `src/assets/jochwon-app/assets/*` (v116 프로덕션 산출물)
- `devlog.md`
- `devlog/2026-08-06/019-clean-runtime-console-errors.md`

## 확인 결과

- `npm run build`: 성공 (TypeScript, Vite 프로덕션 빌드, 성능 예산, 서버 TypeScript)
- `npm run test:runtime-warnings`: 2/2 통과
- 공연 상세·먹거리 원문 테스트: 10/10 통과
- `npm run test:runtime-entry`: 5/5 통과
- `npm run test:postmessage`: 2/2 통과
- WIZ `main` 프로젝트 일반 빌드(`clean: false`): 성공
- 운영 v116 HTML과 `main.js`가 새 빌드 ID 및 `index-DoeGV5wJ.js` 엔트리를 참조하고, 해당 엔트리가 HTTP 200으로 응답함을 확인

## 남은 리스크

- 공연 상세 읽기 화면은 외부 원문 서비스의 응답 가능 여부에 영향을 받으며, 원문을 불러오지 못하면 오류 안내를 표시한다.
- 실제 사용자 세션의 전체 콘솔은 자동 브라우저로 재현하지 못했으며, 변경 경로는 소스 회귀 테스트와 운영 정적 자산 응답으로 확인했다.
