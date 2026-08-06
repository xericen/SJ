# 확대형 체험 중 마이홈 이동 버튼 동시 숨김

- **ID**: 038
- **날짜**: 2026-08-06
- **유형**: UX 개선
- **리뷰 ID**: uieobisoicxojmbqqtpwasqphrczmjte

## 원문 요청사항

```text
뭐 키오스크를 확대해서 보든, 트럭을 확대해서 보든 할 때, 나가기 버튼이나 다른 버튼 들이 일시적으로 사라지잖아, 마이홈 버튼도 동일하게 변경해줘
```

## 작업 요약

음식 트럭, 모집센터 키오스크, 프로젝트실 키오스크·전광판, 정부청사 화면, 전망대 망원경의 확대 상태에서 마이홈 이동 버튼도 기존 HUD와 함께 숨도록 표시 규칙을 통일했다. 확대를 종료하면 활성 마커가 제거되면서 별도 상태 처리 없이 버튼이 다시 표시된다. 마이홈 내부 상단 메뉴에도 같은 규칙을 적용해 동작의 일관성을 유지했다.

## 변경 파일 목록

- `react-app/src/pages/GamePage.css`: 확대 상태 6종에서 마이홈 이동 버튼·마이홈 상단 메뉴 숨김
- `react-app/scripts/personalFarmInteractions.test.ts`: 확대 상태별 표시 규칙 회귀 검사 추가
- `react-app/src/runtimeBuild.ts`: 런타임 빌드 ID를 `20260806-hide-my-home-during-focus-v135`로 갱신
- `src/app/page.home/view.pug`: iframe 빌드 쿼리 갱신
- `src/assets/jochwon-app/`: 최신 React 프로덕션 빌드 동기화
- `devlog.md`
- `devlog/2026-08-06/038-hide-my-home-button-during-focus.md`

## 검증 결과

- `npm run test:personal-farm-interactions`: 9개 테스트 성공
- `npm run build`: 성공
- TypeScript 클라이언트·서버 컴파일 및 성능 예산 검사: 성공
- `npm run test:runtime-entry`: 6개 테스트 성공
- WIZ 프로젝트 일반 빌드(`clean: false`): 성공
- 운영 `/home`: HTTP 200
- 운영 런타임 `20260806-hide-my-home-during-focus-v135` 확인
- 운영 CSS에서 확대 상태 6종의 마이홈 버튼 숨김 규칙 확인
- `git diff --check`: 성공

## 남은 리스크

- 새 확대형 체험이 추가될 때 별도의 활성 마커를 사용한다면 해당 마커도 공통 숨김 규칙에 함께 등록해야 한다.
