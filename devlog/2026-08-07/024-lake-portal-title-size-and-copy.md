# 호수공원 세 포탈 제목 크기 통일 및 3초 문구 제거

## 사용자 요청

포탈 위 제목인 세종예술의전당, 축제부스, 먹거리부스 아래의 “3초 이동” 문구를 없애고 축제부스 크기에 맞춰 세 제목의 크기를 동일하게 변경해 달라는 요청.

## 변경 파일

- `react-app/src/game/renderers/VillageMapRenderer.ts`: 세종호수공원 내 세 포탈 라벨의 충전 안내 문구를 숨기고, 축제부스와 같은 컴팩트 스케일을 적용.
- `src/assets/jochwon-app/assets/*`: `npm run build` 결과 운영 정적 번들 갱신.

## 확인 결과

- `npm run build` 통과.
- `npm run test:lake-portals` 통과(12개).
- `npm run test:world-portal-visual` 통과(3개).

## 남은 리스크

- 브라우저에서 실제 세 포탈에 접근하는 시각 검증은 수행하지 않았습니다. 번들 생성과 관련 정적·회귀 검증은 완료했습니다.
