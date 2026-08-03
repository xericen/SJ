# 충녕이 대기·걷기·달리기 개별 GLB 애니메이션 교체

## 사용자 원본 요청

```text
이 애니메이션으로 다시 바꿔줘
```

리뷰 ID: `nwjxtneabhsizrleedrencdjyxllfnlv`

첨부된 `충녕_대기 (1).glb`, `충녕_걷기 (1).glb`, `충녕_달리기 (1).glb`를 사용했다.

## 변경 내용

- 대기 GLB를 충녕이 본체 모델로 교체했다.
- 걷기·달리기 GLB의 clip을 별도 animation source로 로드해 같은 `AnimationMixer`에 `Walk`, `Run`으로 등록했다.
- 동작 GLB의 임시 scene은 clip 추출 직후 geometry, material, texture, skeleton을 해제한다.
- 기존 입력 상태 머신의 Idle → Walk → Run 전환, 700ms 달리기 기준, 지도 배율과 정면 복귀는 유지했다.
- 캐릭터 선택 미리보기에는 외부 동작 파일을 로드하지 않아 기존 정지 미리보기와 불필요한 다운로드 방지를 유지했다.

## 수정 파일

- `src/app/page.home/character-manager.ts`
- `src/app/page.home/avatar-assets.config.ts`
- `src/app/page.home/skeletal-avatar-renderer.ts`
- `src/assets/avatar/README.md`
- `src/assets/avatar/models/chungnyeong-idle.glb`
- `src/assets/avatar/models/chungnyeong-walk.glb`
- `src/assets/avatar/models/chungnyeong-run.glb`
- `tools/avatar-customization.test.ts`
- `devlog.md`
- `devlog/2026-07-21/011-replace-chungnyeong-motion-glbs.md`

## 검증 결과

- 세 파일 모두 Skeleton 1개, bone 41개, SkinnedMesh 1개, clip 1개 및 동일 노드 구조 확인
- Idle: `NlaTrack`, 6초
- Walk: `NlaTrack`, 2.375초
- Run: `NlaTrack`, 약 1.2917초
- CharacterManager 자동 테스트: Idle/Walk/Run 외부 clip 등록과 상태별 재생 성공
- 세 GLB generic validation 성공
- WIZ 일반 빌드 성공
- `git diff --check` 성공

## 남은 리스크

- 지도 최초 진입 시 충녕이용 GLB 3개를 순차 다운로드하므로 네트워크가 느린 환경에서는 첫 표시가 지연될 수 있다.
- 각 파일에 모델과 texture가 중복 포함되어 있어 추후 Blender에서 한 GLB에 세 action을 합치면 전송량을 줄일 수 있다.
