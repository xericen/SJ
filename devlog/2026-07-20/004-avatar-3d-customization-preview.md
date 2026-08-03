# 회원가입 GLB 커스터마이징 미리보기 및 지도 통합

## 사용자 원본 요청

```text
현재 캐릭터 생성 화면은 공용 모델의 정적 이미지 파일을 미리보기로 보여주고, 얼굴·헤어·머리색·의상·장식·신발 옵션을 선택하는 UI만 존재한다.

이번 작업의 목표는 정적 이미지만 바꾸는 방식이 아니라, 실제 GLB 3D 캐릭터 모델을 캐릭터 생성 화면에서 렌더링하고 사용자가 헤어·옷·신발·색상·장식을 직접 변경할 수 있도록 만드는 것이다.

중요 목표:
- 기존 캐릭터 생성 UI 디자인은 최대한 유지한다.
- 왼쪽 공용 모델 이미지를 실제 Three.js 3D 모델 미리보기로 교체한다.
- 선택한 커스터마이징이 지도에 표시되는 실제 아바타에도 동일하게 반영되게 한다.
- 정적 이미지 위에 색상 필터를 입히는 가짜 커스터마이징으로 구현하지 않는다.
- 실제 Mesh, Material, GLB 파츠를 변경하는 방식으로 구현한다.
```

리뷰 ID: `nwjxtneabhsizrleedrencdjyxllfnlv`. 요청의 26개 상세 항목에 따라 공통 DTO, GLB 파츠 분리, 실시간 미리보기, 저장, 지도 통합, 성능, 테스트 및 실제 브라우저 검증을 수행했다.

## 구조 분석

- 회원가입 캐릭터 생성은 `src/app/page.home/view.ts|pug|scss`에 있으며 기존 설정은 `here-people-character` localStorage에 저장됐다.
- 서버 `api.py`에는 인증 API만 있고 아바타 프로필 저장 필드는 없어 공통 저장 인터페이스를 localStorage 키 `avatarCustomization`으로 구성했다.
- 기존 `toy-avatar.glb`는 19개 humanoid Bone과 9개 애니메이션 클립이 있었지만 Hair/Outfit/Pants/Shoes가 단일 파츠와 재질 중심이었다.
- 지도는 `skeletal-avatar-renderer.ts`가 Three.js GLTFLoader, AnimationMixer, OrthographicCamera를 사용했다.

## 작업 내용

- `AvatarCustomization` 공통 DTO와 기존 저장값 마이그레이션·랜덤 생성 로직을 추가했다.
- GLB 생성 스크립트를 확장해 얼굴 3종, 헤어 3종, 상의 3종, 하의 3종, 신발 2종, 액세서리 3종을 실제 분리 Mesh/Group으로 생성했다.
- 공통 GLB 캐시 로더와 Mesh visibility/Material color 커스터마이저를 구현했다.
- 회원가입 왼쪽 영역을 Idle AnimationMixer가 실행되는 WebGL Canvas로 변경했다.
- 마우스/터치 좌우 드래그, 메뉴별 부드러운 카메라 focus, DPR 제한, 탭 비활성 시 렌더 중단, dispose 처리를 적용했다.
- GLB 로딩 실패 시 기존 공용 이미지를 fallback으로 표시하고 재시도할 수 있게 했다.
- 선택과 무작위 결과를 즉시 미리보기와 지도 렌더러에 적용하고 새 저장 키와 기존 키에 함께 저장했다.
- 지도와 미리보기가 동일한 DTO, 로더, 커스터마이저를 사용하도록 중복 로직을 제거했다.

## 모델 구조

- Base: `toy-rounded`, `toy-active`
- Face: `Face_Smile`, `Face_Bright`, `Face_Calm`
- Hair: `Hair_Short`, `Hair_Parted`, `Hair_Curly`
- Top: `Top_Tshirt_*`, `Top_Hoodie_*`, `Top_Jacket_*`
- Bottom: `Bottom_Pants_*`, `Bottom_Shorts_*`, `Bottom_Joggers_*`
- Shoes: `Shoes_Sneakers_*`, `Shoes_Boots_*`
- Accessory: `Accessory_Glasses`, `Accessory_Flower`, `Accessory_Headphones`
- Material: `SkinMaterial`, `HairMaterial`, `TopMaterial`, `BottomMaterial`, `ShoesMaterial`, `FaceMaterial`, `AccessoryMaterial`
- Animation: Idle, Walk, Run, Jump, Wave, Happy, Surprised, Heart, Sit

## 변경 파일

- `src/app/page.home/avatar-customization.model.ts`: 공통 DTO, 정규화, 기존 데이터 마이그레이션, 랜덤 생성
- `src/app/page.home/avatar-assets.config.ts`: 모델·Mesh·Material 설정
- `src/app/page.home/avatar-customizer.ts`: 파츠 visibility와 Material color 공통 적용
- `src/app/page.home/avatar-model-loader.ts`: GLB 캐시 및 Skeleton clone
- `src/app/page.home/avatar-preview-renderer.ts`: 회원가입 Three.js 미리보기, Idle, 회전, focus, 정리
- `src/app/page.home/skeletal-avatar-renderer.ts`: 지도 렌더러를 공통 DTO·로더·커스터마이저로 전환
- `src/app/page.home/view.ts`: UI 상태, 저장, 랜덤, 미리보기 생명주기 및 지도 연동
- `src/app/page.home/view.pug`: 실제 Canvas, 로딩·fallback·재시도 UI
- `src/app/page.home/view.scss`: 미리보기와 모바일 반응형 스타일
- `tools/generate-avatar-glb.mjs`: 실제 교체 가능 파츠 생성
- `tools/avatar-customization.test.ts`: DTO, 랜덤, 파츠, 재질 격리, GLB 검증
- `src/assets/avatar/toy-avatar.glb`: 커스터마이징 파츠 포함 재생성
- `src/assets/avatar/README.md`: 파츠·재질 규격 문서
- `devlog.md`, `devlog/2026-07-20/004-avatar-3d-customization-preview.md`: 작업 기록

## 검증 결과

- WIZ 일반 빌드: 성공
- `git diff --check`: 성공
- 커스터마이징 자동 테스트: 성공
  - 100회 랜덤 값 유효성
  - 기존 저장값 변환과 JSON round-trip
  - Hair/Top/Shoes 단독 visibility
  - 좌우 Boots 파츠
  - Material 값 변경 및 인스턴스 격리
  - GLB 전체 파츠와 9개 클립
- 실제 Chromium 1440×900: 성공
  - GLB Idle 표시
  - 얼굴, 곱슬 헤어, 재킷·조거, 부츠, 헤드폰, Base 체형 실시간 변경
  - 드래그 회전
  - 5단계 화면 프레임이 모두 서로 다름
  - localStorage DTO 일치
  - 지도 Canvas 준비 및 CSS fallback 숨김
- 실제 Chromium 390×844: 성공
  - 미리보기 Canvas 표시
  - stage 영역 가로 overflow 없음
- 브라우저 page error/console error: 0건
- 라이브 GLB 응답: HTTP 200, 425,776 bytes

## 남은 리스크

- 현재 파츠는 각 관절 Bone의 자식인 강체 토이 파츠 방식이므로 고해상도 스킨드 의상으로 교체할 때 weight 재작업이 필요하다.
- 상의·하의 조합을 자유롭게 늘리면 극단 포즈에서 몸 관통을 모델링 단계에서 추가 보정해야 한다.
- 인증 API에는 아바타 프로필 저장 필드가 없어 현재는 localStorage 저장이며, 다기기 동기화는 서버 스키마/API 확장이 필요하다.
