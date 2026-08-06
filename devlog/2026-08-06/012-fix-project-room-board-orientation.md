# 프로젝트실 전광판 방향 보정

- **ID**: 012
- **날짜**: 2026-08-06
- **유형**: 버그 수정
- **리뷰 ID**: ilrnchtknmubtfcrpbjrrzslthqehvbf

## 작업 요약

왼쪽 벽의 깊이축을 따라 배치되어 카메라에서 눕거나 옆면처럼 보이던 프로젝트실 전광판을 정면 방향으로 90도 회전했다. 프레임, 화면 표면, 기존 표시 요소를 하나의 피벗으로 묶어 함께 회전하므로 HTML 전광판 투영과 근접 상호작용 기준도 변경된 표면을 그대로 따른다.

## 원문 요청사항

```text
이렇게 봤을 때 프로젝트 정광판이 누워있음 이 부분 수정
```

## 변경 파일 목록

- `react-app/src/game/renderers/VillageMapRenderer.ts`: 전광판 전체 파트를 공통 피벗으로 묶고 Y축 -90도 회전 적용
- `react-app/src/runtimeBuild.ts`: 운영 번들 캐시 식별자를 `20260806-project-board-upright-v108`로 갱신
- `src/app/page.home/view.pug`: iframe 진입 URL의 빌드 식별자 동기화
- `src/assets/jochwon-app/`: 최신 React 프로덕션 번들로 교체
- `devlog.md`, `devlog/2026-08-06/012-fix-project-room-board-orientation.md`: 작업 이력 기록

## 확인 결과

- React/Vite 클라이언트 및 Express 서버 TypeScript 전체 빌드 성공
- 성능 예산 검사 성공: 엔트리 287 KiB, 최대 gzip JavaScript 310 KiB, 최대 3D 자산 21.64 MiB
- 런타임 엔트리·캐시 식별자 회귀 테스트 2개 통과
- React `dist`와 WIZ 정적 자산 전체 내용 일치 확인
- 생성된 `GamePage` 운영 번들에서 전광판 피벗 코드 포함 확인
- WIZ 일반 빌드 성공

## 남은 리스크

- 실제 운영 브라우저의 카메라 시야와 주변 가구 간 간격은 배포 화면에서 최종 육안 확인이 필요하다.
