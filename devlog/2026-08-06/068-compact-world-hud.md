# 월드 HUD 핵심 정보 중심 간소화

- **ID**: 068
- **날짜**: 2026-08-06
- **유형**: UX·월드 HUD
- **리뷰 ID**: sdpnckxiwdllqofimnhuovxfuiofjomy

## 작업 요약

맵을 가리던 호수공원 취향 여정과 부가 안내를 제거하고 좌측 HUD를 `현재 위치`, `현재 활동 중`, `내 친구` 중심으로 축소했다. 세 영역의 폭·높이·간격을 줄이고 친구가 없어도 내 친구 버튼은 항상 표시되도록 변경했다.

## 원문 요청사항

```text
현재 활동 중이랑 내친구 기능 그리고 현재 위치만 남기고 호수공원 취향 여행 이런건 없애줘 최대한 간결하게 창 맞춰줘 지금 이거때문에 맵이 잘 안보인다
```

## 변경 파일 목록

- `react-app/src/pages/GamePage.tsx`
  - 현재 위치의 취향 배지와 활동 목록 하단의 연결·조작 안내를 제거했다.
  - 내 친구 버튼을 친구 수와 활동 목록 접힘 여부에 관계없이 항상 표시하도록 변경했다.
- `react-app/src/pages/GamePage.css`
  - 현재 위치·활동 목록·친구 목록의 폭, 높이, 간격과 모바일 배치를 축소했다.
- `react-app/src/components/LakeParkExperiences.tsx`
  - 호수공원 취향 여정 패널과 자동 취향 결과창·안내 알림을 제거했다.
- `react-app/src/components/LakeParkExperiences.css`
  - 제거된 취향 여정 및 결과창의 전용 스타일을 정리했다.
- `react-app/scripts/socialProfileActions.test.ts`
  - 핵심 HUD 유지 및 부가 HUD 제거 회귀 검사를 추가했다.
- `react-app/src/runtimeBuild.ts`, `react-app/dist/`, `src/assets/jochwon-app/`
  - 런타임 빌드 ID를 `20260806-compact-world-hud-v165`로 갱신하고 배포 번들을 동기화했다.
- `devlog.md`, `devlog/2026-08-06/068-compact-world-hud.md`
  - 이번 변경과 검증 결과를 기록했다.

## 확인 결과

- 소셜·HUD 회귀 테스트 5건 통과
- 클라이언트·서버 TypeScript 검사 및 Vite 프로덕션 빌드 통과
- 프런트 성능 예산 검사 통과
- `react-app/dist`와 WIZ 배포 자산의 동일성 확인
- WIZ 프로젝트 일반 빌드 통과

## 남은 리스크

- 실제 접속 인원이 많아 활동 목록이 길어질 때의 지도 가시성은 브라우저 실기 확인이 필요하다.
