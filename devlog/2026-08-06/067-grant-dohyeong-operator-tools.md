# 도형 계정 운영자 승격 및 포탈·카메라 도구 권한 통합

- **ID**: 067
- **날짜**: 2026-08-06
- **유형**: 권한·운영 도구·보안
- **리뷰 ID**: sddkfbsnrglwvdrzmsvmstjjgynbajqc

## 작업 요약

운영 `user` 테이블에서 프로필 이름이 `도형`인 유일한 계정을 확인해 일반 사용자 역할에서 `portal_editor` 역할로 승격했다. 이 역할은 기존 운영자와 동일하게 공용 포탈 변경과 17개 맵 카메라 설정 조회·저장 권한을 제공한다. 스마트시티와 중앙광장의 포탈 이동 버튼도 같은 운영자 권한으로 묶어 일반 사용자에게 노출되지 않도록 했다.

## 원문 요청사항

```text
지금 카메라 수정하는 기능 도형 프로필로 되어있는 사람한테도 사용자 기능이 아니라 운영자 기능으로 전부 다 넣어주라 포탈 변경이나 카메라 각도 수정 등등 전부 다
```

## 변경 파일 목록

- 운영 MySQL `user` 데이터
  - `도형` 프로필과 일치하는 단일 계정의 역할을 `user`에서 `portal_editor`로 변경했다.
- `react-app/src/pages/GamePage.tsx`
  - 스마트시티·중앙광장 포탈 이동 도구를 `canEditPortals` 운영자 권한으로 제한하고 운영자 도구임을 명시했다.
- `react-app/scripts/worldCameraEditor.test.ts`
  - 카메라와 특수 포탈 편집 UI가 동일한 운영자 권한을 사용하는지 검증을 추가했다.
- `react-app/src/runtimeBuild.ts`, `src/app/page.home/view.pug`, `src/assets/jochwon-app/`
  - 런타임 빌드 ID를 `20260806-operator-tools-dohyeong-v164`로 갱신하고 프로덕션 번들을 동기화했다.
- `devlog.md`, `devlog/2026-08-06/067-grant-dohyeong-operator-tools.md`
  - 이번 변경과 검증 결과를 기록했다.

## 확인 결과

- `도형` 일치 계정 1건 및 최종 역할 `portal_editor` 확인
- 카메라 편집기·운영자 포탈 권한 회귀 테스트 6건 통과
- 정부청사 맵 회귀 테스트 5건 통과
- 런타임 엔트리 회귀 테스트 6건 통과
- `npm run build` 성공: 클라이언트 TypeScript, Vite 번들, 성능 예산, 서버 TypeScript 통과
- 성능 예산 통과: 초기 엔트리 246 KiB, 최대 JS gzip 324 KiB, 최대 3D 자산 21.64 MiB
- React `dist`와 WIZ 운영 정적 번들 일치 및 `git diff --check` 통과
- WIZ 프로젝트 일반 빌드 성공

## 남은 리스크

- `도형` 계정으로 실제 로그인해 포탈 이동과 카메라 공용 저장을 수행하는 브라우저 종단 간 수동 검증은 수행하지 않았다.
- 이미 열려 있는 화면은 운영자 권한을 다시 조회하도록 새로고침해야 편집 도구가 표시된다.
