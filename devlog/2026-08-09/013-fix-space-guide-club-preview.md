# 공간안내 동아리 거리제 3D 미리보기 수정

## 사용자 요청

> 공간안내 페이지의 동아리 거리제에서 `3D 모형을 불러오지 못했어요`가 표시되는 문제를 수정해 주세요.

## 원인

- 공간안내 모달은 실제 월드 입장 로더와 별개로 `@google/model-viewer`를 사용했습니다.
- 해당 미리보기 경로는 동아리 거리제 GLB의 Meshopt 압축 디코더를 등록하지 않아 로딩에 실패했습니다.

## 변경 내용

- 공간안내 미리보기를 공용 Meshopt 디코더가 적용된 Three.js GLTFLoader 기반 뷰어로 교체했습니다.
- 기존 드래그 회전, 줌, 자동 회전, 조명, 로딩 포스터와 오류 안내를 유지했습니다.
- 모델 크기에 맞춰 카메라 거리와 클리핑 범위를 자동 계산하도록 적용했습니다.

## 변경 파일

- `react-app/src/components/WorldModelPreview.tsx`
- `react-app/src/pages/LandingPage.css`
- `react-app/scripts/meshoptLoaderCoverage.test.ts`
- `src/app/page.home/view.pug`
- `src/assets/jochwon-app/index.html`
- `src/assets/jochwon-app/assets/*` (빌드 산출물)
- `devlog.md`
- `devlog/2026-08-09/013-fix-space-guide-club-preview.md`

## 확인 결과

- 공간안내를 포함한 Meshopt·동아리 거리제 회귀 테스트 4건 통과
- React TypeScript, Vite, 서버 빌드 및 성능 예산 검사 성공
