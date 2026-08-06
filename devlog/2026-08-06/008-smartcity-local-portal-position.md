# 스마트시티 정부청사 포탈 현재 위치 이동 유지 수정

- **ID**: 008
- **날짜**: 2026-08-06
- **유형**: 버그 수정
- **리뷰 ID**: ridytcoiyougrnuuwqzebvhpwvhueuoa

## 사용자 요청

```text
내가 정부청사로 가는 포탈 위치 변경할 수 있게 해줘, 현재 위치로 옮기기 눌렀는데 이동 안됨.
```

## 변경 파일

- `react-app/src/game/renderers/VillageMapRenderer.ts`
- `react-app/scripts/smartCityPortalPosition.test.ts`
- `react-app/src/runtimeBuild.ts`
- `src/app/page.home/view.pug`
- `src/assets/jochwon-app/` 빌드 산출물
- `devlog.md`
- `devlog/2026-08-06/008-smartcity-local-portal-position.md`

## 작업 내용

- 스마트시티 정부청사 귀환 포탈은 `sharedPosition: false`인 브라우저별 편집 포탈인데도 2.5초 주기의 공용 포탈 동기화가 서버 기본 좌표를 다시 적용하던 원인을 수정했다.
- 공용 좌표를 적용하는 `setPortalPosition`이 로컬 전용 포탈을 건너뛰도록 해 `현재 위치로 포탈 이동` 직후 위치가 되돌아가지 않게 했다.
- 기존 로컬 저장 키를 유지해 버튼으로 지정한 위치가 재접속 후에도 복원되도록 했다.
- 로컬 전용 설정, 편집 버튼 이벤트, 공용 동기화 제외, 로컬 저장 경로를 확인하는 회귀 테스트 2건을 추가했다.
- 런타임 빌드 ID를 `20260806-smartcity-local-portal-position-v104`로 갱신하고 WIZ 정적 자산을 동기화했다.

## 확인 결과

- 스마트시티 포탈 위치 회귀 테스트 2건 통과.
- `npm run build`: TypeScript·Vite·성능 예산·서버 TypeScript 빌드 성공.
- 성능 예산 검사 통과.
- WIZ `wiz_project_build(clean=false)` 성공.
- 운영 `/home`에서 `20260806-smartcity-local-portal-position-v104` 로드 확인.
- 운영 브라우저에서 캐릭터 이동 후 버튼을 눌러 포탈 좌표가 `x:1167.018, z:1550`으로 변경되는 것을 확인했다.
- 공용 좌표 갱신 주기보다 긴 4.2초 후에도 변경 좌표와 포탈 표시가 유지되는 것을 확인했다.

## 남은 리스크

- 이 포탈 위치는 브라우저 로컬 저장소에 보관되므로 브라우저 데이터 삭제나 다른 기기에서는 다시 지정해야 한다.
