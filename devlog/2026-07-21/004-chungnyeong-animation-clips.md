# 충녕이 3-clip GLB 애니메이션 연결

## 사용자 원본 요청

```text
현재 업로드한 충녕이_애니메이션_3.glb를 사용하여 애니메이션이 정상 재생되도록 수정해 주세요.
GLTFLoader로 로드한 모든 clip을 AnimationMixer에 등록하고 첫 clip을 기본 반복 재생하며,
CharacterManager에서 이름 또는 인덱스로 애니메이션을 재생할 수 있게 해 주세요.
```

리뷰 ID: `nwjxtneabhsizrleedrencdjyxllfnlv`

## 변경 내용

- 기존 충녕이 asset을 `충녕이_애니메이션_3.glb`로 교체했다.
- 실제 clip 3개를 모두 `AnimationMixer`에 등록하고 기본 동작을 `LoopRepeat`로 재생한다.
- `CharacterManager.playAnimation(name | index)`를 지원하도록 확장했다.
- Blender 기본 clip 이름을 기존 상태 머신과 연결하기 위해 `Idle → 0`, `Walk → 1`, `Run → 2` 모델 별칭을 추가했다.
- 로드 로그에 clip 개수·이름·duration·Skeleton·bone 수를, 재생 로그에 현재 clip 이름·index·loop를 표시한다.
- 미리보기와 지도 렌더러가 같은 모델별 animation alias를 전달한다.

## 수정 파일

- `src/assets/avatar/models/chungnyeong.glb`
- `src/app/page.home/character-manager.ts`
- `src/app/page.home/avatar-assets.config.ts`
- `src/app/page.home/avatar-preview-renderer.ts`
- `src/app/page.home/skeletal-avatar-renderer.ts`
- `src/assets/avatar/README.md`
- `tools/avatar-customization.test.ts`
- `devlog.md`
- `devlog/2026-07-21/004-chungnyeong-animation-clips.md`

## 검증 결과

- 원본/배포 GLB SHA-256 일치: `4af145a2cc867f09248108d235acde9485ed327f340de0ffe39dc49586ba9cde`
- GLTFLoader 진단: Skeleton 1개, bone 41개, AnimationClip 3개
- clip: `NlaTrack` 2.375초, `NlaTrack.001` 약 1.292초, `NlaTrack.002` 15.375초
- 첫 clip을 0.5초 업데이트한 결과 41개 bone 중 40개의 transform 변화 확인
- CharacterManager 이름·인덱스·별칭·LoopRepeat 자동 테스트: 성공
- GLB generic 검증: 성공
- WIZ 일반 빌드: 성공
- `git diff --check`: 성공

## 남은 리스크

- GLB 내부 clip 이름이 의미 있는 Idle/Walk/Run 이름이 아니므로 현재 순서 기반 별칭을 사용한다. Blender에서 clip 이름이나 순서를 바꾸면 metadata도 함께 갱신해야 한다.
- 실제 동작 품질과 각 clip 의미는 서비스 브라우저에서 최종 육안 확인이 필요하다.
