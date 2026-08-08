# 축제 부스 완료 활동 즉시 저장 보강

- 원본 요청: 축제 체험 후 세종호수공원으로 돌아왔을 때 최근활동에 `축제 부스 완료`가 표시되도록 한다.
- 원인: 축제 완료 signal이 맵 세션 flush에만 의존해 복귀 전 즉시 activity history에 기록되지 않을 수 있었다.
- 변경: `festival-booth-complete`를 `recordExperienceAction`에서 즉시 harness 저장하도록 연결하고, 표시 제목을 항상 `축제 부스 체험 완료`로 통일했다. 기존 관심 저장 기록은 완료 기록 생성 시 제거한다.
- 확인: React production build 및 WIZ `main` build 성공. 최신 운영 정적 자산에 반영했다.
- 남은 리스크: 실제 체험용 브라우저에서 축제 부스 완료 후 호수공원 복귀하는 최종 수동 확인은 필요하다.
