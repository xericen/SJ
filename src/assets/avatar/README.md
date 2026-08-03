# 범용 GLB 캐릭터 시스템

## 현재 모델

- 경로: `/assets/avatar/models/cozy-beaver.glb`
- 형식: binary glTF 2.0(GLB)
- 높이: 약 1.899 Three.js unit
- 스케일: 1
- 정면축: +Z
- 원점: 모델 중심(`CharacterManager`가 Box3로 중심·지면을 자동 정렬)
- 구조: 단일 완성형 Mesh, 212,602 vertex / 381,038 triangle
- 재질: embedded 2K texture 3개를 사용하는 단일 Material
- Skeleton/Animation: 없음
- 상태: 기본 production 캐릭터

현재 비버는 완성형 정적 모델이므로 화면 출력과 회전은 지원하지만 파츠 교체 및 자체 Idle/Walk/Run/Jump/Wave는 지원하지 않는다. 존재하지 않는 기능은 UI에서 비활성화한다.

### 충녕이

- 본체/대기 경로: `/assets/avatar/models/chungnyeong-idle.glb`
- 걷기 경로: `/assets/avatar/models/chungnyeong-walk.glb`
- 달리기 경로: `/assets/avatar/models/chungnyeong-run.glb`
- 원본: `충녕_대기 (1).glb`, `충녕_걷기 (1).glb`, `충녕_달리기 (1).glb`
- 높이: 약 0.979 unit, 웹 표시 scale 1.9
- 구조: SkinnedMesh 1개, Skeleton 1개, bone 41개
- geometry: 18,256 vertex / 22,436 triangle
- animation clip: 파일별 1개 (`Idle` 6초, `Walk` 2.375초, `Run` 약 1.292초)
- 상태 별칭: `Idle → 본체 0`, `Walk → Walk 외부 clip`, `Run → Run 외부 clip`
- 지도 상태: 입력 없음 Idle, 이동 시작 Walk, 700ms 지속 시 Run
- 지도 속도: Walk 8.5, Run 14.45(1.7배)
- 지도 전용 배율: `mapScale = 1.5` (미리보기 scale과 분리)
- 앞면 보정: GPU 브라우저 캘리브레이션 확정값 `frontRotationY = Math.PI` (`180°`)
- 지도 회전 계층: `CharacterRoot > DirectionRoot > PoseRoot > ModelRoot > GLB Model`
- 자세 보정: Idle `0°`, Walk `+4°`, Run `+12°` (0.2초 보간)
- 방향 표시: 카메라 친화형 8방향 yaw (`0/±35/±50/±70°`, 위 기본 `+60°`)
- root motion: Walk/Run의 `Root.position` 트랙을 clone clip에서 제거하고 축 보정용 `Root.quaternion`은 유지
- 개발 모드 정면축 캘리브레이션: `F1=0°`, `F2=90°`, `F3=180°`, `F4=-90°`; `ModelRoot`에만 즉시 적용하고 좌측 상단 오버레이에 표시하며 일반 환경에서는 숨김

세 파일은 동일한 41본 스켈레톤과 노드 이름을 사용한다. `CharacterManager`는 대기 GLB를 화면 모델로 사용하고 걷기·달리기 GLB에서는 clip만 가져와 `Walk`, `Run`으로 등록한다. 임시로 로드한 두 모델의 geometry/material/texture는 즉시 해제하며, 로드 직후 Idle 별칭인 본체 첫 clip을 `LoopRepeat`로 자동 재생한다.

## CharacterManager API

`character-manager.ts`가 플레이어, NPC, 회원가입 미리보기에서 동일하게 GLB 생명주기를 관리한다.

```ts
const manager = new CharacterManager(scene);
await manager.loadCharacter('/assets/avatar/models/cozy-beaver.glb', {
  scale: 1,
  position: [0, 0, 0],
  rotation: [0, 0, 0],
  frontRotationY: 0,
  alignToGround: true
});
manager.playAnimation('Walk'); // 이름 또는 모델 별칭
manager.playAnimation(1);      // clip 인덱스도 지원
manager.update(deltaTime);
manager.removeCharacter();
manager.dispose();
```

Scene 계층은 `Scene > CharacterRoot > DirectionRoot > PoseRoot > ModelRoot > CurrentCharacter`이며 GLB 교체 전 기존 geometry, material, texture, Skeleton, AnimationMixer를 해제한다. `CharacterRoot`는 지도 위치와 스케일, `DirectionRoot`는 이동 yaw, `PoseRoot`는 상태별 local pitch, `ModelRoot`는 고정 `frontRotationY`만 담당한다. 로드한 모든 Mesh에는 `castShadow`, `receiveShadow`를 자동 적용한다. 클립이 있으면 이름별로 자동 등록하고 Idle이 있으면 기본 재생한다.

로드할 때 animation 이름·SkinnedMesh 여부·Skeleton 수·bone 수·Mesh별 `isSkinnedMesh`를 콘솔 진단으로 남긴다. Idle 이름은 대소문자·공백·`_`·`-` 차이를 무시하며, Idle이 없으면 첫 번째 clip을 기본 반복 재생한다. 현재 비버는 +Z가 앞면이므로 `frontRotationY`는 `0`이다.

## 필수 humanoid 본

`hips`, `spine`, `chest`, `neck`, `head`,
`leftShoulder`, `leftUpperArm`, `leftLowerArm`, `leftHand`,
`rightShoulder`, `rightUpperArm`, `rightLowerArm`, `rightHand`,
`leftUpperLeg`, `leftLowerLeg`, `leftFoot`,
`rightUpperLeg`, `rightLowerLeg`, `rightFoot`

## 애니메이션 클립

필수 이름은 대소문자와 관계없이 로더에서 정규화합니다.

- `Idle`
- `Walk`
- `Run`
- `Jump`
- `Wave`
- `Happy`
- `Surprised`
- `Heart`
- `Sit`

locomotion은 반복 재생하며, Jump 및 감정 클립은 1회 재생 후 현재 속도에 맞는 locomotion으로 복귀합니다.

## Blender/Mixamo 교체 모델 내보내기

- glTF 2.0 / GLB, Apply Transform 활성화
- 단위 스케일 1, 발 중앙을 원점에 배치
- 정면축은 +Z 권장. -Z 모델은 렌더러의 `modelForwardOffset`으로 보정
- 변형에 쓰는 텍스처는 GLB에 embed
- 본 이름은 위 목록을 유지하거나 렌더러의 bone alias 표에 연결
- 애니메이션은 NLA Strip 또는 All Actions로 포함
- 루트 이동이 있는 Mixamo 클립은 in-place로 변환
- 메시 이름 또는 재질 이름에 `Skin`, `Hair`, `Outfit`, `Pants`, `Shoes` 중 하나를 포함

## Fallback

기본 GLB 404, 파싱 실패 또는 검증 오류 시 `/assets/avatar/toy-avatar.glb`를 표시하고, 안정 GLB도 실패하면 정적 비버 미리보기를 표시합니다. WebGL 미지원 시 기존 CSS DOM 캐릭터가 유지됩니다.

## 커스터마이징 파츠 구조

모든 파츠는 같은 humanoid Bone 계층의 자식이며, 선택된 프리셋만 `visible` 상태가 됩니다. 파츠 선택과 재질 색상 변경은 `avatar-customizer.ts`가 미리보기와 지도에 공통 적용합니다.

- Base preset: `cozy-beaver` (완성형), `toy-rounded` (내부 fallback)
- Face: `Face_Smile`, `Face_Bright`, `Face_Calm`
- Hair: `Hair_Short`, `Hair_Parted`, `Hair_Curly`
- Top: `Top_Tshirt_*`, `Top_Hoodie_*`, `Top_Jacket_*`
- Bottom: `Bottom_Pants_*`, `Bottom_Shorts_*`, `Bottom_Joggers_*`
- Shoes: `Shoes_Sneakers_Left/Right`, `Shoes_Boots_Left/Right/Cuff`
- Accessory: `Accessory_Glasses`, `Accessory_Flower`, `Accessory_Headphones`

## 재질 이름

- `SkinMaterial`
- `HairMaterial`
- `TopMaterial`
- `BottomMaterial`
- `ShoesMaterial`
- `FaceMaterial`
- `AccessoryMaterial`

파츠 규격을 가진 모델은 인스턴스별 Material에 커스터마이징을 적용한다. `CharacterManager`는 인스턴스별 자원을 소유하고 dispose하여 다른 플레이어/NPC의 자원을 함께 해제하지 않는다.

## Blender v3 교체 정책

- production: `/assets/avatar/models/cozy-beaver.glb`
- fallback: `/assets/avatar/toy-avatar.glb`
- 신규 둥근 체형 후보: `/assets/avatar/models/toy-rounded-v3.glb`
- 신규 액티브 체형 후보: `/assets/avatar/models/toy-active-v3.glb`
- 폐기된 v2 비교본: `/assets/avatar/experimental/` (feature flag 기본 꺼짐)
- feature version: `AVATAR_MODEL_VERSION = 'beaver-v1'`

사람 외형을 Sphere/Box/Cylinder/Capsule 또는 custom primitive 조합으로 생성하는 스크립트는 제거했다. 신규 모델은 `models/BLENDER_MODEL_SPEC.md`를 만족하는 Blender 제작 SkinnedMesh만 허용하며, 자동 검사와 육안 검수 후 `enabled`, `verified`를 함께 활성화한다.

fallback 순서는 검증된 선택 모델, 안정 `toy-avatar.glb`, 정적 공용 이미지다. 모델별 `capabilities`에 없는 파츠는 UI에서 비활성화하며 런타임에서 대체 primitive를 생성하지 않는다.
