# 스마트시티 공간안내 GLB 미리보기 수정

## 사용자 요청

> 스마트 도시맵도 GLB 파일로 볼 수 있게 하고, `Cannot read properties of undefined (reading 'isReady')` 오류를 수정해 주세요.

## 원인

- 공간안내의 모든 GLB를 새 Three.js 렌더러 하나에서 표시하면서 스마트시티 모델 렌더링이 앱의 기존 WebGL program 상태와 충돌했습니다.
- 스마트시티 GLB 자체와 공간 데이터 연결은 정상이었지만 렌더러 오류로 모달이 빈 화면처럼 표시됐습니다.

## 변경 내용

- 스마트시티를 포함한 일반 GLB는 독립된 `model-viewer` 렌더러에서 표시하도록 복구했습니다.
- Meshopt 압축이 필요한 동아리 거리제만 디코더가 등록된 Three.js 전용 뷰어를 사용하도록 분리했습니다.
- 스마트시티 공간 데이터가 실제 `sejong-smartcity-exhibition.glb`를 참조하는 회귀 테스트를 추가했습니다.

## 변경 파일

- `react-app/src/components/WorldModelPreview.tsx`
- `react-app/src/pages/LandingPage.css`
- `react-app/scripts/spaceGuideSmartCityPreview.test.ts`
- `src/app/page.home/view.pug`
- `src/assets/jochwon-app/index.html`
- `src/assets/jochwon-app/assets/*` (빌드 산출물)
- `devlog.md`
- `devlog/2026-08-09/014-fix-smart-city-space-guide-glb.md`

## 확인 결과

- 스마트시티·Meshopt 공간안내 회귀 테스트 4건 통과
- React TypeScript, Vite, 서버 빌드 및 성능 예산 검사 성공
