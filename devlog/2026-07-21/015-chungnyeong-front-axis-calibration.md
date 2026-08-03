# 충녕이 정면축 런타임 캘리브레이션

- **ID**: 015
- **날짜**: 2026-07-21
- **유형**: 버그 수정
- **리뷰 ID**: ygjqjzmseqjdkybmutvrynitcmamgihk

## 작업 요약

개발 모드 지도에 충녕이 정면축을 실제 렌더링 화면에서 비교할 수 있는 F1~F4 캘리브레이션을 추가했다. 선택 각도는 AnimationMixer·DirectionRoot·PoseRoot를 건드리지 않고 ModelRoot에만 즉시 적용하며 좌측 상단 Debug Overlay와 콘솔 진단에 표시한다.

## 원문 요청사항

```text
이 로그를 보면 오히려 원인을 찾았어.
가장 중요한 부분이 이거야.
frontRotationY: 0rad (0°)
그리고
GUI 브라우저 자동화 도구가 없어 실제 지도에서의 8방향 육안 확인은 수행하지 못했습니다.
즉, Codex는 실제 화면을 못 보고 추측으로 0°를 적용한 거야.
그런데 네가 올린 스크린샷에서는 Idle에서도 뒤통수가 보이고 있어.
그래서 frontRotationY = 0은 틀린 값이라고 확정할 수 있어.
내가 보기엔 지금 해야 하는 것은 "코드 수정"이 아니라 "정면축 캘리브레이션"이다.
Codex가 또 추측해서 90도, 180도 바꾸는 게 아니라 실제로 어느 각도가 정면인지 찾게 해야 한다.
Codex에 보내는 명령어
현재 적용된 frontRotationY = 0rad가 잘못되었습니다.

실제 브라우저 화면에서는 Idle 상태에서도 충녕이가 뒤통수를 보고 있습니다.

추측으로 값을 변경하지 말고 실제 렌더링 결과를 기준으로 frontRotationY를 캘리브레이션하도록 수정해 주세요.

요구사항

1. 개발 모드에서 아래 단축키를 추가합니다.

F1 → frontRotationY = 0°
F2 → frontRotationY = 90°
F3 → frontRotationY = 180°
F4 → frontRotationY = -90°

2. 키를 누를 때마다 즉시 화면에 적용합니다.

3. 현재 적용된 값을 화면 좌측 상단 Debug Overlay에 출력합니다.

예)

frontRotationY : 180°
DirectionYaw : 35°
Pitch : 4°

4. AnimationMixer는 그대로 유지합니다.

5. DirectionRoot와 PoseRoot는 변경하지 않습니다.

6. ModelRoot.rotation.y만 변경합니다.

7. 정면이 확인되면 avatar-assets.config.ts에 그 값을 기본값으로 저장합니다.

주의

현재 frontRotationY=0은 실제 화면과 일치하지 않습니다.

Idle 상태에서 얼굴이 정면을 보는 값을 최종값으로 사용합니다.

추측으로 Math.PI를 넣지 말고 실제 브라우저에서 확인 후 결정합니다.
내 예상
네 모델을 보면 가능성이 높은 순서는
180° (Math.PI) ⭐⭐⭐⭐⭐
-90°
90°
0° (현재, 틀린 상태)
즉 180°일 확률이 가장 높아.
그런데 한 가지 더 의심되는 점
만약 180°를 적용해도 계속 뒤통수가 보인다면,
그건 frontRotationY 문제가 아니라 애니메이션의 Root.quaternion이 ModelRoot까지 덮어쓰고 있는 것이야.
그 경우에는 회전값을 아무리 바꿔도 애니메이션 시작과 동시에 다시 뒤를 보게 된다.
그래서 먼저 F1~F4처럼 즉시 각도를 바꿔보는 기능을 만들어 실제 정면축을 찾는 게 가장 빠른 해결 방법이야.
```

## 변경 파일 목록

- `src/app/page.home/character-manager.ts`: ModelRoot 전용 `setFrontRotationY()` 추가
- `src/app/page.home/skeletal-avatar-renderer.ts`: F1~F4 정면축 캘리브레이션, 좌측 상단 개발 오버레이, 진단 로그 추가
- `tools/avatar-customization.test.ts`: Mixer/DirectionRoot/PoseRoot 불변 및 ModelRoot 단독 회전 테스트
- `src/assets/avatar/README.md`: 개발 모드 캘리브레이션 사용법 추가
- `devlog.md`
- `devlog/2026-07-21/015-chungnyeong-front-axis-calibration.md`

## 확인 및 검증 결과

- F1=0°, F2=90°, F3=180°, F4=-90° 매핑 번들 반영 확인
- 캘리브레이션 시 ModelRoot quaternion과 메타데이터만 변경됨
- AnimationMixer 인스턴스와 현재 AnimationClip 유지 확인
- DirectionRoot/PoseRoot quaternion 불변 확인
- 개발 오버레이에 frontRotationY, DirectionYaw, Pitch, Motion, Clip 표시
- WIZ 일반 빌드 성공
- CharacterManager 및 아바타 자동 테스트 성공
- 로컬/공개 `/home` HTTP 200
- `git diff --check` 성공

## 남은 리스크

- 첨부 화면으로 0°가 오답인 것은 확인했지만 90°/180°/-90° 중 정면값은 실제 브라우저에서 F2~F4를 눌러 육안 확정해야 한다.
- 확정 전까지 `avatar-assets.config.ts` 기본값은 의도적으로 변경하지 않았다.
