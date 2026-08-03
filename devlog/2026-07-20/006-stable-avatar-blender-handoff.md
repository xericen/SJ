# 불량 자동 생성 아바타 비활성화 및 Blender GLB 연동 준비

## 사용자 원본 요청

```text
현재 실제 브라우저 결과를 확인한 결과, 신규 GLB 모델이 서비스에 사용할 수 없는 품질이다.

- GLB 생성 스크립트로 사람 캐릭터 외형을 자동 생성하는 작업을 중단한다.
- 현재 생성된 액티브 체형 v2 모델은 기본 모델로 사용하지 않는다.
- 실제 Blender에서 제작하거나 정상적인 rigged GLB 파일을 가져와 교체한다.
- Codex는 모델링이 아니라 웹 연결, 파츠 선택, 색상 변경, 애니메이션 연결을 담당한다.
- 실제 Blender 모델이 준비되기 전에는 안정적인 기존 모델을 사용자에게 보여줄 것.
```

리뷰 ID: `nwjxtneabhsizrleedrencdjyxllfnlv`

## 원인 분석

- production 설정이 코드 생성 v2 GLB를 직접 기본 경로로 사용해 시각 품질 검수 없이 사용자에게 노출됐다.
- v2는 custom/primitive 기반 곡면을 자동 생성했으나 아티스트가 정리한 topology, 의상 fit, 얼굴/액세서리 anchor, 관절 weight 품질을 확보하지 못했다.
- 의상과 신체가 별도 생성된 SkinnedMesh여서 실루엣과 bind/weight가 자연스럽게 이어지지 않았다.
- capability와 저장 DTO가 모델 지원 범위를 제한하지 않아 존재하지 않거나 불량한 파츠를 다시 선택할 수 있었다.

## 복구 및 연동 구조

- production 버전을 `stable`로 전환하고 `/assets/avatar/toy-avatar.glb`만 사용자에게 노출했다.
- v2 GLB는 `assets/avatar/experimental/`로 격리하고 feature flag 기본값을 껐다.
- 기존 `toy-active` 및 미지원 파츠 저장값을 안정 모델 capability에 맞게 자동 migration한다.
- Blender v3 경로 두 개를 registry에 준비하되 `enabled: false`, `verified: false`로 두어 파일 투입만으로 공개되지 않게 했다.
- runtime validator와 CLI validator가 크기, transform, 필수 본/클립, SkinnedMesh, Material, 상자형 몸통, 관절 간격, 액세서리 범위를 검사한다.
- fallback은 검증된 선택 GLB → 안정 GLB → 정적 공용 이미지 순으로 동작한다.
- 사람 외형을 자동 생성하던 v1/v2 생성 스크립트를 제거했다.

## 변경 파일

- `src/app/page.home/avatar-assets.config.ts`: stable registry, v3 비공개 경로, feature flag, 모델 capability, customization constrain 추가
- `src/app/page.home/avatar-customization.model.ts`: 구형 active 저장값 migration 및 안정 모델 범위의 random 생성
- `src/app/page.home/avatar-model-validator.ts`: runtime GLB 품질 검사 추가
- `src/app/page.home/avatar-model-loader.ts`: primary 검증 실패 시 안정 GLB fallback
- `src/app/page.home/avatar-preview-renderer.ts`: asset validation mode 기반 preview load
- `src/app/page.home/skeletal-avatar-renderer.ts`: 지도에서도 동일 registry/validator 사용
- `src/app/page.home/avatar-customizer.ts`: Blender Material 이름 alias 호환
- `src/app/page.home/view.ts`, `view.pug`, `view.scss`: 안정 모델만 노출, 저장 migration, 미지원 옵션 disabled
- `src/assets/avatar/models/BLENDER_MODEL_SPEC.md`: 축·단위·본·클립·Material·파츠·export·승인 규격
- `src/assets/avatar/README.md`: stable/fallback 및 Blender v3 정책으로 갱신
- `src/assets/avatar/experimental/toy-avatar-v2-*.glb`: 불량 v2 production 경로에서 격리
- `tools/validate-avatar-glb.mjs`: Blender GLB 사전 검사 CLI
- `tools/avatar-customization.test.ts`: registry, migration, capability, 재질 격리, validator 테스트
- 삭제: `tools/generate-avatar-glb.mjs`, `tools/generate-avatar-v2-glb.mjs`

## 검증 결과

- WIZ 일반 빌드: 성공
- 커스터마이징/registry 자동 테스트: 성공
- 안정 GLB 검사: 성공(높이 2.097, 9 animation clip)
- 격리된 active v2 strict 검사: 의도대로 실패(높이 2.293, production 등록 차단)
- 실제 Chromium: 안정 모델 preview 및 지도 Canvas 준비 성공
- 저장된 active/미지원 설정 migration 성공
- active 모델 비노출, 미지원 헤어·의상·액세서리 disabled 확인
- 안정 GLB 요청 실패 시 정적 공용 이미지 fallback 확인
- 모바일 390×844 진입 및 브라우저 console/page error 0건
- `git diff --check`: 성공

## 남은 리스크

- 현재 안정 GLB는 임시 fallback이며 최종 시각 품질은 Blender v3 아티스트 모델 납품에 달려 있다.
- 자동 구조 검사는 topology, weight, 관통의 미묘한 시각 품질을 완전히 판정하지 못하므로 활성화 전 육안 검수가 필수다.
- v3의 실제 Mesh/Material 이름이 규격과 다르면 registry capability 및 alias 조정이 필요하다.
