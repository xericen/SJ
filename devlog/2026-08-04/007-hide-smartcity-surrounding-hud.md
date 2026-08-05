# 미래 세종 체험 중 주변 HUD 및 반응 UI 숨김

- **ID**: 007
- **날짜**: 2026-08-04
- **유형**: UX 수정
- **리뷰 ID**: ridytcoiyougrnuuwqzebvhpwvhueuoa

## 작업 요약

미래 세종관에서 E키로 홀로그램 체험을 시작하면 월드의 현재 위치, 주변 반응, 접속자, 채팅 및 각종 주변 상호작용 안내를 숨기도록 변경했다.
체험 중에는 3D 월드와 스마트시티 홀로그램 기술 선택 UI만 유지하며 ESC로 종료하면 기존 HUD가 다시 표시된다.

## 원문 요청사항

```text
e 눌렀을 떄, 주변에 있는 현재 위치나 주변의 반응 이런 것들은 안 보이게 해줘
```

## 변경 파일 목록

- `react-app/src/pages/GamePage.tsx`: 스마트시티 체험 활성 이벤트를 구독하고 화면 상태 클래스 연결
- `react-app/src/pages/GamePage.css`: 체험 중 월드 HUD·주변 반응 UI를 숨기는 포커스 모드 스타일 추가
- `react-app/index.html`, `src/app/page.home/view.pug`: 새 번들 캐시 식별자 적용
- `src/assets/jochwon-app/`: 새 React 프로덕션 번들 동기화
- `devlog.md`, `devlog/2026-08-04/007-hide-smartcity-surrounding-hud.md`: 작업 이력 기록

## 확인 결과

- React TypeScript·Vite·Express 전체 빌드 성공
- React `dist`와 WIZ 정적 자산 일치 확인
- WIZ 일반 빌드 성공
- `git diff --check` 통과

## 남은 리스크

- 실제 브라우저에서 E 진입·ESC 종료 시 HUD가 즉시 사라지고 복원되는지 최종 시각 확인이 필요하다.
