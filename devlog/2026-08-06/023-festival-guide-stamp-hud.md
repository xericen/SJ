# 축제 체험 이미지·방문 가이드·스탬프 HUD 개편

- **ID**: 023
- **날짜**: 2026-08-06
- **유형**: 버그 수정

## 작업 요약

전통 탈·놀이, 공예, 한글 문화 체험 이미지가 WIZ 배포 경로에서 표시되도록 수정했다. 세종 축제 한눈에 보기를 축제 선택 레일과 상세 시간표·구역·교통 카드 중심으로 재설계하고, 주소만 검색하는 카카오 지도를 패널 내부 iframe으로 열도록 변경했다. 스탬프의 남은 미션과 완료 상태를 명확히 표시하고 축제 맵의 현재 위치·활동 인원을 중앙 요약 HUD로 합쳐 스탬프 가림을 해소했다.

## 원문 요청사항

```text
세종 축제 탐색관에서 체험 전통 탈-놀이 체험 등 3개 이미지가 안 보이는데 이 부분 수정해줘
세종 축제 한 눈에 보기 디자인 다른 걸로 수정해주라 뭔가 마음에 안 듦, 제 24회 세종 조치원 복숭아 축제 이 버튼 왼쪽 정렬로 해달라니까, 시간표나 지도 ,교통 자세히 작성해주고, 카카오 지도 위치보기 클리가면 맵 내의 html로 들어가게 해줘 새창을 열어서 지도 들어가는 게 아님 이것도 지도 동일하게 카카오 지도에 제목 + 주소 들어가서 주소 값이 안 보이는데, 주소만 입력되게 해줘. 축제 스탬프 3개 받기 미션 있었는데 미션 다 완료해도 된지 잘 모름, 그리고 스탬프 찍는 거가 현재 활동중에 가려져서 안 보이니까 현재 활동중이랑 현재 위치 중앙에 합쳐서 스템프 잘 보이게 변경해줘
```

## 변경 파일 목록

- `react-app/src/data/festivalMedia.ts`: 카카오 지도 검색어를 주소 전용으로 변경
- `react-app/src/components/LakeParkExperiences.tsx`: 체험 이미지 경로, 상세 방문 정보, 내부 지도, 스탬프 상태 개편
- `react-app/src/components/LakeParkExperiences.css`: 한눈에 보기 신규 디자인과 스탬프 HUD·내부 지도 스타일 적용
- `react-app/src/pages/GamePage.tsx`, `react-app/src/pages/GamePage.css`: 축제 맵 현재 위치·활동 인원 중앙 요약 HUD 적용
- `react-app/scripts/festivalExperience.test.ts`: 이미지·내부 지도·스탬프 HUD 회귀 테스트 보강
- `react-app/src/runtimeBuild.ts`, `src/app/page.home/view.pug`: 런타임 빌드 ID 갱신
- `src/assets/jochwon-app/`: 최신 React 빌드 산출물 동기화
- `devlog.md`, `devlog/2026-08-06/023-festival-guide-stamp-hud.md`: 작업 이력 기록

## 확인 결과

- 축제 경험 단위 테스트 5건 통과
- 축제·포탈·월드 이동·런타임 회귀 테스트 최종 30건 통과
- `npm run build`: TypeScript, Vite, 성능 예산, 서버 TypeScript 빌드 통과
- WIZ `main` 프로젝트 일반 빌드(`clean: false`) 통과
- React `dist`와 `src/assets/jochwon-app` 비교 결과 일치
- 운영 번들에서 내부 카카오 지도, 주소 전용 값, 스탬프 완료 문구, 중앙 HUD 확인
- 운영 체험 이미지 3개가 모두 HTTP 200 및 `image/jpeg`로 응답함을 확인
