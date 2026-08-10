# 마이홈 꽃 심기·곰 체험소 먹이 수집 E키 상호작용 복구

- **ID**: 104
- **날짜**: 2026-08-10
- **유형**: 버그 수정

## 작업 요약

마이홈 꽃 선택 후 선택 상자에 포커스가 남아 E키가 차단되던 문제를 수정했다. 곰 체험소의 먹이 수집과 마이홈 꽃 심기는 React 전역 키 리스너의 등록 순서와 `defaultPrevented` 상태에 의존하지 않도록 3D 렌더러의 근접 판정에서 전용 이벤트를 발생시키고 진행도 컴포넌트가 저장 API를 실행하도록 연결했다.

## 원문 요청사항

```text
마이홈에서 꽃 심는 거  e 눌러서 심어져야하는데 안됨. 베어트리파크에 e버튼을 먹이 수집되어야하는데 안됨 원인 찾고 해결해줘
```

## 변경 파일 목록

- `react-app/src/game/renderers/VillageMapRenderer.ts`: 꽃 심기 자리·먹이 지점에서 E키 전용 상호작용 이벤트 발생
- `react-app/src/components/PersonalFarmProgressExperience.tsx`: 전용 이벤트에서 꽃 심기·먹이 수집 API 실행, 꽃 선택 후 포커스 해제
- `react-app/scripts/personalFarmInteractions.test.ts`: E키 이벤트 연결 및 포커스 해제 회귀 검사
- `react-app/src/runtimeBuild.ts`, `src/assets/jochwon-app/`: 운영 iframe 캐시 v17 및 React 프로덕션 번들 반영
- `devlog.md`, `devlog/2026-08-10/104-fix-personal-farm-feed-e-interactions.md`: 작업 이력 기록

## 검증 결과

- 개인 팜 E키 신규 회귀 검사 통과
- TypeScript·React·Express 프로덕션 빌드 및 성능 검사 통과
- WIZ 일반 빌드 통과
- `git diff --check` 통과
- 기존 개인 팜 전체 검사 11건 중 8건 통과, 이번 변경과 무관한 오래된 CSS·포맷 기대값 3건 실패
- 기존 SUIT 폰트 런타임 경로 경고는 남아 있으며 이번 변경과 무관함
