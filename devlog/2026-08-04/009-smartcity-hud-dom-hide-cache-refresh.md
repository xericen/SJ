# 스마트시티 체험 HUD DOM 직접 숨김 및 캐시 갱신 보강

- **ID**: 009
- **날짜**: 2026-08-04
- **유형**: 버그 수정
- **리뷰 ID**: ridytcoiyougrnuuwqzebvhpwvhueuoa

## 원문 요청사항

```text
e 체험 눌러도 계속 보인다니까 스마트시티 잘 해준 거 맞는지 다시 한 번 확인해줘.
```

## 작업 요약

첨부 화면이 이전 5개 기술 UI 번들을 계속 사용하고 있음을 확인했다. 스마트시티 체험 열림 상태에서 CSS 선택자뿐 아니라 React가 현재 위치, 활동 인원, 주변 반응, 채팅, 포탈 편집 등 월드 HUD DOM을 직접 `hidden` 처리하도록 보강했다. 체험 중 새로 추가되는 HUD도 MutationObserver로 즉시 숨기고, 종료 시 기존 표시 상태를 복원한다. 빌드 ID를 v4로 변경해 이전 번들 캐시를 갱신했다.

## 변경 파일 목록

- `react-app/src/pages/GamePage.tsx`: 체험 중 월드 HUD DOM 직접 숨김·복원 및 동적 HUD 감시 추가
- `react-app/index.html`: 캐시 갱신용 빌드 ID v4 적용
- `src/app/page.home/view.pug`: iframe 빌드 쿼리 v4 적용
- `src/assets/jochwon-app/`: 최신 React 빌드 결과 동기화
- `devlog.md`
- `devlog/2026-08-04/009-smartcity-hud-dom-hide-cache-refresh.md`

## 검증 결과

- `npm run build`: 성공
- React 배포 자산과 WIZ 정적 자산 비교: 차이 없음
- WIZ 프로젝트 빌드: 성공
- 배포 URL: HTTP 200, 빌드 ID `20260804-sejong-services-focus-v4` 확인
- 배포 번들: 6종 서비스 문구와 DOM 직접 숨김 로직 포함 확인

## 남은 리스크

- 이미 열린 브라우저 탭은 새 빌드 ID가 반영되도록 한 번 새로고침해야 할 수 있다.
- 실제 인증 세션의 1947×900 화면에서 E 진입 후 최종 시각 확인이 필요하다.
