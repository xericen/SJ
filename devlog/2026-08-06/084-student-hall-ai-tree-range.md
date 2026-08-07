# 학생회관 AI 추천 트리 E 안내 인식 범위 확대

- **ID**: 084
- **날짜**: 2026-08-06
- **유형**: 버그 수정
- **리뷰 ID**: `hpffhegdocwhrcpeoyqprwddfnczrtvu`

## 작업 요약

학생회관 중앙 AI 추천 트리는 원형 소파 때문에 캐릭터가 기존 진입 반경의 경계까지만 접근하기 쉬웠다.
트리 전용 E 상호작용 인식 반경을 145에서 190으로 넓혀 소파 앞 접근 동선에서도 안내가 안정적으로 노출되도록 조정했다.

## 원문 요청사항

```text
ai 추천 트리 열기 e버튼이 잘 안 나오는데, 인식되는 범위를 조금 넓혀주면 좋을 거 같아
```

## 변경 파일 목록

- `react-app/src/game/renderers/VillageMapRenderer.ts`
  - 학생회관 AI 추천 트리 전용 인식 거리 상수를 190으로 추가하고 트리 대상에 적용
- `react-app/scripts/campusPortals.test.ts`
  - 트리 전용 인식 범위와 E 안내 대상 연결을 고정하는 회귀 테스트 추가
- `react-app/src/runtimeBuild.ts`
  - 런타임 빌드 ID를 `20260806-student-hall-ai-tree-range-v180`으로 갱신
- `src/app/page.home/view.pug`
  - WIZ 홈 iframe의 빌드 쿼리를 v180으로 갱신
- `src/assets/jochwon-app/`
  - v180 React 프로덕션 빌드 산출물 동기화
- `devlog.md`
- `devlog/2026-08-06/084-student-hall-ai-tree-range.md`

## 확인 결과

- `npm run test:campus-portals`: 11/11 통과
- `npm run build`: 클라이언트 TypeScript, Vite 프로덕션 빌드, 성능 예산, 서버 TypeScript 통과
- `npm run test:runtime-entry`: 6/6 통과
- React `dist`와 WIZ `src/assets/jochwon-app` 비교: 차이 없음
- WIZ `main` 프로젝트 일반 빌드(`clean: false`): 성공
- 최초 전체 빌드는 디스크 용량 부족으로 중단됐으나 재생성 가능한 `react-app/dist`, `react-app/node_modules/.vite`를 정리한 뒤 재실행하여 성공

## 남은 리스크

- 실제 운영 브라우저에서 캐릭터를 소파 주변 여러 방향으로 이동시키는 수동 체감 검증은 수행하지 못했다.
