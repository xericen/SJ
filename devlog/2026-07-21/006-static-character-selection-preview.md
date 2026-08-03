# 캐릭터 선택 3D 미리보기 애니메이션 정지

## 사용자 원본 요청

```text
캐릭터 고르는 곳에서 얘 애니메이션 뺴고 그냥 가만히 있게 해줘
```

리뷰 ID: `nwjxtneabhsizrleedrencdjyxllfnlv`

## 변경 내용

- `CharacterManager.loadCharacter`에 `autoPlay` 옵션을 추가했다.
- 캐릭터 선택 미리보기는 첫 Idle 프레임을 적용한 뒤 action을 pause해 정적인 포즈로 표시한다.
- 지도 렌더러는 기존 기본값 `autoPlay = true`를 유지해 Idle·Walk·Run 동작에 영향을 주지 않는다.
- 이후 재생 API를 호출하면 pause 상태가 자동 해제되도록 처리했다.

## 수정 파일

- `src/app/page.home/character-manager.ts`
- `src/app/page.home/avatar-preview-renderer.ts`
- `tools/avatar-customization.test.ts`
- `devlog.md`
- `devlog/2026-07-21/006-static-character-selection-preview.md`

## 검증 결과

- 미리보기용 `autoPlay: false` 로드 후 첫 clip pause 확인
- 이후 `playAnimation` 호출 시 pause 해제 확인
- CharacterManager·이동 상태 자동 테스트: 성공
- WIZ 일반 빌드: 성공
- `git diff --check`: 성공

## 남은 리스크

- 정지 화면은 Idle clip의 첫 프레임을 사용하므로 GLB의 첫 프레임 포즈가 바뀌면 미리보기 자세도 달라질 수 있다.
