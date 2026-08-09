# 공용 SejongPark 세종호수공원 GLB 교체

## 사용자 요청

> 공용파일 SejongPark로 현재 세종호수공원 GLB를 변경하고 홈 페이지와 공간안내 페이지의 세종호수공원 3D GLB도 변경해 주세요.

## 변경 내용

- 첨부된 `/opt/app/SejongPark.glb`를 공통 원본 `react-app/src/assets/maps/sejong-lake-park.glb`로 교체했습니다.
- 실제 세종호수공원 월드, 홈 대표 공간과 공간안내가 모두 동일한 공통 GLB URL을 사용함을 확인했습니다.
- 홈과 공간안내에 표시되는 모델 용량을 새 파일 기준 3.9MB로 수정했습니다.

## 변경 파일

- `react-app/src/assets/maps/sejong-lake-park.glb`
- `react-app/src/pages/LandingPage.tsx`
- `react-app/scripts/sejongParkModelReplacement.test.ts`
- 운영 빌드 산출물
- `devlog.md`
- `devlog/2026-08-09/019-replace-sejong-lake-park-glb.md`

## 확인 결과

- 첨부 파일과 교체 원본 SHA-256 일치
- GLB 2.0 magic 및 선언 파일 길이 검증 성공
- 월드·홈·공간안내 공통 GLB 참조 회귀 테스트 통과
