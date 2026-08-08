# 024. 축제 NPC 대화와 체험 상호작용 UI 분리

## 사용자 요청

축제 NPC 대화창과 E키 상호작용 UI가 겹쳐 보이지 않도록 수정한다.

## 변경 파일

- `react-app/src/pages/GamePage.tsx`
- `react-app/src/pages/GamePage.css`
- 최신 `src/assets/jochwon-app/index.html` 및 `assets/*`

## 변경 내용 및 확인

NPC 대화·만남 상태에 `is-npc-chat` 상태 클래스를 적용하고, 해당 상태에서는 축제 체험 진입 안내·체험 오버레이를 숨긴다. 대화 종료 후 체험 UI가 다시 표시된다. React/Vite 및 WIZ 빌드 성공, 운영 WIZ 빌드 성공을 확인했다.
