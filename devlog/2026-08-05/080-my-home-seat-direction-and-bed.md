# 마이홈 좌석 방향 보정 및 침대 상호작용 추가

- **ID**: 080
- **날짜**: 2026-08-05
- **유형**: UX 개선
- **리뷰 ID**: eomekrwtkcejfkvaamszzecababygiyc

## 작업 요약

마이홈 식탁 의자 4개는 앉았을 때 식탁 중앙을, 소파 3자리는 출입문을 바라보도록 착석 방향을 보정했다. 침대 옆에 가까워지면 E 안내가 나타나며 E 키나 안내 버튼으로 눕고 다시 일어날 수 있도록 잠자기 상호작용과 자세를 추가했다.

## 원문 요청사항

```text
의자 4개 앉을 때 방향을 식탁으로 보게 해줘, 소파에서도 문쪽 보게 앉게 해줘.. 그리고 침대에 e누르면 잘 수 있게 해줘.
```

## 변경 파일 목록

- `react-app/src/game/renderers/VillageMapRenderer.ts`
  - 의자별 식탁 중심 방향과 소파별 출입문 방향을 기준으로 착석 회전을 계산했다.
  - 매트리스·헤드보드 위치를 기준으로 침대 접근 지점과 눕는 위치·방향을 계산했다.
  - 침대 근처 E 잠자기, 누운 상태 E 일어나기, 침대 옆 복귀와 캐릭터 눕기 자세를 연결했다.
- `react-app/src/pages/GamePage.tsx`
  - `E 버튼으로 잠자기/일어나기` 침대 안내 버튼을 추가했다.
- `react-app/scripts/personalFarmInteractions.test.ts`
  - 식탁·문 기준 좌석 방향과 침대 노드·E 상호작용 회귀 검증을 추가했다.
- `react-app/src/runtimeBuild.ts`, `src/app/page.home/view.pug`
  - 운영 런타임 빌드 ID를 `20260805-my-home-seat-bed-v93`으로 갱신했다.
- `src/assets/jochwon-app/`
  - 최신 React 프로덕션 산출물로 교체하고 이전 해시 번들을 정리했다.

## 확인 결과

- 마이홈 상호작용 회귀 테스트 성공: 5개 통과
- GLB에서 식탁, 출입문, 의자 4개, 소파 3개, 매트리스와 헤드보드 노드를 확인
- `npm run build` 성공: 클라이언트 TypeScript, Vite 번들, 성능 예산, 서버 TypeScript 통과
- 성능 예산 통과: 초기 엔트리 286 KiB, 최대 JS gzip 310 KiB, 최대 3D 자산 21.64 MiB
- 런타임 엔트리 테스트 성공: 2개 통과
- React `dist`와 WIZ `src/assets/jochwon-app` 전체 파일 일치 확인
- WIZ 일반 빌드(`clean: false`) 성공
- `git diff --check` 통과

## 남은 리스크

- 실제 브라우저에서 캐릭터 모델별 착석 시선과 침대 눕기 높이를 확인하는 수동 시각 검증은 수행하지 않았다.
- 캐릭터 체형에 따라 침대 위 높이와 머리 위치에 미세 조정이 필요할 수 있다.
