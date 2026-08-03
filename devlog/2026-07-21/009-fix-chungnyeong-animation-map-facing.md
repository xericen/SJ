# 충녕이 애니메이션 재매핑 및 정지 정면 복귀

## 사용자 원본 요청

```text
얼굴이 안 보이고, 아무 키도 누르지 않았을 때 걷기 동작이 나오며,
방향키 입력 시 뛰고 길게 누를 때는 가만히 있는 잘못된 상태를 해결해 주세요.
```

리뷰 ID: `nwjxtneabhsizrleedrencdjyxllfnlv`

## 원인

- GLB clip 이름이 `NlaTrack*`이라 최초 등록 시 파일 순서를 Idle·Walk·Run으로 잘못 가정했다.
- 실제 본 이동량과 화면 동작은 0번 Walk, 1번 Run, 2번 Idle 순서였다.
- 마지막 이동 방향이 위쪽이면 입력을 놓아도 캐릭터 root가 뒤를 향한 채 유지되어 얼굴이 보이지 않았다.

## 변경 내용

- 충녕이 animationMap을 `idle: 2`, `walk: 0`, `run: 1`로 교정했다.
- 입력이 없으면 Idle 상태와 함께 목표 Y 회전을 정면 0으로 되돌린다.
- 기존 quaternion slerp를 유지해 뒤에서 정면으로 갑자기 튀지 않고 부드럽게 복귀한다.
- 미리보기 정지 포즈도 실제 Idle clip 첫 프레임을 사용하도록 자동 반영됐다.

## 수정 파일

- `src/app/page.home/avatar-assets.config.ts`
- `src/app/page.home/character-movement.ts`
- `src/assets/avatar/README.md`
- `tools/avatar-customization.test.ts`
- `devlog.md`
- `devlog/2026-07-21/009-fix-chungnyeong-animation-map-facing.md`

## 검증 결과

- clip별 41개 bone 이동량 비교: 0번 보행, 1번 달리기, 2번 대기 확인
- 자동 테스트 로그: Idle index 2, Walk index 0, Run index 1 재생 확인
- 입력 해제 후 `targetRotation = 0`, facing front 확인
- 700ms Walk→Run 및 keyup Idle 테스트 성공
- 충녕이 GLB generic 검증 성공
- WIZ 일반 빌드 성공
- `git diff --check`: 성공

## 남은 리스크

- headless Chromium의 SwiftShader WebGL이 지도 진입 후 CDP 응답을 지연시켜 변경 후 동작 화면 자동 캡처는 완료하지 못했다.
- 얼굴의 세부 선명도는 4096px 원본 texture·1.5배 mapScale·고해상도 샘플링까지 적용됐으나 실제 GPU 브라우저에서 최종 확인이 필요하다.
