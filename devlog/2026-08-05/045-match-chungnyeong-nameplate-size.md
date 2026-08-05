# 충녕이 이름표를 사용자 이름표 크기로 통일

## 사용자 원문 요청

> 스크린 샷을 보면 충녕이 이름표랑 내 이름표랑 너무 차이 많이나;;; 내 이름표 크기게 맞게 충녕이 이름표도 수정해줘

## 변경 파일

- `react-app/src/game/renderers/VillageMapRenderer.ts`
  - 충녕이 이름표 전용 확대 배율을 제거하고 사용자 이름표와 동일한 `120 × 30` 월드 스프라이트 크기를 적용했습니다.
  - 이름표에서 `안내 NPC` 배지를 제거해 사용자 이름표와 같은 단일 이름 형식으로 통일했습니다.
- `react-app/index.html`
  - 새 이름표 번들이 즉시 반영되도록 빌드 ID를 갱신했습니다.
- `src/app/page.home/view.pug`
  - iframe 빌드 쿼리를 새 빌드 ID와 일치시켰습니다.
- `src/assets/jochwon-app/`
  - React 프로덕션 빌드 결과를 WIZ 정적 자산에 반영했습니다.

## 검증 결과

- React/TypeScript 프로덕션 빌드(`npm run build`)를 통과했습니다.
- 성능 예산 검사와 서버 TypeScript 검사를 통과했습니다.
- 생성 번들에서 충녕이 단일 이름과 `120 × 30` 이름표 배율 적용을 정적 확인했습니다.
