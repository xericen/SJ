# 체험용 베어트리파크 GLB 이동 복구

## 사용자 요청

> 체험용에서 베어트리파크 포털에 3초 머물러도 이동되지 않고 `Invalid typed array length: 4` GLB 오류가 발생하는 문제를 해결해 주세요.

## 원인

- 원본, 빌드, 운영 베어트리파크 GLB는 모두 동일한 13.8MB 파일이며 GLB 헤더와 선언 길이도 정상이었습니다.
- 오류는 GLTFLoader가 GLB 식별용 첫 4바이트를 읽기 전에 빈 배열을 전달받은 위치에서 발생해 브라우저의 불완전 캐시 응답이 파서까지 전달된 경우로 확인했습니다.

## 변경 내용

- 베어트리파크 GLB 응답의 magic, 최소 헤더 크기와 선언 파일 길이를 파싱 전에 검증합니다.
- 응답이 비었거나 잘렸으면 캐시 우회 쿼리와 `reload` 정책으로 한 번 다시 요청합니다.
- 실패한 모델 Promise는 기존 캐시에서 제거해 다음 입장도 다시 시도할 수 있게 유지했습니다.

## 변경 파일

- `react-app/src/utils/createGltfLoader.ts`
- `react-app/src/game/renderers/VillageMapRenderer.ts`
- `react-app/scripts/bearTreeGlbRecovery.test.ts`
- 운영 빌드 산출물
- `devlog.md`
- `devlog/2026-08-09/017-fix-bear-tree-glb-cache-recovery.md`

## 확인 결과

- 베어트리파크 GLB 원본 헤더·전체 길이 검증 성공
- 빈 응답 차단 및 베어트리파크 전용 검증 로더 회귀 테스트 통과
