# 베어트리파크 밝기 개선

## 사용자 요청

> 베어트리파크 너무 어두운데 밝게 해줘

## 변경 내용

- 베어트리파크 전용 톤 매핑 노출을 `0.84`에서 `1.12`로 상향했습니다.
- 베어트리파크 전용 조명 강도를 `0.76`에서 `1.08`로 상향했습니다.
- 야외 주간 분위기에 맞게 배경과 보조 바닥 색상을 밝게 조정했습니다.
- 다른 맵의 조명 설정은 변경하지 않았습니다.

## 변경 파일

- `react-app/src/game/renderers/VillageMapRenderer.ts`
- `react-app/scripts/bearTreeVisualQuality.test.ts`
- `src/assets/jochwon-app/index.html`
- `src/assets/jochwon-app/assets/*` (빌드 산출물)
- `src/app/page.home/view.pug`
- `devlog.md`
- `devlog/2026-08-09/008-brighten-bear-tree-park.md`

## 확인 결과

- 신규 베어트리파크 밝기 회귀 검증 통과
- React TypeScript, Vite, 서버 빌드 성공
- 성능 예산 검사 성공
- 기존 곰 동상 자산 검증 1건은 현재 구현이 별도 곰 GLB 대신 베어트리 맵 내부 노드를 사용해 실패하며 이번 조명 변경과 무관함
