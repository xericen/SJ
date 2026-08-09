# STEP 9 AI 추천 일정 연결 복구

## 사용자 요청

> ai일정 준비완료 잘 연결이 안되어있는데 다시 확인해줘. 수정해줘.

## 변경 내용

- STEP 9 추천 장소의 깨진 기본 링크 UI를 코스 카드 버튼으로 교체했습니다.
- 장소를 누르면 새 창 대신 완료 화면 내부에서 카카오지도를 표시하도록 연결했습니다.
- 일정 저장 시 추천 장소명뿐 아니라 장소 유형, 주소, AI 추천 이유를 프로필 추천 코스 데이터에 함께 저장합니다.
- 저장 버튼 문구로 저장 대상이 `내 프로필 추천 코스`임을 명확히 했습니다.
- 03은 기존 규칙대로 02에서 명시적으로 확정한 프로젝트 코스만 표시하며 STEP 9 추천 일정과 혼합하지 않습니다.

## 변경 파일

- `react-app/src/components/GovernmentAiRecommendationCenter.tsx`
- `react-app/src/components/GovernmentAiRecommendationCenter.css`
- `src/assets/jochwon-app/index.html`
- `src/assets/jochwon-app/assets/*` (빌드 산출물)
- `src/app/page.home/view.pug`
- `devlog.md`
- `devlog/2026-08-09/007-fix-ai-ready-route-connection.md`

## 확인 결과

- React TypeScript, Vite, 서버 빌드 성공
- 성능 예산 검사 성공
- 추천 장소·주소·추천 이유 저장 코드와 인라인 지도 연결 확인
