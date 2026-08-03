# 충녕이 카메라 친화형 8방향 자세 보정

- **ID**: 013
- **날짜**: 2026-07-21
- **유형**: 버그 수정
- **리뷰 ID**: ygjqjzmseqjdkybmutvrynitcmamgihk

## 작업 요약

충녕이의 지도 위치·방향·자세·모델 앞면 보정을 각각 독립된 Three.js 계층으로 분리했다. 8방향 camera-friendly yaw, 마지막 수평 방향을 반영한 위 이동, quaternion 기반 yaw/pitch 보간, clone AnimationClip의 root position 제거와 개발 진단 로그를 적용했다.

## 원문 요청사항

```text
현재 충녕이의 Idle/Walk/Run 애니메이션은 재생되지만 방향별 자세가 부자연스럽습니다.

현재 확인된 문제:

1. 위쪽 이동 시 캐릭터가 180도 회전하여 뒤통수만 보입니다.
2. 좌우 및 대각선 이동에서도 얼굴이 거의 보이지 않는 경우가 있습니다.
3. Run 상태의 몸 기울기가 진행 방향 기준이 아니라 월드 축 기준으로 적용되어,
   방향에 따라 앞으로가 아닌 뒤쪽 또는 옆쪽으로 기울어집니다.
4. 일부 방향에서는 달리는데 상체가 뒤로 젖혀져 보입니다.

이 지도는 현실적인 360도 방향 표현보다 캐릭터 얼굴이 잘 보이는
2.5D camera-friendly 캐릭터 표현이 중요합니다.

기존 지도, 이동 좌표, UI, 이름표, 감정 아이콘은 변경하지 말고
캐릭터의 방향과 자세 보정만 수정해 주세요.

[1] 캐릭터 계층 구조 분리

아래 계층으로 회전 역할을 분리하세요.

CharacterRoot
 └─ DirectionRoot
     └─ PoseRoot
         └─ ModelRoot
             └─ GLB Model

역할:

- CharacterRoot: 지도 위치와 스케일만 담당
- DirectionRoot: 이동 방향을 표현하는 Y축 회전만 담당
- PoseRoot: Walk/Run 전방 기울기만 담당
- ModelRoot: 모델의 기본 앞면 축 보정만 담당
- GLB Model: AnimationMixer 적용

하나의 Object3D에 방향 회전, 앞면 보정, 기울기를 모두 적용하지 마세요.

[2] 완전한 360도 회전 금지

충녕이는 얼굴이 항상 어느 정도 화면에 보여야 합니다.

이동 방향별 Y축 각도를 다음처럼 제한하세요.

- 아래 이동: 정면 0도
- 오른쪽 이동: +50도
- 왼쪽 이동: -50도
- 오른쪽 위 이동: +70도
- 왼쪽 위 이동: -70도
- 오른쪽 아래 이동: +35도
- 왼쪽 아래 이동: -35도
- 위쪽 단독 이동: 마지막 좌우 방향에 따라 +70도 또는 -70도
- 마지막 좌우 방향이 없다면 +60도를 기본값으로 사용

절대로 180도를 적용하지 마세요.
따라서 위쪽 이동에서도 캐릭터 뒤통수만 보이면 안 됩니다.

설정 예시:

directionMode: "cameraFriendly",
directionYawDeg: {
  down: 0,
  downRight: 35,
  right: 50,
  upRight: 70,
  up: 60,
  upLeft: -70,
  left: -50,
  downLeft: -35
}

DirectionRoot.rotation.y만 변경하고,
ModelRoot와 PoseRoot의 Y축 회전은 상태 전환 중 초기화하지 마세요.

[3] 모델 기본 앞면 보정

충녕이의 실제 정면 축을 브라우저에서 다시 확인하세요.

ModelRoot.rotation.y에는 모델별 frontRotationY만 적용합니다.

예:

ModelRoot.rotation.y = characterConfig.frontRotationY;

이동 방향값과 frontRotationY를 같은 변수에 더하거나 덮어쓰지 마세요.

최종 Y축 회전 관계:

DirectionRoot.rotation.y = 이동 방향 각도
ModelRoot.rotation.y = 고정된 frontRotationY

[4] 달리기 전방 기울기 수정

달리기 기울기는 반드시 캐릭터의 로컬 진행 방향을 기준으로 적용해야 합니다.

- CharacterRoot 또는 DirectionRoot의 월드 X축을 직접 회전하지 마세요.
- DirectionRoot 아래에 있는 PoseRoot의 local rotation.x만 사용하세요.
- Y축 방향 회전을 적용한 뒤 그 하위 PoseRoot에서 로컬 X축 기울기를 적용하세요.

상태별 목표값:

idle: 0도
walk: 약 3~6도 전방
run: 약 10~14도 전방

예시:

poseCorrection: {
  idlePitchDeg: 0,
  walkPitchDeg: 4,
  runPitchDeg: 12
}

Three.js 축 방향에 따라 양수 적용 시 뒤로 젖혀진다면
부호를 반대로 바꾸고 실제 브라우저에서 검증하세요.

중요한 완료 조건:

- Run 상태에서 가슴과 머리가 이동 방향 쪽으로 약간 숙여짐
- 어떤 방향에서도 뒤로 젖혀지지 않음
- 좌우 이동 시 옆으로 쓰러지듯 기울지 않음

[5] Quaternion 기반 자세 보정

Euler 회전 순서 충돌을 방지하기 위해 가능하면
DirectionRoot와 PoseRoot에 각각 Quaternion을 적용하세요.

DirectionRoot:
- Y축 yaw Quaternion

PoseRoot:
- local X축 pitch Quaternion

두 Quaternion을 하나의 Object3D에서 임의 순서로 곱하지 마세요.
각각 부모와 자식 Object3D로 분리합니다.

[6] 애니메이션 자체 Root/Hips 트랙 검사

현재 Run AnimationClip에 다음 트랙이 있는지 출력하세요.

- Root.position
- Root.quaternion
- Hips.position
- Hips.quaternion
- Armature.position
- Armature.quaternion

지도 위치 이동과 중복되는 Root/Hips position 트랙은
복제한 AnimationClip에서 제거하세요.

단, 팔과 다리 동작에 필요한 일반 Bone 트랙은 제거하지 마세요.

Root 또는 Hips quaternion 트랙이 캐릭터 전체를 뒤로 젖히는 경우에만
문제 트랙을 별도로 확인한 후 제거합니다.

원본 AnimationClip은 직접 수정하지 말고 clone한 clip을 사용하세요.

[7] 방향 전환 부드럽게 처리

방향키를 바꿀 때 캐릭터가 순간적으로 회전하지 않도록
DirectionRoot의 Y축 회전을 보간하세요.

권장:

- THREE.MathUtils.lerp 또는 Quaternion.slerp
- 회전 전환 시간 0.12~0.2초

각도 보간 시 +180도/-180도 경계를 잘못 돌아가지 않도록
shortest-angle interpolation을 사용하세요.

[8] Pose 기울기 보간

Idle → Walk → Run 상태 전환 시 PoseRoot의 pitch도 부드럽게 변경하세요.

- 전환 시간: 약 0.15~0.25초
- 같은 상태에서는 pitch를 반복 초기화하지 않음
- 키를 놓으면 부드럽게 0도로 복귀

[9] 위쪽 이동 시 얼굴 유지

위쪽 이동은 실제로 캐릭터의 등을 보여주는 방향이지만,
현재 서비스에서는 얼굴 가시성을 우선합니다.

따라서 위 이동 시:

- 180도 회전 금지
- 좌측 또는 우측 3/4 뷰 사용
- 얼굴의 양쪽 눈 중 최소 한쪽 이상이 보여야 함
- 모자 뒷면만 정면에 보이는 상태 금지

마지막 수평 입력 방향을 기억하여:

- 마지막이 왼쪽이면 upLeft
- 마지막이 오른쪽이면 upRight
- 기록이 없으면 upRight

를 사용하세요.

[10] 디버그 로그

개발 모드에서 다음 값을 출력하세요.

- 현재 입력 방향
- 현재 motion state
- 목표 yaw 각도
- 실제 DirectionRoot yaw
- 목표 pitch 각도
- 실제 PoseRoot pitch
- frontRotationY
- 현재 AnimationClip
- 제거된 root-motion track 목록

[11] 브라우저 확인 항목

반드시 실제 지도에서 8방향을 모두 확인하세요.

1. 정지: 얼굴 정면
2. 아래 이동: 얼굴 정면
3. 왼쪽 이동: 왼쪽 3/4 뷰
4. 오른쪽 이동: 오른쪽 3/4 뷰
5. 위 이동: 뒤통수가 아닌 3/4 뷰
6. 좌상단/우상단: 얼굴 일부가 계속 보임
7. Walk: 약하게 앞으로 숙임
8. Run: Walk보다 더 앞으로 숙이지만 뒤로 젖혀지지 않음
9. 어떤 방향에서도 옆으로 쓰러지는 모습 없음
10. 발과 그림자가 지도 좌표에서 분리되지 않음
11. 이름표와 감정 아이콘 위치 유지
12. 콘솔 오류 없음

[12] 변경 범위

- 충녕이 캐릭터 설정과 렌더러만 수정합니다.
- 비버 등 다른 캐릭터 동작은 깨뜨리지 않습니다.
- 지도 이동 좌표와 UI는 변경하지 않습니다.
- 불필요한 전체 리팩토링은 하지 않습니다.

완료 후 아래 내용을 보고하세요.

- 확인된 frontRotationY
- 8방향별 적용 yaw 값
- idle/walk/run pitch 값
- 제거한 Root/Hips 트랙 목록
- 수정 파일 목록
- WIZ 빌드 및 테스트 결과
- 8방향 브라우저 검증 결과
- 남아 있는 문제
```

## 변경 파일 목록

- `src/app/page.home/avatar-assets.config.ts`: 충녕이 8방향 yaw와 Idle/Walk/Run pitch 설정
- `src/app/page.home/character-manager.ts`: CharacterRoot/DirectionRoot/PoseRoot/ModelRoot 계층, quaternion yaw/pitch, 고정 frontRotationY, clone clip 필터
- `src/app/page.home/skeletal-avatar-renderer.ts`: 방향 판정, 마지막 수평 방향 기억, 0.16초 yaw slerp, 0.2초 pitch 보간, 개발 진단
- `src/app/page.home/avatar-preview-renderer.ts`: 미리보기 yaw를 DirectionRoot로 이동
- `tools/avatar-customization.test.ts`: 8방향·계층·quaternion·root motion 회귀 테스트
- `src/assets/avatar/README.md`: 충녕이 런타임 계층과 보정값 문서화
- `devlog.md`
- `devlog/2026-07-21/013-chungnyeong-camera-friendly-direction-pose.md`

## 확인 및 검증 결과

- 확인된 `frontRotationY`: `0 rad (0°)`; 정면 preview와 기존 +Z 앞면 기준 대조
- 적용 yaw: down 0°, downRight +35°, right +50°, upRight +70°, up 기본 +60°, upLeft -70°, left -50°, downLeft -35°
- 위 단독 입력은 마지막 수평 입력이 있으면 각각 -70°/+70° 사용
- 적용 pitch: Idle 0°, Walk +4°, Run +12°
- 방향 보간 0.16초 quaternion slerp, 자세 보간 0.2초 smoothstep
- 실제 GLB 트랙: Idle/Walk/Run 모두 `Root.position`, `Root.quaternion`; Hips/Armature 대상 트랙 없음
- 제거 트랙: `Walk:Root.position`, `Run:Root.position`; `Root.quaternion`은 동일한 축 보정값이므로 유지
- WIZ 일반 빌드 성공
- 자동 테스트 성공: 8방향 yaw, 마지막 좌우 기억, 계층/Quaternion 분리, root position 필터, 비버 범용 CharacterManager 회귀
- 충녕이 Idle/Walk/Run GLB generic 검증 성공
- `git diff --check` 성공
- 로컬 및 공개 `/home` HTTP 200
- GUI 브라우저 자동화 도구 부재로 실제 지도 육안 8방향 캡처와 콘솔 검증은 미수행

## 남은 리스크

- 실제 GPU 브라우저에서 눈 가시성, +4°/+12° 기울기 부호와 강도, 발·그림자·이름표·감정 아이콘 정렬을 최종 육안 확인해야 한다.
