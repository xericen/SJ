# 미래 세종관 후면 화면 품질·홀로그램 태그·캐릭터 겹침 개선

## 사용자 요청

```text
디지털 트윈 뒤에 벽에 붙어있는 html의 화질 높여줘, 그리고 홀로그램에서 있는 태그?라고 해야하나 그거 너무 크거든 사이즈를 2/3정도로 줄여줘, 그리고 현재 스마트 서비스 선택하는 테이블이랑 캐릭터랑 겹쳐지는 현상이 있음 이 부분 겹쳐지지 않게 수정
```

## 변경 파일

- `react-app/src/game/renderers/SmartCityHologram.ts`
- `react-app/src/game/renderers/VillageMapRenderer.ts`
- `react-app/index.html`
- `src/app/page.home/view.pug`
- `src/assets/jochwon-app/` 빌드 산출물
- `devlog.md`
- `devlog/2026-08-05/009-smartcity-screen-label-character-overlap.md`

## 작업 내용

- 서비스별 후면 설명 화면의 CanvasTexture를 2048×1024에서 4096×2048로 높이고 최대 이방성 필터를 16으로 올렸다.
- 후면 화면의 논리 좌표는 유지한 채 4배 스케일로 그려 글자와 선의 선명도를 높였다.
- 홀로그램 데이터 태그와 AED 태그를 기존 대비 약 2/3 크기로 축소했다.
- E 체험 중 로컬 캐릭터·안내 캐릭터·NPC·원격 캐릭터를 숨기고 ESC 종료 시 다시 표시해 중앙 테이블 HTML과의 겹침을 제거했다.
- 캐시 빌드 ID를 `20260805-smartcity-screen-label-overlap-v20`으로 갱신하고 WIZ 정적 자산을 동기화했다.

## 확인 결과

- `npm run build`: TypeScript·Vite·서버 빌드 성공.
- WIZ `wiz_project_build(clean=false)`: 성공.
- 운영 `/home`에서 `20260805-smartcity-screen-label-overlap-v20` 로드 확인.
- 1536×864 운영 브라우저에서 E 진입 후 디지털 트윈을 선택해 축소된 태그와 선명한 후면 화면을 확인했다.
- E 체험 중 캐릭터가 보이지 않아 테이블과 겹치지 않고, ESC 종료 후 HUD와 캐릭터 표시 상태가 복원되는 것을 확인했다.
- 체험 중 위치·접속자·채팅·나가기 UI가 계속 숨김 상태인 것을 확인했다.

## 남은 리스크

- 4096×2048 CanvasTexture는 기존보다 GPU 메모리를 더 사용하므로 저사양 모바일 기기에서는 초기 텍스처 생성 순간의 체감 성능을 추가 확인할 필요가 있다.
