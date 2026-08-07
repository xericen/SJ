# 최신 원본 멀티플레이 검증 및 마이홈 개인팜 전체 이식

- **ID**: 066
- **날짜**: 2026-08-06
- **유형**: 원본 동기화·Socket.IO·개인팜·3D 자산·MySQL
- **리뷰 ID**: cbupikfgnxpmqlzegbqgvmhxwhnvmtwu
- **원본 기준 커밋**: `e346a2e7a77a328f0ad5be5ea5da7e721df62467`

## 작업 요약

요청 저장소의 최신 커밋을 비교해 기존 WIZ 자체 Socket.IO 멀티플레이를 유지·실검증하고, 최신 개인팜 기능을 현재 프로젝트에 이식했다. 사용자 노출 명칭은 `마이홈`으로 유지하면서 수목원 14종 수집, 마이홈 5칸 화단 식재·제거, 베어트리파크 5개 먹이 지점과 최종 곰 급여·춤, 진행도와 보상 저장을 React·WIZ API·MySQL 양쪽에 반영했다.

## 원문 요청사항

```text
# ReviewOps Codex 작업 요청

아래 요청을 현재 프로젝트 루트에서 처리하세요. 필요한 파일을 직접 수정하고, 마지막 응답은 한국어로 간결하게 작성하세요.
스트리밍 응답은 사용하지 않습니다. 작업이 끝난 뒤 변경 요약, 확인한 내용, 남은 리스크만 정리하세요.
이 작업의 세션 단위는 아래 리뷰 ID입니다. 리뷰 ID가 같으면 같은 Codex 히스토리 맥락으로 이어서 처리하세요.

## 사용자 요청

지금 https://github.com/LeeDoHyung760/JoChiWon-Communications 여기 있는 멀티 플레이 기능(사람 공동 접속하고 1대1 대화되는 채팅방 형성)이랑 기존 마이홈 기능이 개인팜 기능으로 되어있거든 마이홈으로 이름은 유지 하고 식물 심는거나 곰한테 먹이주는거 등등 해서 개인팜 가꾸는 기능 넣어놨단 말이야 그 기능 전부 다 가져와줘봐 멀티플레이 기능이 서버쪽에 있는데 여기는 자체 서버여서 못가져온다면 사실대로 못가져 온다고 말해주고 테스트하고 실제로 된 기능만 테스트 완료 되었다고 알려줘

## 리뷰 요약

- 리뷰 ID: cbupikfgnxpmqlzegbqgvmhxwhnvmtwu
- 제목: 멀티 서버
- 요청 링크: https://sj.wizide.com/home
- Codex 요청자: 김민주
- 프로젝트 루트: /opt/app
- Codex 세션 ID: 신규
- Codex 모델: 5.6 sol (gpt-5.6-sol)
- Codex 추론수준: medium (medium)
- 스크린샷 컨텍스트: 없음
- 에이전트 작업 지시서 컨텍스트: 없음
- HTML 문서 생성 규칙 컨텍스트: 없음
- HTML 문서 설정 컨텍스트: 없음
- HTML 프로젝트 인스트럭션 파일: 없음
- 첨부파일 컨텍스트: 0개
```

## 변경 파일 목록

- `react-app/shared/personal-farm.ts`, `react-app/shared/flower-interest.ts`, `react-app/shared/garden-flower-assets.ts`
  - 14종 식물, 5칸 화단, 자연 챕터와 3D 자산 계약을 추가했다.
- `react-app/src/components/PersonalFarmProgressExperience.tsx`, `react-app/src/components/PersonalFarmGuide.css`
  - `마이홈` 명칭을 유지한 정원 현황, 식재·제거, 먹이 수집·급여 진행 UI를 반영했다.
- `react-app/src/components/GreenhouseExperience.tsx`, `react-app/src/components/GreenhouseExperience.css`
  - 수목원 14종 도감과 마이홈 수집 상태 연동을 추가했다.
- `react-app/src/game/renderers/VillageMapRenderer.ts`, `react-app/src/game/personalFarmLayout.ts`
  - 5개 화단의 실제 식물 GLB, 제거 상호작용, 5개 먹이 지점과 곰 급여 완료 춤을 구현했다.
- `react-app/src/services/personalFarmApi.ts`, `react-app/src/services/flowerInterestProfile.ts`, `react-app/src/services/flowerAssetNodes.ts`, `react-app/src/services/flowerAssetFactory.ts`, `react-app/src/services/bearStatueAssetFactory.ts`
  - 진행도 API·식물 자산 생성·곰 자산 복제 로직을 확장했다.
- `react-app/src/assets/characters/bear.glb`
  - 원본의 급여 대상 곰 3D 모델을 추가했다.
- `react-app/server/src/models/PersonalFarmProgress.ts`, `react-app/server/src/routes/personalFarm.ts`, `react-app/server/src/services/personalFarmProgressService.ts`
  - MySQL 진행도에 5칸 식재·제거와 자연 챕터 완료·보상 규칙을 반영했다.
- `src/app/page.home/api.py`
  - WIZ 자체 API에도 같은 14종·5칸·제거·보상 규칙을 구현했다.
- `react-app/scripts/personalFarmLatest.test.ts`, `react-app/scripts/verifyWizDirectChat.ts`, `react-app/server/src/services/personalFarmProgressService.test.ts`, `react-app/package.json`
  - 최신 개인팜 계약과 실제 WIZ 두 계정 멀티플레이·1:1 대화 검증을 추가했다.
- `react-app/src/runtimeBuild.ts`, `src/app/page.home/view.pug`, `src/assets/jochwon-app/`
  - 빌드 ID를 `20260806-upstream-myhome-v163`으로 갱신하고 최종 React 번들을 WIZ 자산에 동기화했다.
- `devlog.md`, `devlog/2026-08-06/066-import-upstream-multiplayer-myhome-farm.md`
  - 이번 작업과 검증 결과를 기록했다.

## 확인 결과

- 요청 GitHub 저장소 최신 커밋 `e346a2e`와 기존 이식 상태 비교 완료
- WIZ 로컬 서버에서 임시 로그인 계정 2개로 동시 접속, 이동 동기화, 맵 분리 검증 통과
- 같은 두 계정으로 1:1 대화 요청·수락·메시지 송수신·방 종료 검증 통과 후 계정 정리
- 최신 개인팜 계약 테스트 4개 및 기존 마이홈 상호작용 회귀 테스트 10개 통과
- 실제 `sj_hackathon` MySQL 연결을 포함한 서버 테스트 60개 통과
- React·Express 전체 빌드, Vite 성능 예산 검사 통과
- React `dist`와 WIZ 정적 자산 디렉터리 전체 일치 확인
- WIZ 프로젝트 `main` 일반 빌드 성공

## 남은 리스크

- 브라우저 화면에서 수목원 수집부터 마이홈 식재·제거, 곰 급여까지 전 과정을 사람이 직접 조작하는 E2E 검증은 수행하지 않았다.
- 현재 WIZ Socket.IO의 접속 상태는 단일 서버 프로세스 메모리에 있고 1:1 기록은 로컬 SQLite에 저장된다. 여러 서버 인스턴스로 확장하려면 공유 Socket.IO 어댑터와 공유 DB가 필요하다.
