# 17개 맵 권한형 카메라 편집 바 및 공용 프로필 저장

- **ID**: 056
- **날짜**: 2026-08-06
- **유형**: UX·3D 카메라·공용 설정
- **리뷰 ID**: uieobisoicxojmbqqtpwasqphrczmjte

## 작업 요약

공간 안내의 17개 맵에 편집 권한 사용자 전용 `카메라 위치 조절` 바를 추가했다. 각 맵에서 캐릭터 크기, 카메라 높이 각도, 좌우 각도, 캐릭터와 카메라 거리, 카메라가 바라보는 높이, 시야각을 슬라이더로 즉시 미리볼 수 있다. 저장한 맵별 설정은 WIZ 공용 DB에 기록되어 이후 접속하는 모든 사용자에게 적용되며, 일반 사용자는 설정값만 적용되고 편집 UI는 볼 수 없다.

## 원문 요청사항

```text
각 17개의 맵 상단에 카메라 위치 조절 할 수 있게 바 만들어서 각 맵 내가 위치 조절할 수 있게 해주라,, 캐릭터 크기, 맵각도, 캐릭터와 카메라 거리, 맵과 카메라 거리 등
```

## 변경 파일 목록

- `react-app/src/components/WorldCameraEditor.tsx`, `react-app/src/components/WorldCameraEditor.css`
  - 상단 편집 바, 6개 슬라이더, 즉시 미리보기, 공용 저장, 기본값 복원을 구현하고 확대형 체험 중에는 숨기도록 했다.
- `react-app/src/services/worldCameraProfiles.ts`
  - 17개 맵별 프로필 검증 범위와 WIZ 공용 조회·저장·초기화 호출을 추가했다.
- `react-app/src/game/renderers/VillageMapRenderer.ts`, `react-app/src/game/GameCanvas.tsx`
  - 캐릭터 크기와 추적 카메라 거리·각도·타깃 높이·FOV를 실시간 반영하고, 저장 프로필을 맵 로드 시 적용하도록 연결했다.
- `react-app/src/pages/GamePage.tsx`
  - 기존 포탈 편집 권한과 동일한 권한으로 편집기를 노출하고 편집 중 캐릭터 이동 입력을 잠갔다.
- `src/app/page.home/api.py`, `src/model/db/world_camera_profiles.py`, `src/model/struct.py`
  - 권한 검증, 17개 맵·숫자 범위 검증, 맵별 공용 카메라 프로필 DB 저장을 구현했다.
- `react-app/scripts/worldCameraEditor.test.ts`, `react-app/package.json`
  - 대상 맵, 값 범위, UI·렌더러 연결, 권한 및 ORM 저장소 회귀 테스트를 추가했다.
- `react-app/src/runtimeBuild.ts`, `src/app/page.home/view.pug`, `src/assets/jochwon-app/`
  - 운영 런타임을 `20260806-world-camera-editor-v155`로 갱신하고 프로덕션 자산을 동기화했다.
- `devlog.md`, `devlog/2026-08-06/056-world-camera-editor.md`
  - 이번 변경과 검증 결과를 기록했다.

## 확인 결과

- 카메라 편집기 테스트 5건, 월드 카메라·이동 테스트 5건, 마이홈 상호작용 테스트 10건, 런타임 엔트리 테스트 6건 통과
- `npm run build` 성공: 클라이언트 TypeScript, Vite 번들, 성능 예산, 서버 TypeScript 통과
- 성능 예산 통과: 초기 엔트리 246 KiB, 최대 JS gzip 324 KiB, 최대 3D 자산 21.64 MiB
- Python API·ORM 모델 구문 검사 및 `git diff --check` 통과
- WIZ 일반·클린 빌드와 동일 프로세스 IDE 빌드 성공
- 운영 정적 엔트리 `index-DJfgS-XN.js` 및 GamePage 번들에서 편집 UI와 공용 API 호출 포함 확인
- 운영 공용 조회 API HTTP 200, 비로그인 응답 `profiles: []`, `canEdit: false` 확인
- 비로그인 저장 요청이 카메라 설정 권한 메시지와 함께 차단되는 것 확인

## 남은 리스크

- 요청자 로그인 세션으로 실제 값을 저장하고 새 브라우저에서 동일 값이 적용되는 종단 간 수동 검증은 수행하지 않았다.
- 이미 맵을 연 사용자는 저장 직후 자동 갱신되지 않으며, 맵 재입장 또는 페이지 새로고침 시 최신 공용 설정을 받는다.
- 허용 범위의 극단값에서는 일부 맵의 바깥 여백이나 지형 가장자리가 보일 수 있어 기본값 복원 기능을 함께 제공한다.
