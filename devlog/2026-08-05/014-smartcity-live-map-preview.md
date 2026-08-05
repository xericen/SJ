# 스마트시티 미리보기를 수정된 실제 맵의 드래그형 라이브 렌더링으로 전환

## 사용자 요청

```text
내가 말한 내부를 glb파일로 해달라는 말은, 현재 glb파일에 있는 거랑 내가 수정을해서 맵에 직접 들어갔을 때랑 모습이 다르잖아, 그 맵에 들어갔을 때 모습을 해달라는 거야, 다른 맵들이랑 동일하게 드래그해서 볼 수 있게 하되,맵안에 있는 모습으로 해달라는 거지 정면 구조가 아니고
```

## 변경 파일

- `react-app/src/components/SmartCityWorldPreview.tsx`
- `react-app/src/components/SmartCityWorldPreview.css`
- `react-app/src/components/SmartCityExperience.tsx`
- `react-app/src/components/WorldModelPreview.tsx`
- `react-app/src/pages/LandingPage.tsx`
- `react-app/src/App.tsx`
- `react-app/src/game/GameCanvas.tsx`
- `react-app/src/game/renderers/VillageMapRenderer.ts`
- `react-app/index.html`
- `src/app/page.home/view.pug`
- `src/assets/jochwon-app/` 빌드 산출물
- `devlog.md`
- `devlog/2026-08-05/014-smartcity-live-map-preview.md`

## 작업 내용

- 스마트시티 안내 모달에서 원본 GLB만 보여 주던 일반 `model-viewer`를 제거하고 실제 입장 화면과 동일한 `GameCanvas`·`VillageMapRenderer`를 미리보기로 재사용했다.
- 런타임에 추가된 디지털 트윈 홀로그램, 서비스 데이터 태그, 고해상도 후면 화면, 좌우 HTML 안내 패널이 미리보기에도 함께 나타나도록 연결했다.
- 정면 고정 카메라를 폐기하고 다른 3D 모형처럼 왼쪽 드래그 회전, 오른쪽 드래그 이동, 휠 확대·축소가 가능한 전용 미리보기 조작을 적용했다.
- 카메라 회전 중 벽면 HTML이 오른쪽 설명 영역으로 넘어가지 않도록 3D 미리보기 프레임 경계에 맞춰 동적 클리핑했다.
- 미리보기에서도 홀로그램 애니메이션이 계속 갱신되도록 프리뷰 카메라 렌더 루프에 홀로그램 업데이트를 연결했다.
- 캐시 빌드 ID를 `20260805-smartcity-live-map-preview-v26`으로 갱신하고 WIZ 정적 자산을 동기화했다.

## 확인 결과

- `npm run build`: TypeScript·Vite·서버 빌드 성공.
- WIZ `wiz_project_build(clean=false)`: 성공.
- 운영 `/home`에서 `20260805-smartcity-live-map-preview-v26` 로드 확인.
- 스마트시티 안내 모달에 실제 맵 WebGL Canvas 1개가 표시되고 기존 `model-viewer`는 생성되지 않는 것을 확인했다.
- 좌측 `세종 스마트시티란?`, 우측 `세종의 미래기술`, `데이터로 연결된 세종` HTML 패널과 디지털 트윈 홀로그램이 미리보기에 표시되는 것을 확인했다.
- 마우스 왼쪽 드래그 전후 Canvas 픽셀이 달라져 회전 조작이 실제 동작하는 것을 자동 검증했다.
- 드래그 후에도 벽면 HTML이 미리보기 프레임 안에서만 보이는 것을 운영 화면으로 확인했다.

## 남은 리스크

- 일반 GLB 뷰어보다 실제 게임 렌더러를 사용하므로 스마트시티 미리보기 최초 로딩 시 GPU 사용량이 다소 증가할 수 있다.
