# 주변 반응 패널 및 선택형 주변 메시지 입력창 제거

- **ID**: 064
- **날짜**: 2026-08-06
- **유형**: UX·채팅 UI
- **리뷰 ID**: sdpnckxiwdllqofimnhuovxfuiofjomy

## 작업 요약

게임 화면에 상시 표시되던 `주변의 반응` 패널과 `선택형 주변 메시지` 입력창을 제거했다. 친구와의 1:1 채팅 및 NPC 대화 화면은 그대로 유지했다.

## 원문 요청사항

```text
이거 지금 옆에 있는 주변의 반응이랑 선택형 주변 메세지 이 창 다 지워버려줘 이거 어차피 1대1 채팅하면 필요없을거같아
```

## 변경 파일 목록

- `react-app/src/pages/GamePage.tsx`
  - 주변 반응 목록과 주변 메시지 작성 UI 및 전용 상태·전송 동작을 제거했다.
  - 기존 1:1 채팅과 NPC 대화 UI는 유지했다.
- `react-app/src/pages/GamePage.css`
  - 제거한 두 UI의 데스크톱·모바일·지도 화면 스타일을 정리했다.
- `react-app/scripts/socialProfileActions.test.ts`
  - 두 주변 채팅 UI가 렌더링되지 않고 1:1·NPC 대화 UI가 유지되는 회귀 검사를 추가했다.
- `react-app/src/runtimeBuild.ts`, `react-app/dist/`, `src/assets/jochwon-app/`
  - 런타임 빌드 ID를 `20260806-remove-nearby-chat-v161`로 갱신하고 배포 번들을 동기화했다.
- `devlog.md`, `devlog/2026-08-06/064-remove-nearby-chat-ui.md`
  - 이번 변경과 검증 결과를 기록했다.

## 확인 결과

- 소셜 프로필·채팅 UI 회귀 테스트 4건 통과
- 클라이언트·서버 TypeScript 검사 및 Vite 프로덕션 빌드 통과
- 프런트 성능 예산 검사 통과
- `react-app/dist`와 WIZ 배포 자산의 동일성 확인
- WIZ 프로젝트 일반 빌드 통과

## 남은 리스크

- 실제 다중 사용자 접속 환경에서 1:1 채팅을 시작하는 전체 흐름은 브라우저 실기 검증이 필요하다.
