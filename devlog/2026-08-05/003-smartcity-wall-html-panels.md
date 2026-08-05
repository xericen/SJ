# 미래 세종관 후면 화면 고해상도화 및 좌·우 벽면 HTML 안내 패널 구현

## 사용자 요청

```text
뒤에 있는 자율주행 벽에 붙어있는 거 화질 조금 더 좋게 변경해주고, 그 앞에 있는 왼쪽 벽, 오른쪽 벽 2개에 , 왼쪽벽에는 세종 스마트 시티란? 이 내용 html로 벽에 나오게 해주면 되고, 오른쪽 벽 2개 같은 경우는 세종의 미래기술, 또 다른 거 세종과 관련된 내용 html로 넣어줘 (공용파일 참고해서 디자인 해주면 돼)
```

## 변경 파일

- `react-app/src/components/SmartCityExperience.tsx`
- `react-app/src/components/SmartCityExperience.css`
- `react-app/src/game/renderers/SmartCityHologram.ts`
- `react-app/src/game/renderers/VillageMapRenderer.ts`
- `react-app/src/pages/GamePage.tsx`
- `react-app/src/pages/GamePage.css`
- `react-app/index.html`
- `src/app/page.home/view.pug`
- `src/assets/jochwon-app/` 빌드 산출물
- `devlog.md`
- `devlog/2026-08-05/003-smartcity-wall-html-panels.md`

## 작업 내용

- 공용 설계도의 화이트·블루 전시 패널 구성을 반영해 좌측 벽에 `세종 스마트시티란?`, 우측 두 벽에 `세종의 미래기술`, `데이터로 연결된 세종` HTML 패널을 배치했다.
- HTML 패널을 GLB 벽 메시의 화면 투영 좌표와 연결해 일반 시점과 E 체험 카메라 전환 중에도 실제 벽의 원근을 따라가도록 했다.
- 체험 중 주변 HUD를 숨기는 기존 처리에서 새 벽면 패널은 유지되도록 예외 처리했다.
- 후면 서비스 설명 화면의 Canvas 텍스처를 1024×512에서 2048×1024로 올리고 밉맵·선형 필터를 적용했다.
- 캐시 빌드 ID를 `20260805-smartcity-wall-panels-v10`으로 갱신하고 React 산출물을 WIZ 정적 자산에 동기화했다.

## 확인 결과

- `npm run build`: TypeScript·Vite·서버 빌드 성공.
- WIZ `wiz_project_build(clean=false)`: 성공.
- 운영 `/home`에서 새 빌드 ID 로드 확인.
- 1536×864 브라우저 실측에서 좌측 1개와 우측 2개 벽면 패널이 모두 표시되고, E 진입 후에도 `display:flex` 상태로 유지되는 것을 확인했다.
- E 진입 후 중앙 테이블 6개 서비스 버튼, 홀로그램, 후면 `자율주행 BRT` 설명 화면이 동시에 표시되는 것을 확인했다.
- `AI 교통관제` 선택 후 후면 화면 제목·설명 변경과 100% 적용 완료 상태를 확인했다.
- 체험 중 위치·주변 반응·채팅·나가기 등 기존 HUD는 모두 숨김 상태임을 재확인했다.
