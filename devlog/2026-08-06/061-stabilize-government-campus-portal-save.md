# 정부청사 공동캠퍼스 포탈 저장 후 원점 복귀 방지

- **ID**: 061
- **날짜**: 2026-08-06
- **유형**: 버그 수정·포탈 동기화
- **리뷰 ID**: khwyevuwaeaihviidqipjenctpdcbbsq

## 작업 요약

정부청사에서 공동캠퍼스 포탈 좌표를 WIZ 공용 저장소에 저장한 뒤 별도 실시간 서버의 오래된 좌표나 저장과 겹쳐 시작된 이전 조회 응답이 다시 적용되어 원점으로 돌아가던 동기화 충돌을 제거했다. 포탈 좌표의 최종 기준을 WIZ 공용 저장소 하나로 통일하고, 저장 중에는 주기 조회를 보류하며 저장 시작 전 응답은 세대 번호로 무시하도록 했다. 저장 성공 좌표는 기존 목록에 없더라도 추가해 즉시 유지한다.

## 원문 요청사항

```text
공동캠퍼스 포탈 위치 옮길라했는데 원점으로 돌아가는 현상이 있음 이 부분 수정해줘
```

## 변경 파일 목록

- `react-app/src/game/GameCanvas.tsx`
  - Socket.IO 포탈 좌표 수신·이중 저장을 제거하고 WIZ 공용 저장소만 좌표 기준으로 사용했다.
  - 저장 진행 개수와 동기화 세대 번호를 추가해 저장 중 조회 및 저장 이전의 지연 응답을 차단했다.
  - 저장 성공 좌표를 현재 좌표 목록에 삽입 또는 교체하도록 보강했다.
- `react-app/scripts/governmentMap.test.ts`
  - 저장 중 오래된 좌표 응답 차단, WIZ 단일 소스 적용, 저장 좌표 upsert를 회귀 테스트에 추가했다.
- `react-app/src/runtimeBuild.ts`, `src/app/page.home/view.pug`, `src/assets/jochwon-app/`
  - 런타임 빌드 ID를 `20260806-stable-government-campus-portal-v159`로 갱신하고 WIZ 정적 자산을 동기화했다.
- `devlog.md`, `devlog/2026-08-06/061-stabilize-government-campus-portal-save.md`
  - 이번 변경과 검증 결과를 기록했다.

## 확인 결과

- 정부청사·공동캠퍼스·월드 이동·런타임 엔트리 회귀 테스트 26건 통과
- `npm run build` 성공: 클라이언트 TypeScript, Vite 프로덕션 번들, 성능 예산, 서버 TypeScript 통과
- 성능 예산 통과: 초기 엔트리 246 KiB, 최대 JS gzip 324 KiB, 최대 3D 자산 21.64 MiB
- React `dist`와 WIZ `src/assets/jochwon-app` 144개 파일 일치 확인
- WIZ 일반 빌드(`clean: false`) 성공
- 운영 정적 인덱스에 빌드 ID `v159` 반영 및 신규 엔트리 자산 HTTP 200 확인
- `git diff --check` 통과

## 남은 리스크

- 요청자 로그인 세션으로 포탈을 실제 이동한 뒤 새 브라우저에서 같은 좌표가 복원되는 수동 종단 간 검증은 수행하지 않았다.
- 다른 사용자의 포탈 이동은 실시간 Socket 이벤트 대신 최대 2.5초 주기의 WIZ 조회로 반영된다.
