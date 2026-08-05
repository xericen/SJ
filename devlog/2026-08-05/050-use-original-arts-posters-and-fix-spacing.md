# 예술의전당 원본 포스터 이미지 및 하단 정보 간격 개선

- **ID**: 050
- **날짜**: 2026-08-05
- **유형**: UX 수정
- **리뷰 ID**: ucpgkvwdbljhhijvtebeixepohjidmjy

## 작업 요약

클릭 포스터 상단의 `오브젝트 인터랙션` 배지를 제거했다. 세종예술의전당 공식 상세 페이지에 등록된 5개 대표 이미지 경로를 확인하고, 프로젝트에 보관된 이미지가 공식 원본과 SHA-256까지 동일함을 검증한 뒤 해당 로컬 원본을 3D 포스터 캔버스 상단에 적용했다. 클릭 후 HTML 포스터는 같은 캔버스 스냅샷을 계속 사용하므로 클릭 전후 원본 이미지와 전체 디자인이 동일하다. 하단 장소 기준선을 위로 이동해 `장소`와 `영상 선택` 사이에 38px 간격을 확보하고 가려짐을 제거했다.

## 원문 요청사항

```text
상단에 있는 오브젝트 인터렉션 없애고, 이미지를 그 실제 원본 페이지에 있는 이미지 사용해줬으면 좋겠어. 그리고 스크룰해서 장소랑 영상 선택 너무 붙어있으니까 이 부분 가려진다 해결해줘
```

## 변경 파일 목록

- `react-app/src/game/artsCenterPerformances.ts`: 5개 공식 대표 이미지 출처 기록, 배포용 로컬 원본 이미지 URL 생성 복구
- `react-app/src/game/renderers/VillageMapRenderer.ts`: 공식 원본 이미지를 포스터 캔버스에 적용하고 장소/버튼 간격 보정, 포커스 중 이미지 완료 시 HTML 스냅샷 갱신
- `react-app/src/components/ArtsCenterPosterKiosk.tsx`, `react-app/src/components/ArtsCenterPosterKiosk.css`: 상단 `오브젝트 인터랙션` 배지 제거
- `react-app/scripts/artsCenterPoster.test.ts`: 공식 원본 경로·로컬 파일·동일 스냅샷·하단 간격 회귀 테스트 추가
- `react-app/index.html`, `src/app/page.home/view.pug`: 운영 캐시 식별자를 v64로 통일
- `src/assets/jochwon-app/index.html`, `src/assets/jochwon-app/assets/GamePage-MC5te0MF.js`, `src/assets/jochwon-app/assets/GamePage-c7ELU3Zs.js`, `src/assets/jochwon-app/assets/GamePage-Cg25Xf8L.css`: 새 운영 포스터 번들 반영
- `devlog.md`, `devlog/2026-08-05/050-use-original-arts-posters-and-fix-spacing.md`: 작업 이력 기록

## 검증 결과

- 세종예술의전당 공식 상세 페이지 5개에서 대표 이미지 저장 경로를 확인하고 로컬 이미지 5개와 공식 원본의 SHA-256이 각각 일치함을 확인
- `npx tsx --test scripts/artsCenterPoster.test.ts scripts/artsCenterJump.test.ts scripts/cameraFollow.test.ts scripts/lakePortals.test.ts scripts/foodExperience.test.ts` 성공: 최신 포스터·점프·카메라·포탈·먹거리 회귀 테스트 총 23개 통과
- `npm run build` 성공: 클라이언트 TypeScript, Vite 프로덕션 빌드, 성능 예산 검사, 서버 TypeScript 통과
- WIZ 프로젝트 일반 빌드(`clean: false`) 성공
- `react-app/dist/index.html`과 WIZ 정적 산출물의 엔트리 일치, v64 캐시 식별자 통일 확인
- 운영 v64 HTML 및 GamePage 청크에서 원본 이미지 리비전, 공용 `posterDataUrl`, HTML 포스터와 두 버튼 반영 확인
- 운영 원본 포스터 이미지 5개가 모두 HTTP 200으로 응답하는 것을 확인
- 상단 배지 클래스 제거 및 대상 파일 `git diff --check` 통과

## 남은 리스크

- 공식 포스터는 세로형 원본을 가로형 상단 이미지 영역에 중앙 크롭해 표시한다. 실제 브라우저에서 공연별 주요 피사체의 크롭 결과와 작은 화면의 체감 간격은 자동 화면 비교를 수행하지 못해 최종 육안 확인이 필요하다.
