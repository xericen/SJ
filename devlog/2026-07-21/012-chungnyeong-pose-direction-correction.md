# 충녕이 자세·방향 처리 보정

- **ID**: 012
- **날짜**: 2026-07-21
- **유형**: 버그 수정

## 작업 요약

충녕이의 지도 이동 회전과 애니메이션 자세 보정을 서로 다른 Three.js 계층으로 분리했다. Walk/Run 자세 보정, 카메라 친화형 yaw 제한, clone 기반 root position 트랙 제거 및 개발용 진단 기능을 충녕이 설정에만 적용했다.

## 원문 요청사항

```text
현재 충녕이 걷기/달리기 애니메이션 적용 후 캐릭터가 과도하게 앞으로 숙여지고, 이동 방향에 따라 얼굴이 카메라에서 보이지 않는 문제가 있습니다.

기존 지도 UI, 이동 좌표, 이름표, 감정 아이콘, 채팅 기능은 변경하지 말고
충녕이의 자세 보정과 방향 처리만 수정해 주세요.

[현재 문제]

1. Walk 애니메이션에서 몸통과 머리가 지나치게 앞으로 기울어짐
2. 지도 위에서는 캐릭터 얼굴이 보이지 않고 뒤통수 또는 측면만 크게 보임
3. 모델의 기본 앞면 축, 애니메이션 루트 회전, 이동 방향 회전이 중복 적용된 가능성이 있음
4. 걷기 애니메이션의 root motion 또는 Hips 회전 때문에 전체 캐릭터가 숙여져 보일 수 있음

[1] 앞면 축과 회전 구조 정리

캐릭터의 회전은 아래처럼 분리하세요.

CharacterRoot
 ├─ DirectionRoot
 │   └─ AnimationRoot
 │       └─ GLB Model

역할:

- CharacterRoot: 지도 위치와 전체 스케일
- DirectionRoot: 이동 방향에 따른 Y축 회전만 담당
- AnimationRoot: 애니메이션 자세 보정용 회전만 담당
- GLB Model: AnimationMixer 적용 대상

이동 방향 회전과 애니메이션 자세 보정을 같은 Object3D에 동시에 적용하지 마세요.

충녕이 설정에 아래 값을 추가하세요.

{
  id: "chungnyeong",
  frontRotationY: 실제 정면 보정값,
  walkPitchCorrection: 보정값,
  runPitchCorrection: 보정값
}

우선 실제 모델 앞면이 카메라를 바라보도록
frontRotationY를 0, Math.PI, Math.PI / 2, -Math.PI / 2 중 실제 정면값으로 검증해 주세요.

정면 기준이 결정되면 모든 상태에서 동일한 기준을 사용하세요.

[2] 과도한 전방 기울기 보정

Walk와 Run 상태에서 AnimationRoot.rotation.x를 이용하여 상체 전체 기울기를 보정하세요.

예시:

idle:
  animationRoot.rotation.x = 0

walk:
  animationRoot.rotation.x = THREE.MathUtils.degToRad(-8 ~ -15)

run:
  animationRoot.rotation.x = THREE.MathUtils.degToRad(-5 ~ -12)

단, 실제 축 방향에 따라 부호가 반대일 수 있으므로 브라우저에서 확인 후
캐릭터가 더 숙여지지 않고 자연스럽게 세워지는 값으로 적용하세요.

보정값은 하드코딩하지 말고 캐릭터 메타데이터에 둡니다.

예:

poseCorrection: {
  idlePitchDeg: 0,
  walkPitchDeg: -12,
  runPitchDeg: -8
}

상태 전환 시 pitch 값도 0.15~0.25초 동안 보간하여
갑자기 꺾이지 않게 처리하세요.

[3] Root Motion 제거

Walk/Run AnimationClip 안에 Hips 또는 Root의 위치 이동 트랙이 있다면
지도 이동과 중복되지 않도록 root motion을 제거하거나 무시하세요.

로드 후 AnimationClip 트랙을 검사하세요.

다음과 같은 트랙을 로그에 출력합니다.

- Root.position
- Hips.position
- Armature.position
- Root.rotation
- Hips.rotation

전진 이동을 포함하는 position track은 제거한 복제 clip을 만들어 사용하세요.

예:

const filteredTracks = clip.tracks.filter(track => {
  const name = track.name.toLowerCase();

  const isRootPosition =
    name.includes("root.position") ||
    name.includes("hips.position") ||
    name.includes("armature.position");

  return !isRootPosition;
});

회전 트랙은 바로 제거하지 말고,
문제를 일으키는 Root 또는 Hips rotation만 별도 검증 후 제거하세요.

원본 AnimationClip을 직접 수정하지 말고 clone 기반으로 처리하세요.

[4] 얼굴이 보이도록 방향 처리 수정

현재 좌우/상하 이동 시 캐릭터가 실제 진행 방향을 보도록 하되,
지도 카메라 시점 때문에 얼굴이 완전히 사라지지 않도록 설정합니다.

요구사항:

- 방향 전환은 DirectionRoot.rotation.y만 변경
- 모델 자체 rotation.y는 frontRotationY 보정값만 유지
- AnimationRoot에는 Y축 회전을 적용하지 않음
- Walk/Run 상태 전환 시 모델의 Y축 회전을 초기화하지 않음
- 애니메이션 action 재생 시 root.rotation을 덮어쓰지 않도록 확인

지도 시점이 정면 캐릭터를 보여주는 UI라면,
완전한 360도 진행 방향 회전 대신 화면 친화적인 8방향 또는 좌우 미러 방식도 지원하세요.

우선 권장 방식:

- 오른쪽 이동: 정면에서 오른쪽으로 약 35~55도 회전
- 왼쪽 이동: 정면에서 왼쪽으로 약 35~55도 회전
- 위쪽 이동: 정면 기준 뒤쪽을 완전히 보이지 않도록 최대 70~100도 제한
- 아래쪽 이동: 정면 또는 약간 측면 유지

즉, 캐릭터가 이동 방향은 표현하지만 뒤통수만 계속 보이지 않도록
Y축 회전 범위를 제한합니다.

필요하다면 설정을 추가하세요.

{
  directionMode: "cameraFriendly",
  maxYawDeg: 80
}

[5] 애니메이션 상태별 자세

상태별 기본 보정값을 적용하세요.

idle:
- 얼굴이 카메라를 보게 유지
- animationRoot pitch = 0
- 전신이 수직으로 보임

walk:
- 현재 애니메이션의 전진 자세는 유지하되 과도한 숙임만 보정
- 얼굴과 눈이 화면에서 보여야 함
- 발이 바닥에서 뜨지 않게 기존 ground alignment 유지

run:
- walk보다 약간 더 역동적이어도 되지만 머리 전체가 가려지지 않게 보정
- 얼굴이 최소 측면 일부라도 보이도록 yaw 제한

[6] 카메라 및 캐릭터 위치

현재 지도 위 캐릭터 크기와 바닥 위치는 유지하되,
머리가 너무 아래쪽으로 눌려 보이면 카메라 target 또는 모델 세로 offset을 미세 조정하세요.

- 발 기준 y=0 유지
- 캐릭터 중심을 임의로 들어 올리지 않음
- 이름표와 감정 아이콘 위치 유지
- 머리 위 공간이 너무 좁으면 emotionOffsetY만 조정

[7] 디버그 기능

개발 모드에서 다음 값을 출력하거나 토글 가능하게 해 주세요.

- 현재 motion state
- DirectionRoot.rotation.y
- AnimationRoot.rotation.x
- frontRotationY
- 현재 AnimationClip 이름
- root motion track 제거 여부

개발용 단축키 또는 debug flag로
pitch 보정값을 ±1도씩 조정할 수 있으면 좋습니다.

[8] 완료 조건

브라우저에서 다음을 확인하세요.

1. Idle 상태에서 얼굴이 정면으로 보임
2. Walk 상태에서 몸이 지나치게 숙여지지 않음
3. Run 상태에서도 머리와 얼굴이 가려지지 않음
4. 좌우 이동 시 자연스럽게 진행 방향을 표현함
5. 위쪽 이동 시 뒤통수만 계속 보이지 않음
6. 아래쪽 이동 시 정면 또는 자연스러운 측면이 보임
7. 애니메이션 전환 시 회전값이 순간적으로 초기화되지 않음
8. root motion 때문에 캐릭터가 지도 좌표와 따로 밀려나지 않음
9. 발이 바닥에서 뜨지 않음
10. 콘솔 오류 없음

[9] 변경 범위

- 기존 지도와 UI는 변경하지 않습니다.
- 비버와 다른 캐릭터 설정은 깨지지 않게 유지합니다.
- 충녕이 전용 보정값은 캐릭터 설정에만 둡니다.
- 불필요한 전체 리팩토링은 금지합니다.

[10] 완료 후 보고

작업 완료 후 아래 내용을 알려주세요.

- 충녕이 실제 frontRotationY 값
- idle/walk/run pitch 보정값
- 제거한 root motion 트랙 목록
- yaw 제한값
- 수정한 파일 목록
- WIZ 빌드 및 테스트 결과
- 실제 브라우저 확인 결과
- 남아 있는 리스크
```

## 변경 파일 목록

- `src/app/page.home/avatar-assets.config.ts`: 충녕이 전용 자세·방향·root motion 메타데이터 추가
- `src/app/page.home/character-manager.ts`: CharacterRoot/DirectionRoot/AnimationRoot 계층, clone clip 필터, 트랙 진단 추가
- `src/app/page.home/skeletal-avatar-renderer.ts`: 카메라 친화 yaw, 0.2초 pitch 보간, 개발 진단/단축키 적용
- `tools/avatar-customization.test.ts`: 계층·메타데이터·root position 필터 회귀 테스트 추가
- `src/assets/avatar/README.md`: 충녕이 런타임 보정값과 계층 문서화
- `devlog.md`
- `devlog/2026-07-21/012-chungnyeong-pose-direction-correction.md`

## 검증 결과

- WIZ 일반 빌드 성공
- CharacterManager/이동/커스터마이징 자동 테스트 성공
- 충녕이 Idle/Walk/Run GLB generic 검증 성공
- 실제 트랙 검사: Walk/Run의 `Root.position`, `Root.quaternion`, `Root.scale` 확인
- 제거 트랙: `Walk:Root.position`, `Run:Root.position`; quaternion/scale 유지
- `git diff --check` 성공
- 로컬 및 공개 `/home` HTTP 200 확인

## 남은 리스크

- 실행 환경에 GUI 브라우저 자동화 도구가 없어 실제 GPU 브라우저에서의 육안 검수는 수행하지 못했다. 실제 브라우저에서 Walk `-12°`, Run `-8°` 보정값의 최종 미세 조정이 필요할 수 있다.
