# 비버 GLB 리깅 진단 및 앞면·카메라·드래그 회전 보정

## 사용자 원본 요청

```text
현재 캐릭터 커스터마이징 화면에 GLB 비버 모델은 정상 표시되지만 아래 두 문제가 있습니다.

문제 1. 관절/애니메이션이 움직이지 않음
문제 2. 아래 방향 드래그 또는 회전 조작 시 앞면이 보여야 하는데 모델 뒷면이 보임

- GLB animation, SkinnedMesh, Skeleton, bone, Mesh별 isSkinnedMesh 진단
- AnimationMixer update 및 Idle/첫 clip 자동 재생
- 정적 Mesh라면 가짜 애니메이션 없이 상태 표시
- frontRotationY 모델 metadata 추가
- 좌우는 CharacterRoot Y 회전, 상하는 제한된 camera target 조절
- Box3 기반 중심·지면 정렬 및 fitCameraToObject
- 기존 UI와 모델 교체 기능 유지
```

리뷰 ID: `nwjxtneabhsizrleedrencdjyxllfnlv`

## 진단 결과와 원인

- `cozy-beaver.glb` animation clip: 0개 (`[]`)
- SkinnedMesh: 없음
- Skeleton: 0개
- bone: 0개
- Mesh: `mesh_0`, `isSkinnedMesh: false`
- 따라서 관절이 움직이지 않은 원인은 렌더 루프이나 Mixer 문제가 아니라 원본 GLB가 리깅되지 않은 단일 정적 Mesh이기 때문이다.
- 실제 모델 앞면은 +Z이며 카메라도 +Z에서 원점을 바라보므로 비버의 `frontRotationY`는 `0`이 맞다.

## 변경 내용

- CharacterManager가 GLB 로드 직후 clip 이름/기간, SkinnedMesh, Skeleton, bone, Mesh별 skin 상태와 rig 상태를 콘솔에 출력한다.
- animation 이름 비교 시 대소문자·공백·하이픈·밑줄 차이를 무시한다.
- Idle이 있으면 자동 반복하고, 없지만 clip이 있으면 첫 번째 clip을 자동 반복한다.
- 모델 교체 시 기존 action을 stop하고 Mixer root를 uncache한 후 자원을 해제한다.
- `frontRotationY`를 모델 설정과 CurrentCharacter metadata에 저장하고 모델 로컬 Y 회전에 적용한다.
- Box3로 X/Z 중심과 발의 Y=0을 자동 정렬한다.
- 미리보기는 `fitCameraToObject`로 높이·깊이에 맞춰 OrthographicCamera를 자동 framing한다.
- 좌우 드래그만 CharacterRoot.rotation.y를 변경한다.
- 상하 드래그는 제한된 camera target 높이만 바꾸며 모델 X/Z 회전은 변경하지 않는다.
- 미리보기 렌더 루프는 `THREE.Clock` 하나와 requestAnimationFrame 하나만 사용하며 `CharacterManager.update(delta)`를 호출한다.
- 정적 Mesh 상태를 기존 안내 영역에 명시했다.

## 수정 파일

- `src/app/page.home/character-manager.ts`: rig 진단, metadata, frontRotationY, 자동 정렬, clip 이름 정규화, 첫 clip fallback
- `src/app/page.home/avatar-assets.config.ts`: 모델별 `frontRotationY`, 비버 자동 지면 정렬용 position 수정
- `src/app/page.home/avatar-preview-renderer.ts`: 단일 Clock, Box3 camera fitting, 앞면 초기화, 수평/수직 drag 분리
- `src/app/page.home/skeletal-avatar-renderer.ts`: frontRotationY와 자동 지면 정렬을 지도 모델에도 공통 적용
- `src/app/page.home/view.pug`: 정적 Mesh 진단 안내 문구
- `src/assets/avatar/README.md`: 방향·정렬·진단·animation fallback 문서
- `tools/avatar-customization.test.ts`: front rotation, 진단, 이름 정규화, 첫 clip fallback, 자동 지면 정렬 테스트
- `devlog.md`, `devlog/2026-07-21/002-beaver-rig-camera-orientation.md`: 작업 기록

## 검증 결과

- WIZ 일반 빌드: 성공
- CharacterManager/커스터마이징 자동 테스트: 성공
- 비버 GLB generic 검사: 성공(clip 0)
- 실제 Chromium 콘솔 진단: static-mesh, animation 0, SkinnedMesh false, Skeleton 0, bone 0
- 초기 앞면 정면 표시: 성공(`frontRotationY = 0`)
- 수직 드래그 후에도 앞면·전신·발 접지 유지: 성공
- 수평 드래그 시 Y축 제자리 회전: 성공
- UI 정적 모델 안내 표시: 성공
- 브라우저 console/page error: 0건
- `git diff --check`: 성공

## 남은 리스크

- 현재 비버 GLB는 정적 Mesh이므로 웹 코드만으로 관절 애니메이션을 만들 수 없다.
- 실제 관절 동작에는 Skeleton, skin weight, AnimationClip이 포함된 새 GLB가 필요하다.
- 비버는 약 381k triangle과 2K embedded texture 3개를 사용하므로 저사양 모바일 및 다수 NPC에서 최적화가 필요하다.
