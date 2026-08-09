# 동아리 거리제 Meshopt GLB 로딩 오류 수정

## 사용자 요청

> `THREE.GLTFLoader: setMeshoptDecoder must be called before loading compressed files` 오류로 동아리 거리제 GLB를 가져오지 못하는 문제를 해결해 주세요.

## 원인

- 메인 월드 로더에는 Meshopt 디코더가 설정되어 있었지만 캐릭터 미리보기, 주민·보상 오브젝트 및 식물 자산의 독립 `GLTFLoader`에는 설정이 없었습니다.
- 동아리 거리제 진입 시 여러 GLB가 병렬 로딩되면서 디코더 없는 경로가 Meshopt 압축 자산을 먼저 처리할 수 있었습니다.

## 변경 내용

- Meshopt 디코더를 생성 즉시 등록하는 공용 `createGltfLoader` 팩토리를 추가했습니다.
- 메인 맵, 주민 GLB, 캐릭터 미리보기, 곰 보상과 식물 GLB 로더를 모두 공용 팩토리로 통일했습니다.
- 동아리 거리제 GLB의 `EXT_meshopt_compression` 사용 여부와 전체 런타임 로더 적용 범위를 회귀 테스트로 고정했습니다.

## 변경 파일

- `react-app/src/utils/createGltfLoader.ts`
- `react-app/src/game/renderers/VillageMapRenderer.ts`
- `react-app/src/components/ThreeCharacterPreview.tsx`
- `react-app/src/services/bearStatueAssetFactory.ts`
- `react-app/src/services/flowerAssetFactory.ts`
- `react-app/scripts/meshoptLoaderCoverage.test.ts`
- `src/app/page.home/view.pug`
- `src/assets/jochwon-app/index.html`
- `src/assets/jochwon-app/assets/*` (빌드 산출물)
- `devlog.md`
- `devlog/2026-08-09/012-fix-club-street-meshopt-loader.md`

## 확인 결과

- 동아리 거리제·Meshopt 회귀 테스트 4건 통과
- React TypeScript, Vite, 서버 빌드 및 성능 예산 검사 성공
