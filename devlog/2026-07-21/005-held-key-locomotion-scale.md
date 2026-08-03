# 방향키 지속 시간 기반 이동 애니메이션 및 캐릭터 확대

## 사용자 원본 요청

```text
가만히 있을 땐 -> 대기 애니메이션 방향키 눌렀을 때 -> 걷기 애니메이션,
길게 누르면 -> 뛰기 애니메이션으로 바꿔줘. 그리고 캐릭터 크기 좀 키워줘
```

리뷰 ID: `nwjxtneabhsizrleedrencdjyxllfnlv`

## 변경 내용

- 방향키 입력이 없으면 이동 감속과 무관하게 Idle로 즉시 복귀하도록 했다.
- 방향키 입력 직후 Walk, 0.72초 이상 유지하면 Run 상태를 선택하도록 입력 지속 시간을 애니메이션 상태와 직접 연결했다.
- 실제 위치 이동 속도 보간은 기존대로 유지해 지도 이동감이 갑자기 튀지 않게 했다.
- 지도 3D 아바타 scale 기준을 31에서 39로 올려 약 26% 확대했다.

## 수정 파일

- `src/app/page.home/character-movement.ts`
- `src/app/page.home/view.ts`
- `src/app/page.home/skeletal-avatar-renderer.ts`
- `tools/avatar-customization.test.ts`
- `devlog.md`
- `devlog/2026-07-21/005-held-key-locomotion-scale.md`

## 검증 결과

- 자동 테스트: 입력 직후 Walk, 0.75초 유지 후 Run, 키 해제 후 Idle 확인
- CharacterManager Idle·Walk·Run clip 별칭 재생 테스트: 성공
- 충녕이 GLB generic 검증: 성공
- WIZ 일반 빌드: 성공
- `git diff --check`: 성공

## 남은 리스크

- 0.72초 Run 전환 시간과 26% 확대 비율은 실제 화면 체감에 따라 추가 조정될 수 있다.
- 모바일에는 방향키 입력 UI가 없어 현재 전환은 데스크톱 키보드 입력에 적용된다.
