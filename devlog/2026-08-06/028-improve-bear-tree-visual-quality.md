# 베어트리파크 화질 및 캐릭터 닉네임 가독성 개선

- **ID**: 028
- **날짜**: 2026-08-06
- **유형**: UX·3D 렌더링
- **리뷰 ID**: fcxythrwehrrelwteeqgegazjvkxooaz

## 작업 요약

베어트리파크의 저해상도 전용 설정을 해제하고 안티앨리어싱, 2048 텍스처, 1.25 픽셀 배율을 적용했다. 멀어진 직교 카메라에서도 닉네임이 이전 체감 크기로 보이도록 로컬·원격 캐릭터와 NPC 이름표를 카메라 거리 배율만큼 확대했다.

## 원문 요청사항

```text
베어트리 파크에 왔을 때 화질이 너무 깨지는 거 같은데, 이 부분 수정해줘, 그리고 캐릭터 닉네임이 너무 잘 안 보임 수정
```

## 변경 파일 목록

- `react-app/src/game/renderers/VillageMapRenderer.ts`
  - 베어트리파크의 텍스처 제한을 `512 → 2048`, 픽셀 배율을 `0.75 → 1.25`로 높였다.
  - 안티앨리어싱과 균형 텍스처 품질을 활성화하고 자동 해상도 하락을 비활성화했다.
  - 맵별 이름표 배율을 추가해 베어트리파크 캐릭터 이름표를 `5/3`배 확대했다.
- `react-app/scripts/bearTreeVisualQuality.test.ts`, `react-app/package.json`
  - 렌더링 품질과 이름표 배율을 검증하는 회귀 테스트를 추가했다.
- `react-app/src/runtimeBuild.ts`, `src/app/page.home/view.pug`
  - 런타임 빌드 ID를 `20260806-bear-tree-visual-quality-v125`로 갱신했다.
- `src/assets/jochwon-app/`
  - 최신 React 프로덕션 산출물로 동기화했다.

## 확인 결과

- 베어트리파크 화질·카메라·포탈·포토존 및 런타임 회귀 테스트 22건 통과
- `npm run build` 성공: 클라이언트 TypeScript, Vite 번들, 성능 예산, 서버 TypeScript 통과
- 성능 예산 통과: 초기 엔트리 246 KiB, 최대 JS gzip 324 KiB, 최대 3D 자산 21.64 MiB
- React `dist`와 WIZ `src/assets/jochwon-app` 전체 파일 일치 확인
- WIZ 일반 빌드(`clean: false`) 성공
- 운영 `/home`, 엔트리 및 GamePage 청크 HTTP 200 확인
- 운영 GamePage 청크와 로컬 빌드 산출물의 SHA-256 일치 확인
- `git diff --check` 통과

## 남은 리스크

- 픽셀 배율과 텍스처 해상도를 높여 저사양 기기에서는 베어트리파크 프레임 속도가 이전보다 낮아질 수 있다.
- 기존 마이홈 실내 카메라 변경에서 남은 월드 이동 테스트 기대값 불일치 1건은 이번 요청 범위 밖이라 유지했다.
- 운영 브라우저에서 다양한 화면 배율과 기기로 이름표 가독성을 확인하는 수동 시각 검증은 수행하지 않았다.
