# 밝은 세종 랜딩 디자인 및 간소화된 시작 흐름 전면 개편

- 날짜: 2026-07-19
- ID: 003
- 리뷰 ID: ferzettggowicwagbvebyuayagkgbbkh

## 사용자 원문 요청

> file:///C:/Users/cathy/Downloads/yeogi_saram_landing_bright_sejong_v4.html -> 이 디자인으로 전체적 바꿔줘

리뷰 피드백: “좀 더 간편한 것으로 만들면 좋을 거 같음. 현재 너무 복잡함.”

## 변경 내용

어두운 멀티버스형 화면과 5단계 대형 입장 모달을 밝고 친근한 세종 로컬 서비스 랜딩으로 전면 재구성했다. 첫 화면은 서비스 가치, 동네 미리보기, 3단계 이용 방법만 남겨 정보 밀도를 낮췄다. 가입 흐름은 이메일 계정, 관심사, 위치 확인의 3단계 소형 모달로 단순화했으며 동네 둘러보기 화면과 모바일 반응형 레이아웃을 함께 구성했다.

## 변경 파일

- `src/app/page.home/view.pug`
- `src/app/page.home/view.scss`
- `src/app/page.home/view.ts`
- `devlog.md`
- `devlog/2026-07-19/003-bright-sejong-simple-landing.md`

## 확인 결과

- WIZ 프로젝트 일반 빌드 성공
- Pug 템플릿 컴파일 및 Angular EsBuild 완료
- 랜딩, 동네 둘러보기, 로그인/회원가입 모달의 상태 전환 로직 연결 확인
- 900px 및 560px 기준 반응형 스타일 포함

## 참고

요청에 적힌 Windows 로컬 `file://` HTML은 작업 공간에 첨부되지 않아 직접 열 수 없었다. 제공된 리뷰 화면과 간소화 요청을 기준으로 밝은 세종 지역 서비스 톤을 재구성했다.
