# 세종한바퀴 브라우저 탭 브랜딩

- **ID**: 042
- **날짜**: 2026-08-06
- **유형**: 설정 변경
- **리뷰 ID**: adsrjatpngkdwualxeytvjuexjncbtxi

## 작업 요약
브라우저 탭 제목을 기존 “여기 사람 있음 | 세종 로컬 멀티버스”에서 “세종한바퀴”로 변경했다. 서비스 색상과 지도 이동 콘셉트를 반영한 순환 경로·위치 핀 형태의 전용 SVG 파비콘을 추가하고 브라우저·바로가기·모바일 앱 아이콘 메타데이터에 연결했다.

## 원문 요청사항
```text
탭(Tab): 여기 사람 있음 | 세종 로컬 멀티버스가 적혀 있는 하나의 탭
탭 바(Tab Bar): 여러 탭이 나열되어 있는 상단 영역 전체
탭 제목(Tab Title): 여기 사람 있음 | 세종 로컬 멀티버스라는 텍스트
파비콘(Favicon): 왼쪽의 작은 아이콘
탭 닫기 버튼(Close Button): 오른쪽의 ×
만약 발표나 UI 설계 문서에서 표현한다면 다음과 같이 쓰는 것이 자연스럽습니다.
브라우저 탭
웹 브라우저 상단 탭
탭 바
브라우저 상단(Tab Bar)
가장 많이 사용하는 표현은 브라우저 탭입니다. 이거 세종한바퀴에 맞춰서 변경해줘
```

## 변경 파일 목록
- `src/angular/index.pug`: 탭 제목, 설명, 모바일 앱 제목과 파비콘 링크를 세종한바퀴 브랜드 기준으로 변경
- `src/assets/brand/sejong-hanbakwi.svg`: 순환 경로와 위치 핀을 결합한 세종한바퀴 SVG 파비콘 추가
- `devlog.md`: 작업 요약 행 추가
- `devlog/2026-08-06/042-sejong-hanbakwi-browser-tab.md`: 작업 상세 기록 추가

## 확인 결과
- `wiz_project_build(clean=false)`: WIZ 프로젝트 빌드 성공
- `build/src/index.html`, `bundle/www/index.html`: `<title>세종한바퀴</title>` 및 신규 파비콘 경로 반영 확인
- 빌드 산출물에 `assets/brand/sejong-hanbakwi.svg` 포함 확인
- `GET http://127.0.0.1:3000/home`: HTTP 200 및 실제 응답의 제목·파비콘 경로 확인

## 남은 리스크
- 브라우저가 이전 파비콘을 캐시한 경우 새로고침 직후에도 잠시 기존 아이콘이 보일 수 있다.
