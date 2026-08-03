# 스킨 웨이트 기반 토이 아바타 v2 교체

## 사용자 원본 요청

```text
현재 생성된 3D 아바타는 구, 캡슐, 원통형 파츠를 조합한 프로토타입 모델이라서 첨부 참고 이미지의 캐릭터 스타일과 차이가 크다.

현재 화면의 오른쪽 모델을 유지한 채 단순 색상 변경이나 파츠 크기 조정만 하지 말고, 첨부 참고 이미지의 디자인 언어를 반영한 새로운 고품질 토이 스타일 아바타 베이스 모델로 교체해줘.

중요:
- 현재 모델을 단순 확대·축소하거나 팔과 다리 길이만 수정해서 완료하지 말 것.
- 참고 이미지와 동일한 캐릭터를 복사하지 말고 디자인 특징만 참고할 것.
- 신규 모델은 실제 스킨 메시와 자연스러운 실루엣을 가져야 한다.
- 실제 브라우저 화면에서 기존 모델보다 확실히 개선된 모습이 확인돼야 한다.
```

리뷰 ID: `nwjxtneabhsizrleedrencdjyxllfnlv`. 상세 요구사항의 모델 진단, 체형·얼굴·헤어·의상·손발·웨이트·애니메이션·fallback·브라우저 검증을 수행했다.

## 원인 분석

- v1 `toy-avatar.glb`는 Sphere/Capsule/Cylinder를 Bone의 자식으로 둔 강체 파츠 방식이다.
- v1은 8,359 vertex, glTF skin 0개, skinned primitive 0개로 팔꿈치·무릎 사이가 분리되어 보였다.
- 두 체형은 동일 GLB에 root scale만 달리 적용해 실제 실루엣 차이가 없었다.
- 얼굴 파츠가 머리 표면과 거의 같은 depth에 있어 가려질 수 있었고, 의상은 분리된 몸통·소매 primitive였다.

## 신규 모델 구조

- 둥근 체형과 액티브 체형을 서로 다른 골격 길이·곡면으로 별도 GLB export
- 19개 공통 humanoid Bone
- 약 23,676 vertex, glTF skin 8개, skinned primitive 8개
- custom BufferGeometry ring surface로 몸통·팔·다리 연속 곡면 생성
- 상완/하완/손, 허벅지/종아리/발 사이 skinWeight 보간
- 손바닥·엄지가 구분되는 mitten 손과 upper/toe/sole/cuff가 구분되는 신발
- 앞면을 완만하게 편평화하고 턱을 줄인 머리, 눈·눈썹·코·입 face mesh
- 부드러운 MeshStandardMaterial과 피부·옷·신발·밑창·얼굴 재질 분리

## 커스터마이징 파츠

- Face: Smile, Bright, Calm, Surprised
- Hair: Short, Parted, Bob, Curly, Ponytail
- Top: Tshirt, Sweatshirt, Hoodie, Jacket
- Bottom: Pants, Shorts, Joggers
- Shoes: Sneakers, HighTop, Boots
- Accessory: Glasses, Flower, Headphones, Hat, Backpack, Beard
- 기본 accessoryIds는 빈 배열로 안경·수염 미착용

## 변경 파일

- `tools/generate-avatar-v2-glb.mjs`: 곡면, Skeleton, skinIndex/skinWeight, 파츠, 애니메이션 생성
- `src/assets/avatar/toy-avatar-v2-rounded.glb`: 둥근 체형 v2
- `src/assets/avatar/toy-avatar-v2-active.glb`: 액티브 체형 v2
- `src/app/page.home/avatar-assets.config.ts`: v2 경로·파츠·fallback 설정
- `src/app/page.home/avatar-customization.model.ts`: 얼굴·헤어·상의·신발·액세서리 선택값 확장
- `src/app/page.home/avatar-model-loader.ts`: v2 실패 시 v1 로더 fallback
- `src/app/page.home/avatar-preview-renderer.ts`: v2 framing, validation, fallback 연동
- `src/app/page.home/skeletal-avatar-renderer.ts`: 지도 v2/fallback 연동
- `src/app/page.home/view.ts`: 신규 커스터마이징 옵션
- `tools/avatar-customization.test.ts`: skin·vertex·파츠·랜덤 검증 확장
- `src/assets/avatar/README.md`: v1 진단과 v2 규격
- `devlog.md`, `devlog/2026-07-20/005-skinned-toy-avatar-v2.md`: 작업 기록

## 검증 결과

- WIZ 일반 빌드: 성공
- `git diff --check`: 성공
- GLB 자동 검사: 성공
  - 둥근/액티브 각각 23,676 vertex
  - skin 8개, skinned primitive 8개
  - 19 Bone 및 9 animation clip
  - 모든 커스터마이징 preset node
- 커스터마이징 자동 테스트: 성공
  - 100회 랜덤 ID 유효성
  - 파츠 단독 표시
  - 재질 인스턴스 격리
  - 기존 저장 데이터 마이그레이션
- 실제 Chromium 정면·측면·후면 캡처: 성공
  - 얼굴 depth, 머리·의상·손·신발 방향 및 전신 framing 확인
- 실제 Chromium 애니메이션: 성공
  - Idle, Walk, Run, Jump, Wave, Happy 6개 프레임 모두 상이
- 생성 화면 커스터마이징·드래그 회전·지도 반영: 성공
- 모바일 390×844 미리보기 overflow 없음
- v2 GLB 요청 강제 실패 시 v1 fallback: 성공
- 브라우저 page error 및 console error: 0건

## 남은 리스크

- 코드 생성 저폴리 모델이므로 아티스트가 수작업한 Blender 모델 수준의 옷 주름·얼굴 비대칭 디테일에는 한계가 있다.
- 팔꿈치·무릎 웨이트는 토이 스타일 보간이며 극단적인 외부 애니메이션을 추가하면 재조정이 필요하다.
- 헤어·모자·헤드폰 조합을 동시에 허용하도록 확장할 경우 관통 방지 규칙이 추가로 필요하다.
