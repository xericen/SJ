# 미래 세종관 E 체험 카메라 상향 조정

## 사용자 요청

```text
카메라 각도를 조금 더 위로 올려서 앞에 자율주행 brt 윗 부분까지 보이게 해줘
```

## 변경 파일

- `react-app/src/game/renderers/VillageMapRenderer.ts`
- `react-app/index.html`
- `src/app/page.home/view.pug`
- `src/assets/jochwon-app/` 빌드 산출물
- `devlog.md`
- `devlog/2026-08-05/005-smartcity-camera-angle-up.md`

## 작업 내용

- E 체험 카메라의 주시점을 홀로그램 상단 방향으로 추가 이동해 후면 서비스 화면 상단과 제목이 보이도록 조정했다.
- 중앙 테이블 조작부와 홀로그램 도시가 함께 유지되는 범위에서만 상향했다.
- 캐시 빌드 ID를 `20260805-smartcity-camera-up-v12`로 갱신하고 React 산출물을 WIZ 정적 자산에 동기화했다.

## 확인 결과

- `npm run build`: TypeScript·Vite·서버 빌드 성공.
- WIZ `wiz_project_build(clean=false)`: 성공.
- 운영 `/home`에서 새 빌드 ID 로드 확인.
- 1536×864 브라우저에서 E 진입 후 최종 카메라 전환을 기다린 상태로 후면 서비스 화면의 제목과 설명 3줄이 모두 보이는 것을 확인했다.
- 중앙 테이블 전체, 홀로그램 도시, 좌·우 벽면 패널이 동시에 유지되는 것을 확인했다.
