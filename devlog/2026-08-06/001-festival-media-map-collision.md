# 축제 이미지·카카오 지도·오브젝트 충돌 보정

- **ID**: 001
- **날짜**: 2026-08-06
- **유형**: 버그 수정

## 작업 요약

축제 탐색관과 한눈에 보기의 대표 이미지를 WIZ 정적 자산 기준 경로로 해석하도록 수정했다. 한눈에 보기의 지도 탭에 축제명과 장소를 전달하는 카카오 지도 링크를 추가하고, 축제 선택 버튼을 좌측 정렬했다. 축제 GLB의 부스·무대·책상 및 주요 시설 루트 그룹을 명시적 충돌 영역으로 등록했다.

## 원문 요청사항

```text
축제부스 세종 축제 탐색관, 세종 축제 한 눈에 보기에서 세종 축제에 대한 이미지가 안 가져와졌는데 이 부분 수정해줘
세종 축제 한 눈에 보기에서 지도 -> 카카오 지도랑 연결해서 어딘지 볼 수 있게 해주고, 축제 버튼이 중앙 정렬되어있는데 좌측 정렬로 해줘. 그리고 사물들을 통과하는데 glb파일에 책상이나 부스 등 통과하지 않게 해주면 좋을 거 같아
```

## 변경 파일 목록

- `react-app/src/data/festivalMedia.ts`: 축제 이미지 배포 경로 및 카카오 지도 검색 URL 헬퍼 추가
- `react-app/src/components/LakeParkExperiences.tsx`: 탐색관·한눈에 보기 이미지 경로 보정과 지도 링크 추가
- `react-app/src/components/LakeParkExperiences.css`: 축제 버튼 좌측 정렬 및 카카오 지도 링크 스타일 추가
- `react-app/src/game/renderers/VillageMapRenderer.ts`: 축제 GLB 주요 오브젝트 충돌 그룹 등록
- `react-app/scripts/festivalExperience.test.ts`, `react-app/package.json`: 축제 경험 회귀 테스트 추가
- `react-app/src/runtimeBuild.ts`, `src/app/page.home/view.pug`: 런타임 빌드 식별자 갱신
- `src/assets/jochwon-app/`: 최신 React 빌드 산출물 동기화
- `devlog.md`, `devlog/2026-08-06/001-festival-media-map-collision.md`: 작업 이력 기록

## 확인 결과

- `npm run test:festival-experience`: 3건 통과
- 축제·포탈·월드 이동 회귀 테스트: 21건 통과
- `npm run build`: TypeScript, Vite, 성능 예산, 서버 TypeScript 빌드 통과
- WIZ `main` 프로젝트 일반 빌드(`clean: false`) 통과
- React `dist`와 `src/assets/jochwon-app` 비교 결과 일치
- 운영 정적 자산에서 런타임 ID, 카카오 지도 URL, 충돌 그룹, 좌측 정렬 CSS 확인
- 운영 축제 이미지 경로가 HTTP 200 및 `image/jpeg`로 응답함을 확인
