# 충녕이 frontRotationY 180도 기본값 확정

- **ID**: 016
- **날짜**: 2026-07-21
- **유형**: 설정 변경
- **리뷰 ID**: ygjqjzmseqjdkybmutvrynitcmamgihk

## 작업 요약

실제 GPU 브라우저 캘리브레이션에서 확인된 F3 값을 충녕이의 기본 정면축으로 확정했다. 일반 환경에서는 Debug Overlay가 생성되지 않도록 개발 컨텍스트 판정을 강화했으며 기존 F1~F4 캘리브레이션과 DirectionRoot/PoseRoot 설정은 유지했다.

## 원문 요청사항

```text
실제 GPU 브라우저에서 정면축 캘리브레이션을 확인했습니다.

F3, frontRotationY = 180°에서 충녕이 얼굴이 정상적으로 정면을 봅니다.

avatar-assets.config.ts의 충녕이 기본 frontRotationY를 Math.PI로 확정해 주세요.

개발용 F1~F4 캘리브레이션 기능은 유지하되,
일반 사용 환경에서는 Debug Overlay를 숨겨 주세요.

Idle, Walk, Run과 8방향 이동 모두 이 기본값을 기준으로 사용하고,
DirectionRoot와 PoseRoot 설정은 변경하지 마세요.

변경 후 빌드 및 테스트 결과를 보고해 주세요.
```

## 변경 파일 목록

- `src/app/page.home/avatar-assets.config.ts`: 충녕이 `frontRotationY` 기본값을 `Math.PI`로 확정
- `src/app/page.home/skeletal-avatar-renderer.ts`: Debug Overlay와 토글을 개발 컨텍스트로 제한
- `tools/avatar-customization.test.ts`: 180° 기본값 및 일반 환경 디버그 차단 회귀 검증
- `src/assets/avatar/README.md`: GPU 캘리브레이션 확정값과 일반 환경 오버레이 숨김 문서화
- `devlog.md`
- `devlog/2026-07-21/016-chungnyeong-front-rotation-final.md`

## 확인 및 검증 결과

- 충녕이 기본 `frontRotationY === Math.PI` 자동 테스트 통과
- 비버 기본 `frontRotationY === 0` 유지
- Idle/Walk/Run이 공통 모델 설정의 180° ModelRoot 기준을 사용
- 기존 8방향 yaw, DirectionRoot, PoseRoot 설정 무변경
- F1~F4 캘리브레이션 기능 유지
- 일반 환경에서는 query/devmode cookie가 없으면 Debug Overlay 비활성
- WIZ 일반 빌드 성공
- CharacterManager 및 아바타 자동 테스트 성공
- 로컬/공개 `/home` HTTP 200
- `git diff --check` 성공

## 남은 리스크

- 없음. 최종 정면축은 사용자 GPU 브라우저 확인값을 기준으로 확정했다.
