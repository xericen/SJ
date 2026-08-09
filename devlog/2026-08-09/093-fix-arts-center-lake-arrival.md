# 예술의전당→세종호수공원 귀환 구조물 도착 방지

## 사용자 요청

현재 예술의 전당 들어갔다 세종 호수공원으로 나올 때 구조물 위에 걸리는 현상을 해결한다.

## 변경 파일

- `react-app/src/game/worldPortalArrivals.ts`
- `react-app/scripts/lakePortals.test.ts`
- `devlog.md`
- `devlog/2026-08-09/093-fix-arts-center-lake-arrival.md`

## 변경 내용

예술의전당에서 세종호수공원으로 이동할 때 호수공원 내부 예술의전당 포탈 좌표를 재사용하지 않고, 구조물과 겹치지 않도록 기존 고정 안전 스폰(`FIXED_LAKE_RESPAWN`)을 사용하게 했다.

## 검증

예술의전당 귀환 전용 회귀 테스트 통과, React 프로덕션 빌드·성능 검사 통과, WIZ 프로젝트 빌드 성공.

기존 SUIT 폰트 경로의 런타임 해석 경고는 남아 있으나 이번 이동 수정과 무관하다.
