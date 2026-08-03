# 사이트 전체 세종 글꽃체 적용 및 한글화

## 사용자 요청

> 웹 전체적일 글꼴을 내가 공용파일에 올린 세종 글꽃체로 바꿔줘 그리고 세종은 한글이 중요하기때문에 사이트는 영여 없이 한글로만 이루어져야함

## 변경 내용

- 공용 위치의 `SejongGeulggot.ttf`를 프로젝트 글꼴 자산으로 추가했다.
- 전역 글꼴과 홈 화면의 별도 글꼴 지정을 세종 글꽃체로 변경하고, 입력 요소에도 상속되도록 설정했다.
- 홈, 로그인, 현황판, 멤버, 내 정보, 게시물 화면의 정적 영문 문구와 상태·역할 표시를 한글로 변경했다.

## 변경 파일

- `src/assets/font/SejongGeulggot/SejongGeulggot.ttf`
- `src/angular/styles/styles.scss`
- `src/app/page.home/view.pug`
- `src/app/page.home/view.scss`
- `src/app/page.access/view.pug`
- `src/app/component.nav.sidebar/view.pug`
- `src/app/layout.sidebar/view.pug`
- `src/app/page.dashboard/view.pug`
- `src/app/page.dashboard/view.ts`
- `src/app/page.members/api.py`
- `src/app/page.members/view.pug`
- `src/app/page.members/view.ts`
- `src/app/page.mypage/view.pug`
- `src/app/page.mypage/view.ts`
- `src/portal/post/app/list/view.html`
- `src/portal/post/app/list/view.pug`
- `src/portal/post/app/list/view.ts`
- `src/portal/post/app/detail/view.html`
- `src/portal/post/app/detail/view.pug`
- `src/portal/post/app/detail/view.ts`

## 확인 결과

- `wiz project build --project=main` 성공
- 빌드 및 번들 산출물에 세종 글꽃체 파일이 포함된 것을 확인
- 로컬 서비스의 글꼴 요청이 HTTP 200 및 `font/ttf`로 응답하는 것을 확인
- 주요 화면 빌드 결과에서 지정된 영문 정적 문구가 남지 않은 것을 확인

## 남은 리스크

- 원본 글꼴이 단일 굵기의 TTF 파일이라 굵은 글자는 브라우저가 합성하며, 파일 크기가 약 7.5MB로 초기 글꼴 로딩에 영향을 줄 수 있다.
- 이메일 주소, 사용자 이름, 게시물 등 사용자가 직접 입력하거나 저장한 데이터에는 영문이 표시될 수 있다.
