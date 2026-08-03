# 비버 유지 및 충녕이 GLB 선택 모델 추가

## 사용자 원본 요청

```text
비버 모델은 그대로 두고, 충녕이 모델 추가해줘.
```

리뷰 ID: `nwjxtneabhsizrleedrencdjyxllfnlv`

## 첨부 모델 분석

- 기본·대기·걷기·달리기 GLB 4개를 비교했다.
- 네 파일 모두 binary chunk SHA-256이 같고 JSON 차이는 Mesh/Material/Node UUID와 이미지 이름뿐이다.
- 각 파일: SkinnedMesh 1개, Skeleton 1개, bone 41개, vertex 18,256개, triangle 22,436개
- animation clip은 네 파일 모두 0개다.
- 중복된 약 9.9MB 파일 4개를 모두 배포하지 않고 `충녕이 (1).glb` 하나를 대표 모델로 사용했다.

## 변경 내용

- 비버 `cozy-beaver`를 기본 첫 번째 선택 모델로 유지했다.
- `chungnyeong`을 두 번째 활성 모델로 등록했다.
- 원본 GLB를 `/assets/avatar/models/chungnyeong.glb`로 추가했다.
- 실제 Three.js 렌더 결과를 `chungnyeong-preview.png`로 만들어 모델 카드에 적용했다.
- 충녕이 높이를 비버와 유사하게 보이도록 scale 1.9로 설정했다.
- +Z 앞면을 확인하고 `frontRotationY = 0`을 적용했다.
- 기존 CharacterManager의 Box3 지면 정렬, 미리보기 회전, 지도 렌더링, 저장 구조를 그대로 재사용했다.
- 충녕이는 Skeleton이 있지만 clip이 없는 상태임을 선택 화면 안내 문구에 표시했다.
- 선택 저장값 정규화 목록에 `chungnyeong`을 추가했다.

## 수정 파일

- `src/assets/avatar/models/chungnyeong.glb`: 충녕이 대표 GLB
- `src/assets/avatar/models/chungnyeong-preview.png`: 실제 렌더 기반 선택 카드 이미지
- `src/app/page.home/avatar-assets.config.ts`: 충녕이 모델 metadata 및 rig 상태
- `src/app/page.home/avatar-customization.model.ts`: 충녕이 선택값 저장 허용
- `src/app/page.home/view.ts`, `view.pug`: 모델별 rig 안내 문구
- `src/assets/avatar/README.md`: 충녕이 구조 및 첨부 파일 분석 기록
- `tools/avatar-customization.test.ts`: 활성 모델·GLB Skeleton/bone/vertex 검사
- `devlog.md`, `devlog/2026-07-21/003-add-chungnyeong-character.md`: 작업 기록

## 검증 결과

- 원본과 프로젝트 충녕이 GLB SHA-256 일치: `0de227fa...d0509`
- WIZ 일반 빌드: 성공
- CharacterManager/registry 자동 테스트: 성공
- 충녕이 GLB generic 검사: 성공
- 실제 Chromium GLB 요청: HTTP 200
- 회원가입 모델 카드에서 비버·충녕이 두 모델 노출 확인
- 충녕이 정면 전신, 지면 접지, 미리보기 framing 확인
- 충녕이 선택 후 지도 표시 및 localStorage 저장 확인
- 콘솔 진단: SkinnedMesh true, Skeleton 1, bone 41, animation 0
- 브라우저 console/page error: 0건
- `git diff --check`: 성공

## 남은 리스크

- 첨부된 걷기·달리기·대기 GLB에도 AnimationClip이 없어 현재 충녕이 관절은 재생되지 않는다.
- 실제 동작을 위해서는 같은 Skeleton에 AnimationClip이 포함된 GLB 또는 별도 animation GLB가 필요하다.
- 충녕이 Material/Mesh가 단일 구성이라 기존 파츠별 커스터마이징은 지원하지 않는다.
