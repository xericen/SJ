# 지도 충녕이 이동 상태·크기·얼굴 선명도 개선

## 사용자 원본 요청

```text
지도 화면에서 입력 없음은 Idle, 짧은 방향키 입력은 Walk, 700ms 이상 입력은 Run,
키 해제 시 Idle로 복귀하게 하고 실제 이동 속도와 애니메이션을 맞춰 주세요.
충녕이는 지도에서 현재의 1.5배로 키우고 이름표·감정 아이콘 겹침과 뭉개진 얼굴도 개선해 주세요.
기존 지도·채팅·이웃·동아리·반응 UI는 변경하지 말아 주세요.
```

리뷰 ID: `nwjxtneabhsizrleedrencdjyxllfnlv`

## 변경 내용

- 이동 상태 상수와 속도를 `RUN_HOLD_DELAY_MS = 700`, `WALK_SPEED = 8.5`, `RUN_SPEED = 14.45`로 분리했다.
- 방향키와 WASD를 `pressedKeys`로 관리해 key repeat와 복수 키 입력에서 타이머가 초기화되지 않게 했다.
- 창 blur 및 document hidden 시 입력을 해제한다.
- 상태가 변경될 때만 AnimationAction을 전환하고 0.2초 cross-fade 후 이전 action을 stop한다.
- 모델 metadata에 `animationMap: { idle: 0, walk: 1, run: 2 }`와 `mapScale`을 추가했다.
- 충녕이 mapScale을 1.0에서 1.5로 변경해 지도 절대 scale 기준을 39에서 58.5로 확대했다.
- 확대 모델의 감정 아이콘·동아리 배지를 위로 이동하고 그림자 크기도 함께 조절했다.
- 4096×4096 원본 texture에 최대 8x anisotropy와 linear mipmap을 적용하고 지도 renderer를 1.5~2 DPR로 렌더링해 얼굴 및 윤곽 선명도를 높였다.

## 수정 파일

- `src/app/page.home/character-animation-state.ts`
- `src/app/page.home/character-movement.ts`
- `src/app/page.home/character-manager.ts`
- `src/app/page.home/avatar-assets.config.ts`
- `src/app/page.home/avatar-preview-renderer.ts`
- `src/app/page.home/skeletal-avatar-renderer.ts`
- `src/app/page.home/view.ts`
- `src/app/page.home/view.pug`
- `src/app/page.home/view.scss`
- `src/assets/avatar/README.md`
- `tools/avatar-customization.test.ts`
- `devlog.md`
- `devlog/2026-07-21/007-map-avatar-motion-scale-clarity.md`

## 검증 결과

- GLTFLoader: AnimationClip 3개, Skeleton 1개, bone 41개 확인
- clip: `NlaTrack` 2.375초, `NlaTrack.001` 약 1.292초, `NlaTrack.002` 15.375초
- 자동 테스트: 방향키/WASD, 반복 keydown, 복수 키, 700ms Walk→Run, keyup Idle 성공
- CharacterManager 이름·인덱스 별칭 및 정적 모델 fallback 테스트: 성공
- 충녕이 GLB generic 검증: 성공
- WIZ 일반 빌드: 성공
- 로컬 Chromium: 로그인 및 `/home?view=room&area=zone1` 지도 진입, WebGL context 초기화 확인
- `git diff --check`: 성공

## 남은 리스크

- headless Chromium의 SwiftShader 환경에서는 화면 캡처 ReadPixels가 지연되어 변경 후 지도 이미지를 자동 저장하지 못했다. 실제 GPU 브라우저에서 최종 육안 확인이 필요하다.
- 강제 최소 DPR 1.5는 얼굴 선명도를 높이지만 저사양 모바일 GPU에서는 렌더링 비용이 늘 수 있다.
- GLB clip 이름이 의미 없는 NLA 기본 이름이므로 Blender에서 clip 순서가 바뀌면 animationMap도 갱신해야 한다.
