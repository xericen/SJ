# 공용 이미지 로고 누끼 자산 적용 및 세종한바퀴 브랜드·탭 아이콘 교체

- 날짜: 2026-08-06
- ID: 071
- 리뷰 ID: `ehvuwuaqzbuuivfbulswmeoygtmxcpqg`

## 사용자 원문

> 한바퀴 로고 이 공용사진으로 바꿔주면 좋을 거 같아. 원래 세종한바퀴 옆에 이모티콘있잖아, 이걸로 바꿔주고, 세종한바퀴 탭도 이 사진으로 바꿔줘 -> 사진 그대로 쓰지말고 로고만 누끼?따서 올리면 좋을듯

## 변경 내용

- 첨부 공용 이미지의 중앙 원형 심볼만 분리해 투명 배경 PNG 로고 자산으로 추가했다.
- 홈 상단의 세종한바퀴 옆 농부 이모지와 체험 로딩 브랜드 표식을 신규 로고로 교체했다.
- 외부 WIZ 문서와 내부 조치원 앱 문서의 파비콘을 신규 PNG로 통일했다.
- 정적 앱 캐시 갱신을 위해 빌드 식별자를 `20260806-brand-logo-v168`로 변경했다.

## 변경 파일

- `src/assets/brand/sejong-hanbakwi.png`
- `src/angular/index.pug`
- `src/app/page.home/view.pug`
- `src/assets/jochwon-app/index.html`
- `src/assets/jochwon-app/assets/index-DjMObuVl.css`
- `src/assets/jochwon-app/assets/GamePage-Dm_JU4Gz.css`
- `devlog.md`
- `devlog/2026-08-06/071-apply-sejong-hanbakwi-cutout-logo.md`

## 확인 결과

- 투명 PNG가 RGBA 1254×1254이며 네 모서리 알파값이 모두 0임을 확인했다.
- 외부/내부 파비콘과 홈·로딩 브랜드 CSS가 모두 `/assets/brand/sejong-hanbakwi.png`를 참조하는지 확인했다.
- WIZ 일반 빌드(`clean=false`)가 오류 없이 완료됐다.

## 남은 리스크

- 브라우저 파비콘 캐시 특성상 기존 탭이 열린 상태에서는 새로고침 또는 탭 재실행 후 아이콘이 갱신될 수 있다.
