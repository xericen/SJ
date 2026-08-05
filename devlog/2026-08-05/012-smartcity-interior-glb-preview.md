# 스마트시티 3D 미리보기를 실제 내부 GLB 전용 구도로 변경

## 사용자 요청

```text
안에 내부에 있는 glb로 바꿔줘,,
```

## 변경 파일

- `react-app/src/components/WorldModelPreview.tsx`
- `react-app/src/pages/LandingPage.tsx`
- `react-app/index.html`
- `src/app/page.home/view.pug`
- `src/assets/jochwon-app/` 빌드 산출물
- `devlog.md`
- `devlog/2026-08-05/012-smartcity-interior-glb-preview.md`

## 작업 내용

- 스마트시티 안내 모달이 실제 인게임 로컬 에셋 `sejong-smartcity-exhibition.glb`를 내부 전용 시점으로 표시하도록 `interior` 미리보기 모드를 추가했다.
- 스마트시티 미리보기의 자동 회전을 끄고 카메라를 전면 중앙에 배치해 중앙 디지털 트윈 테이블, 좌우 전시 화면, 후면 전시 화면이 크게 보이도록 변경했다.
- 표시되는 GLB 용량을 실제 번들 파일 크기에 맞춰 12MB에서 2.8MB로 정정했다.
- 캐시 빌드 ID를 `20260805-smartcity-interior-preview-v23`으로 갱신하고 WIZ 정적 자산을 동기화했다.

## 확인 결과

- `npm run build`: TypeScript·Vite·서버 빌드 성공.
- WIZ `wiz_project_build(clean=false)`: 성공.
- 운영 `/home`에서 `20260805-smartcity-interior-preview-v23` 로드 확인.
- 운영 브라우저의 스마트시티 안내 모달에서 내부 전용 카메라(`0deg 78deg 68%`)와 내부 타깃(`0m 4.5m -3m`)이 적용되고 자동 회전이 비활성화된 것을 확인했다.
- 1536×864 화면에서 중앙 테이블과 내부 전시 벽면이 한 화면에 선명하게 표시되는 것을 직접 확인했다.

## 남은 리스크

- 사용자가 마우스나 터치로 카메라를 회전·확대하면 초기 내부 구도에서 벗어날 수 있다.
