# 중앙광장 AI 세종 추천센터 단계형 홀로그램 체험 구현

- **ID**: 006
- **날짜**: 2026-08-05
- **유형**: UX 구현
- **리뷰 ID**: eoxtwylauxhtgacdckvpgmjapxblddby

## 원문 요청사항

```text
공용 파일에 있는 사진처럼 만들어주면 될 거 같아, 처음에 중앙광장에 ai세종 추천 센터 -> 원에 올라가서 스면 저런 식으로 나올 수 있게 코딩해줘. 그러기 위해선 우선 세종 추천센터 위에있는 glb파일 공? 같은 거 없애줘야할 거 같아
```

## 작업 요약

첨부된 9단계 레퍼런스를 바탕으로 중앙광장 AI 플랫폼 원의 실제 GLB 경계를 진입 영역으로 사용했다. 원 위에 서면 `E` 키 안내가 나타나고, 분석 스캔·체험 데이터 카드·AI 프로필·도시 홀로그램·추천 경로·일정 확정으로 이어지는 단계형 연출이 자동 진행되도록 구현했다. 마지막 단계는 기존 중앙 일정 확정 화면으로 연결했다. 기존 플랫폼 위 구형 오브젝트인 `AI_Beam`, `AI_Globe*`, `AI_Orbit_Node_*`는 숨기고 플랫폼과 바닥 링은 유지했다.

## 변경 파일 목록

- `react-app/src/game/renderers/VillageMapRenderer.ts`: AI 플랫폼 진입 감지, `E` 상호작용 이벤트, 기존 구형 GLB 오브젝트 숨김
- `react-app/src/components/GovernmentAiRecommendationCenter.tsx`: 단계형 AI 분석·추천 체험 및 기존 일정 확정 화면 연결
- `react-app/src/components/GovernmentAiRecommendationCenter.css`: 스캔, 데이터 카드, 프로필, 도시·경로 홀로그램 연출
- `react-app/src/pages/GamePage.tsx`: 추천센터 컴포넌트 연결과 체험 중 이동 입력 잠금
- `react-app/index.html`: 운영 캐시 갱신용 빌드 ID 변경
- `src/app/page.home/view.pug`: iframe 빌드 쿼리 갱신
- `src/assets/jochwon-app/`: 최신 React 프로덕션 빌드 동기화 및 이전 해시 산출물 정리
- `devlog.md`
- `devlog/2026-08-05/006-central-plaza-ai-recommendation-center.md`

## 검증 결과

- `npm run build`: 성공
- WIZ 프로젝트 일반 빌드: 성공
- 생성된 GamePage 번들 2개 `node --check`: 성공
- React 빌드 결과와 WIZ 정적 자산 파일 목록 일치 확인
- 중앙광장 GLB 확인: 숨김 대상 `AI_Beam` 1개, `AI_Globe*` 9개, `AI_Orbit_Node_*` 7개 및 유지 대상 `AI_Platform_*` 6개 확인
- React 원본, WIZ 페이지, 배포 정적 자산의 빌드 ID 일치 확인

## 남은 리스크

- 자동 브라우저 캐릭터 조작 테스트는 수행하지 않아, 실제 화면에서 플랫폼 진입 반경과 단계별 카드 배치가 해상도별로 자연스러운지 최종 확인이 필요하다.
