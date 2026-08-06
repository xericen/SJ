# 남성형1 걷기·달리기 고개 위치 보정

- **ID**: 010
- **날짜**: 2026-08-06
- **유형**: 버그 수정
- **리뷰 ID**: zredfdubmbofgcumceccesavpegbuqvy

## 원문 요청사항

```text
남성 1 캐릭터 모션 3개밖에 없는 그 ㅐ릭터가 가만히 있을 땐 괜찮은데, 걷거나 뛸 때 고개가 너무 위로 올라간 느낌이라 여자1처럼 고개 수정해줘 위치
```

## 작업 요약

남성형1 모델의 대기 자세 보정값은 유지하고, 걷기와 달리기에만 추가되던 고개 들림 각도를 제거했다. 세 모션 모두 동일한 중립 보정값을 사용하도록 맞춰 여자형1의 이동 모션처럼 걷거나 뛸 때 고개가 위로 들리지 않게 했다. 새 런타임 빌드 ID를 적용하고 React 프로덕션 산출물을 WIZ 정적 자산에 동기화했다.

## 변경 파일 목록

- `react-app/src/game/renderers/VillageMapRenderer.ts`: 남성형1 걷기·달리기 고개 피치 보정을 대기 모션의 중립값과 동일하게 조정
- `react-app/src/runtimeBuild.ts`: 런타임 빌드 ID를 `20260806-boy1-neutral-head-pose-v106`으로 갱신
- `src/app/page.home/view.pug`: iframe 빌드 쿼리 갱신
- `src/assets/jochwon-app/`: 최신 React 프로덕션 빌드 동기화 및 이전 해시 산출물 정리
- `devlog.md`
- `devlog/2026-08-06/010-boy1-neutral-head-pose.md`

## 검증 결과

- 남성형1 고개 보정값 정적 확인: `idle: 15`, `walk: 15`, `run: 15`
- `npm run build`: 성공
- TypeScript 클라이언트·서버 컴파일: 성공
- Vite 프로덕션 빌드 및 성능 예산 검사: 성공
- React `dist`와 WIZ `src/assets/jochwon-app` 파일 내용 일치 확인
- WIZ 프로젝트 일반 빌드(`clean: false`): 성공
- `git diff --check`: 성공

## 남은 리스크

- 실제 모니터와 카메라 각도에서의 체감은 정적·빌드 검증만으로 완전히 확인할 수 없어 운영 화면에서 남성형1 걷기·달리기 모션을 한 차례 시각 확인하는 것이 좋다.
