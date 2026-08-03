# Blender 아바타 GLB 연동 규격

이 디렉터리는 아티스트가 Blender에서 제작·검수한 아바타만 받습니다. 웹 코드나 primitive 조합으로 사람 외형을 생성하지 않습니다.

## 파일과 좌표

- 둥근 체형: `toy-rounded-v3.glb`
- 액티브 체형: `toy-active-v3.glb`
- GLB 단일 파일, texture embedded, transform 적용, object/armature scale `1`
- Y-up, 정면 `+Z`, 발 중앙을 원점 `(0, 0, 0)`으로 배치
- 전체 높이 `1.7~2.0` Three.js unit 권장(검사 허용 범위 `1.5~2.2`)
- 몸·의상은 실제 SkinnedMesh와 동일 Armature/bind pose를 사용

## 필수 본

`Root`, `Hips`, `Spine`, `Chest`, `Neck`, `Head`, `UpperArm_L`, `LowerArm_L`, `Hand_L`, `UpperArm_R`, `LowerArm_R`, `Hand_R`, `UpperLeg_L`, `LowerLeg_L`, `Foot_L`, `UpperLeg_R`, `LowerLeg_R`, `Foot_R`

팔꿈치·무릎·어깨·골반은 최소 2개 이상의 edge loop와 보간된 weight를 가져야 합니다. 의상·신발·헤어·액세서리는 대응 본을 따라야 하며 관절 사이가 떨어져 보이면 검수 실패입니다.

## 필수 애니메이션

대소문자를 포함해 `Idle`, `Walk`, `Run`, `Jump`, `Wave`, `Happy`, `Surprised`, `Heart`, `Sit`로 export합니다. Idle/Walk/Run은 loop, 나머지는 one-shot이며 root motion 없이 제자리 재생합니다.

## Material과 교체 파츠

필수 Material은 이름에 `Skin`, `Hair`, `Top`, `Bottom`, `Shoes`, `Face`를 포함해야 합니다. 웹 tint와의 호환을 위해 `SkinMaterial`, `HairMaterial`, `TopMaterial`, `BottomMaterial`, `ShoesMaterial`, `FaceMaterial`을 권장합니다.

권장 Mesh 이름:

- Hair: `Hair_Default`, `Hair_Short`, `Hair_Parted`
- Top: `Top_Tshirt`, `Top_Hoodie`, `Top_Jacket`
- Bottom: `Bottom_Pants`, `Bottom_Shorts`
- Shoes: `Shoes_Sneakers`, `Shoes_Boots` 또는 좌우 `_Left`, `_Right`
- Accessory: `Accessory_Glasses`, `Accessory_Headphones`, `Accessory_Hat`, `Accessory_Backpack`, `Accessory_Beard`

한 GLB에 preset을 모두 포함하면 미선택 파츠를 숨길 수 있어야 합니다. 별도 GLB 파츠를 쓰는 경우 동일 Skeleton, bind pose, 축, 단위를 유지합니다. 모델이 실제로 제공하는 항목만 `avatar-assets.config.ts`의 `capabilities`에 등록합니다.

## 품질 검사 및 공개 절차

1. Blender에서 GLB를 위 파일명으로 export합니다.
2. `node tools/validate-avatar-glb.mjs src/assets/avatar/models/toy-rounded-v3.glb`를 통과시킵니다.
3. 정면·측면·후면과 9개 클립에서 관통, 분리, 접지, 얼굴/액세서리 위치를 육안 검수합니다.
4. `avatar-assets.config.ts`에서 해당 모델의 `verified`와 `enabled`를 모두 `true`로 변경합니다.

검사는 크기·transform·본·클립·SkinnedMesh·Material·상자형 몸통 노출·관절 간격을 확인합니다. 자동 검사를 통과해도 아티스트 육안 검수 없이는 production에 활성화하지 않습니다.

## Blender export 권장값

- Format: glTF Binary (`.glb`), Include: Selected Objects
- Transform: `+Y Up`, Apply Modifiers
- Data: Custom Properties 사용 시 필요한 값만 포함
- Animation: Animation/Shape Keys/Skinning 활성화, NLA Tracks 또는 All Actions 사용
- Material texture는 sRGB(base color), 데이터 texture는 Non-Color로 설정
