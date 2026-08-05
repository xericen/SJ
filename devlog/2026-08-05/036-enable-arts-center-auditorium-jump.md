# 예술의전당 갈색 객석 단차 점프 이동 허용

- **ID**: 036
- **날짜**: 2026-08-05
- **유형**: 버그 수정
- **리뷰 ID**: ucpgkvwdbljhhijvtebeixepohjidmjy

## 작업 요약

예술의전당의 흰 로비 바닥과 갈색 객석 바닥 경계에서 지면 풋프린트 높이 편차가 약 `24.58`인데 일반 보행 허용치 `22`가 점프 중에도 고정 적용되어 이동이 취소되던 문제를 수정했다. 실제 점프 높이가 충돌 우회 기준을 넘은 동안에만 예술의전당의 단차 허용치를 최대 `36`까지 확장해 객석 바닥으로 넘어갈 수 있게 했다. 다른 맵, 일반 보행, 초기 스폰 판정은 기존 값을 유지하며 더 높은 무대는 계속 통과하지 못한다.

## 원문 요청사항

```text
5개 중에 내가 볼 것을 선택하고, 좌석으로 가서 영상을 보는데, 현재 갈색 그 위로 점프해서 넘어갈 수 있게 해줘. 앞으로 가지질 않아
```

## 변경 파일 목록

- `react-app/src/game/groundTraversal.ts`: 점프 높이에 따른 제한된 단차 허용치와 지면 풋프린트 일관성 판정을 순수 함수로 분리
- `react-app/src/game/renderers/VillageMapRenderer.ts`: 예술의전당에만 최대 `36`의 점프 단차 허용치를 적용하고, 점프 이동 시 동적 허용치를 지면 샘플과 풋프린트 검사에 연결
- `react-app/scripts/artsCenterJump.test.ts`: 일반 보행 차단, 점프 통과, 다른 맵·초기 스폰 격리, 기존 5개 공연·영상 연결을 검증하는 회귀 테스트 추가
- `react-app/index.html`, `src/app/page.home/view.pug`: 운영 캐시 식별자를 `20260805-arts-center-jump-v56`으로 갱신
- `src/assets/jochwon-app/`: v56 프로덕션 빌드를 정확히 동기화하고 이전 미참조 해시 산출물을 정리
- `devlog.md`, `devlog/2026-08-05/036-enable-arts-center-auditorium-jump.md`: 작업 이력 기록

## 검증 결과

- `npx tsx --test scripts/artsCenterJump.test.ts`: 4개 테스트 통과
- `npm run build`: React TypeScript, Vite 프로덕션 빌드, 성능 예산, 서버 TypeScript 통과
- `npm run test:lake-portals`: 기존 포탈 회귀 테스트 6개 통과
- `react-app/server`의 `npm test`: 43개 전체 통과
- 활성 엔트리와 UI·3D 엔진 청크의 `node --check` 통과
- `react-app/dist/`와 `src/assets/jochwon-app/`의 파일·내용 일치 확인
- 활성 엔진 청크에서 예술의전당 점프 상한 `36`, 동적 지면 허용치, 기존 포탈 좌표 고정 가드 확인
- 활성 UI 청크에서 예술의전당 포탈 위치 편집 제외 유지 확인
- WIZ 프로젝트 일반 빌드(`clean: false`) 성공
- 운영 HTML HTTP 200, v56 엔트리 연결, 운영 엔트리·UI·엔진 청크와 로컬 SHA-256 일치 확인

## 남은 리스크

- 현재 환경에는 실제 브라우저 WebGL 키보드 조작 러너가 없어 Space와 방향키를 직접 누르는 화면 단위 E2E는 자동화하지 못했다. 대신 실제 GLB 변환 높이로 경계 판정을 재현한 회귀 테스트와 운영 번들 일치 여부를 검증했다.
