# 예술의전당 카메라 제한을 스크린샷 기준 후방 경계로 정정

- **ID**: 049
- **날짜**: 2026-08-05
- **유형**: 버그 수정
- **리뷰 ID**: `ownvgvdltbsvdxbhluqswcyijzuswubt`

## 작업 요약

직전 작업에서 적용한 ‘가장 멀리 전진한 카메라 위치를 계속 유지’하는 단방향 추적을 제거했다. 이제 스크린샷의 최초 카메라 위치만 후방 한계로 고정하며, 그 위치보다 앞쪽에서는 캐릭터를 따라 전진과 후진을 모두 자유롭게 수행한다. 호수공원과 예술의전당의 공용 카메라 거리 `1300` 설정은 유지했다.

## 원문 요청사항

```text
예술의전당 카메라가 앞으로 이동한 뒤 다시 뒤로 복귀하지 않도록 수정했습니다. 이런 뜻이 아니잖아,, 뒤로 이동은하되 , 스크린샷에 있는 이 카메라 위치 뒤로 이동하지말라는 뜻이야. 이 카메라 위치 앞으로, 앞을로 뒤로는 언제든지 이동할 수 있어
```

## 변경 파일 목록

- `react-app/src/game/cameraFollow.ts`: 최장 전진 위치 계산을 제거하고 고정 후방 경계 계산으로 교체
- `react-app/src/game/renderers/VillageMapRenderer.ts`: 누적 전진 상태와 단방향 옵션을 제거하고 스크린샷 기준 고정 경계만 적용
- `react-app/scripts/cameraFollow.test.ts`: 기준점 앞 왕복 허용과 기준점 뒤 이동 차단을 함께 검증하도록 정정
- `src/app/page.home/view.pug`: 운영 iframe 캐시 식별자를 `20260805-camera-rear-limit-v63`으로 갱신
- `src/assets/jochwon-app/index.html`, `src/assets/jochwon-app/assets/index-DkMiVsd-.js`, `src/assets/jochwon-app/assets/GamePage-CVmwQuD2.js`, `src/assets/jochwon-app/assets/GamePage-CA-bDRLw.js`: 정정된 운영 번들 반영
- `devlog.md`, `devlog/2026-08-05/049-correct-arts-camera-rear-limit.md`: 정정 이력 기록

## 검증 결과

- `npm run test:camera-follow` 성공: 2개 테스트 통과
- `npm run test:lake-portals` 성공: 11개 테스트 통과
- `npx tsx --test scripts/artsCenterJump.test.ts` 성공: 4개 테스트 통과
- `npm run build` 성공: 클라이언트 TypeScript, Vite 프로덕션 빌드, 성능 예산 검사, 서버 TypeScript 통과
- WIZ 일반 빌드(`clean: false`) 성공
- React 빌드와 WIZ 정적 엔트리·활성 GamePage 청크 일치 확인
- `git diff --check` 통과

## 남은 리스크

- 실제 운영 화면에서 스크린샷 기준점 바로 앞의 왕복 움직임과 경계 정지 체감은 자동화된 브라우저 입력으로 확인하지 못해 최종 육안 확인이 필요하다.
