# 중앙광장 AI 추천센터 점프 착지 높이 및 발 정렬 수정

- **ID**: 015
- **날짜**: 2026-08-05
- **유형**: 버그 수정
- **리뷰 ID**: eoxtwylauxhtgacdckvpgmjapxblddby

## 원문 요청사항

```text
점프를 해서 ai 세종 추천센터 위에 올라가는데, 발이 묻힌 느낌이라 이거 제대로 수정해줘, 점프를 해서 위로 올라가되, 발이 바닥과 잘 맞게 수정
```

## 작업 요약

AI 세종 추천센터의 장식 링과 광장 바닥 사이에서 일반 지면 레이가 잘못된 높이를 선택하던 문제를 수정했다. GLB의 `AI_Platform_Stone` 상단을 전용 착지면으로 계산하고, 실제 점프로 높이를 넘은 뒤에는 캐릭터 발 전체가 플랫폼을 벗어날 때까지 동일한 상단 높이를 유지하도록 처리했다. 분석 시작 시 중앙 이동도 같은 착지면 높이를 사용한다.

## 변경 파일 목록

- `react-app/src/game/renderers/VillageMapRenderer.ts`: 추천센터 전용 착지면 계산, 점프 진입 판정, 상단 높이 고정 및 상태 정리 추가
- `react-app/index.html`: 운영 캐시 갱신용 빌드 ID 변경
- `src/app/page.home/view.pug`: iframe 빌드 쿼리 갱신
- `src/assets/jochwon-app/`: 최신 React 프로덕션 빌드 동기화
- `devlog.md`
- `devlog/2026-08-05/015-central-plaza-platform-landing.md`

## 검증 결과

- `npm run build`: 성공
- WIZ 프로젝트 일반 빌드: 성공
- 생성 번들 `node --check`: 성공
- GLB의 `AI_Platform_Stone` 상단을 착지 높이로 사용하는 코드와 점프 진입 조건 확인
- React 원본, WIZ 페이지, 배포 정적 자산의 빌드 ID 일치 확인
- `git diff --check`: 성공

## 남은 리스크

- 실제 캐릭터 모델별 발 본과 원점 차이에 따른 미세한 시각 편차는 브라우저에서 각 아바타로 최종 확인이 필요하다.
