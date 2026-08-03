# 업로드 비버 GLB 기본 적용 및 범용 CharacterManager 구축

## 사용자 원본 요청

```text
현재 업로드한 GLB(Meshy_AI_Cozy_Beaver_0720140346_texture.glb)를 기준으로 캐릭터 시스템을 구축해 주세요.

목표는 단순히 비버를 출력하는 것이 아니라 이후 충녕이, 토끼, 사람 등 여러 GLB 캐릭터를 쉽게 교체할 수 있는 구조입니다.

- CharacterManager가 GLB 로드·제거·교체·애니메이션·상태를 관리
- loadCharacter(url, { scale, position, rotation }) API
- AnimationMixer 자동 등록과 Idle 기본 재생
- Scene > CharacterRoot > CurrentCharacter 계층
- castShadow/receiveShadow 자동 적용
- Geometry/Material/Texture/AnimationMixer dispose
- 플레이어와 NPC가 같은 구조 사용
- 업로드한 GLB를 현재 기본 캐릭터로 연결
```

리뷰 ID: `nwjxtneabhsizrleedrencdjyxllfnlv`

## 모델 분석

- 파일: `Meshy_AI_Cozy_Beaver_0720140346_texture.glb`
- 용량: 17,927,972 bytes
- glTF 2.0, Scene 1 / Node 1 / Mesh 1 / Material 1
- 212,602 vertex, 381,038 triangle, embedded 2K texture 3개
- 크기: 1.1216 × 1.8989 × 1.6231 unit
- Y-up, 얼굴 +Z, 모델 중심 원점이므로 Y +0.951 지면 보정
- Skeleton 0, Animation 0, morph target 0
- 단일 unnamed 완성형 Mesh라 파츠·색상 커스터마이징 및 자체 Walk/Run/Jump/Wave는 불가능

## 변경 내용

- 업로드 GLB를 `src/assets/avatar/models/cozy-beaver.glb`로 복사하고 기본 모델 `cozy-beaver`로 등록했다.
- 실제 렌더 결과를 `cozy-beaver-preview.png`로 만들어 모델 카드와 최종 fallback에 연결했다.
- `CharacterManager`가 `loadCharacter`, `removeCharacter`, `playAnimation`, `update`, `dispose`, 파츠 조회/표시를 제공한다.
- 로드할 때 기존 캐릭터를 제거하고 Scene 아래 `CharacterRoot > CurrentCharacter` 구조를 만든다.
- GLB의 모든 AnimationClip을 자동 등록하고 Idle이 있으면 반복 재생한다. 없는 애니메이션 호출은 안전하게 false를 반환한다.
- 모든 Mesh에 castShadow/receiveShadow를 적용한다.
- 교체·제거·dispose 시 Geometry, Material, Texture, Skeleton, AnimationMixer를 정리한다.
- 동시 로드 시 오래된 응답이 최신 캐릭터나 fallback을 덮어쓰지 않도록 요청 버전을 적용했다.
- 기존 회원가입 PreviewRenderer와 지도 SkeletalAvatarRenderer가 같은 CharacterManager를 사용한다.
- 완성형 비버에는 `generic` GLB 검증을 적용하고 커스터마이징 capability를 비워 지원하지 않는 UI를 비활성화했다.
- 비버 로딩 실패 시 기존 `toy-avatar.glb`, 그마저 실패하면 정적 비버 이미지 순으로 fallback한다.

## 수정 파일

- `src/app/page.home/character-manager.ts`: 범용 캐릭터 생명주기·애니메이션 관리자 신규
- `src/app/page.home/avatar-assets.config.ts`: 비버 기본 모델, transform, generic capability 등록
- `src/app/page.home/avatar-customization.model.ts`: 기본·랜덤·구형 저장값을 비버로 migration
- `src/app/page.home/avatar-model-validator.ts`: Skeleton 없는 완성형 GLB용 generic 검증
- `src/app/page.home/avatar-preview-renderer.ts`: CharacterManager 기반 로드·회전·fallback
- `src/app/page.home/skeletal-avatar-renderer.ts`: CharacterManager 기반 지도 렌더·상태 애니메이션 호출
- `src/app/page.home/avatar-customizer.ts`: 불필요해진 별도 dispose 함수 제거
- `src/app/page.home/view.ts`, `view.pug`, `view.scss`: capability 안내·미지원 옵션·무작위 비활성화
- `src/assets/avatar/models/cozy-beaver.glb`: 업로드 원본 GLB
- `src/assets/avatar/models/cozy-beaver-preview.png`: 실제 모델 카드/fallback 이미지
- `src/assets/avatar/README.md`: 범용 API, 모델 제약, fallback 문서
- `tools/avatar-customization.test.ts`: CharacterManager 교체·애니메이션·shadow·dispose 테스트
- `tools/validate-avatar-glb.mjs`: embedded texture와 generic GLB 검사 지원
- 삭제: `src/app/page.home/avatar-model-loader.ts` (CharacterManager로 통합)

## 검증 결과

- 업로드 원본과 프로젝트 GLB SHA-256 일치: `a2603a37...44ec2c`
- WIZ 일반 빌드: 성공
- CharacterManager/registry/customization 자동 테스트: 성공
- GLB generic 검사: 성공(1.1216 × 1.8989 × 1.6231, clip 0)
- 실제 Chromium GLB 요청: HTTP 200
- 회원가입 비버 전신 미리보기와 드래그 회전: 성공
- 구형 `toy-active` 저장값의 `cozy-beaver` migration: 성공
- 지도 비버 표시 및 방향키 이동에 따른 Canvas 갱신: 성공
- 비버 GLB 요청 실패 시 안정 GLB fallback: 성공
- 모바일 390×844 미리보기 overflow 없음
- 브라우저 console/page error: 0건
- `git diff --check`: 성공

## 남은 리스크

- 현재 비버는 정적 단일 Mesh라 자체 애니메이션과 파츠 커스터마이징이 불가능하다. 기능 활성화에는 rigged/animated/part-named GLB가 필요하다.
- 381k triangle과 embedded 2K texture 3개는 모바일 및 다수 NPC에 무겁다. 후속 모델은 LOD/mesh decimation/texture 압축이 권장된다.
- 여러 NPC가 같은 대형 GLB를 동시에 사용할 경우 reference-counted asset cache가 추가로 필요할 수 있다.
