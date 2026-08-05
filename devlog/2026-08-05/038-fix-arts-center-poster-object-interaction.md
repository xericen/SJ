# 예술의전당 공식 포스터 이미지 및 오브젝트 인터랙션 개선

- **ID**: 038
- **날짜**: 2026-08-05
- **유형**: UX 및 버그 수정
- **리뷰 ID**: ucpgkvwdbljhhijvtebeixepohjidmjy

## 작업 요약

세종예술의전당 공연 포스터 이미지 URL이 Vite 운영 기준 경로(`/auth/jochwon-assets/`)를 따르도록 수정하고 포스터 리비전을 갱신했다. 공연 포스터를 클릭했을 때 3D 오브젝트 위에 별도 DOM 포스터와 외부 페이지 iframe을 덮던 흐름을 제거하고, 카메라가 확대된 실제 3D 포스터 오브젝트를 유지한 채 화면 하단의 `오브젝트 인터랙션` 조작부에서 영상 보기, 관심 저장, 공식 정보 열기를 선택하도록 변경했다. 공식 정보는 내부 웹 화면 대신 명시적인 버튼을 눌렀을 때 새 탭에서만 열린다.

## 원문 요청사항

```text
에술의 전당 공연 클릭했을 때, 사진을 못 가져와서 그런지 안 보여, 이 부분 해결해줘, 그리고 클릭했을 때,"오브젝트 인터랙션" 잘 나오게 수정해줘. 현재 클릭하면 웹 화면이 뜸 이거 너무 부자연스러움
```

## 변경 파일 목록

- `react-app/src/game/artsCenterPerformances.ts`: 공식 포스터 URL을 Vite 배포 기준 경로로 생성하고 이미지 캐시 리비전 갱신
- `react-app/src/game/renderers/VillageMapRenderer.ts`: 공식 이미지 비동기 디코딩 및 실패 진단을 추가하고 3D 포스터 표면을 포커스 화면으로 유지
- `react-app/src/components/ArtsCenterPosterKiosk.tsx`: DOM 포스터·상세 페이지·iframe 제거, 오브젝트 전용 조작부로 변경
- `react-app/src/components/ArtsCenterPosterKiosk.css`: 3D 장면을 가리지 않는 반응형 하단 인터랙션 패널 스타일 적용
- `react-app/scripts/artsCenterPoster.test.ts`: 5개 포스터 파일·배포 경로와 iframe 제거 회귀 테스트 추가
- `react-app/index.html`, `src/app/page.home/view.pug`: 운영 캐시 식별자를 v58로 갱신
- `src/assets/jochwon-app/index.html`, `src/assets/jochwon-app/assets/GamePage-BK8Wa0ar.js`, `src/assets/jochwon-app/assets/GamePage-Bw9kncM8.js`, `src/assets/jochwon-app/assets/GamePage-HnzSrnHZ.css`: 새 운영 번들과 인터랙션 UI 반영
- `devlog.md`, `devlog/2026-08-05/038-fix-arts-center-poster-object-interaction.md`: 작업 이력 기록

## 검증 결과

- `npx tsx --test scripts/artsCenterPoster.test.ts scripts/artsCenterJump.test.ts` 성공: 공식 포스터·오브젝트 인터랙션 및 기존 점프/5개 공연 영상 연결 총 6개 통과
- `npm run build` 성공: 클라이언트 TypeScript, Vite 프로덕션 빌드, 성능 예산 검사, 서버 TypeScript 통과
- WIZ 프로젝트 일반 빌드(`clean: false`) 성공
- `react-app/dist/index.html`과 WIZ 정적 산출물의 엔트리 일치, 공식 포스터 5개 원본과 배포 파일 일치 확인
- 운영 v58 HTML과 인터랙션·렌더러 청크가 HTTP 200으로 응답하고 `오브젝트 인터랙션`, `/auth/jochwon-assets/`, 포스터 리비전 `20260805-3`이 반영된 것을 확인
- 운영 공식 포스터 이미지 5개가 모두 HTTP 200으로 응답하는 것을 확인
- 대상 파일 `git diff --check` 통과

## 남은 리스크

- 실제 캐릭터로 포스터를 클릭한 뒤 카메라 확대, 조작부 배치, 영상 선택까지 이어지는 브라우저 화면 단위 E2E는 현재 환경에서 자동화하지 못했다. 소스 회귀 테스트, 프로덕션 빌드, 운영 정적 자산과 이미지 응답으로 배포 경로와 UI 전환을 검증했다.
