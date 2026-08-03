# 공용 캐릭터 모델 이미지 회원가입 연동

## 사용자 요청

```text
공용파일에 넣은 캐릭터를 넣어줘. 회원가입 캐릭터 선정하는 것에 공용파일에 있는 모델 이미지로 넣어주라
```

## 작업 내용

- 공용 폴더의 캐릭터 JPG 2개를 프로젝트 웹 자산으로 복사했다.
- 회원가입 캐릭터 단계에 공용 모델 이미지 선택 카드와 선택한 모델의 확대 미리보기를 추가했다.
- 선택한 모델 ID를 기존 캐릭터 설정과 함께 localStorage에 저장하고 다시 접속했을 때 복원되도록 기존 저장 구조에 연결했다.
- 무작위 캐릭터 생성 시 공용 모델 이미지도 함께 무작위 선택되도록 했다.
- 모바일에서는 모델 선택 카드를 한 열로 배치하도록 반응형 스타일을 추가했다.
- 기존 피부·헤어·의상·장식·신발 설정과 지도용 Three.js 아바타 로직은 유지했다.

## 변경 파일

- `src/assets/avatar/shared-models/cheerful-characters.jpg`: 공용 점프 캐릭터 모델 이미지
- `src/assets/avatar/shared-models/colorful-characters.jpg`: 공용 컬러풀 캐릭터 모델 이미지
- `src/app/page.home/view.ts`: 모델 목록, 선택 상태, 저장·무작위 선택 로직
- `src/app/page.home/view.pug`: 회원가입 모델 선택 카드와 미리보기 UI
- `src/app/page.home/view.scss`: 모델 카드·미리보기·모바일 반응형 스타일
- `devlog.md`: 작업 요약 행
- `devlog/2026-07-20/003-signup-shared-character-models.md`: 상세 작업 기록

## 검증 결과

- WIZ 프로젝트 일반 빌드: 성공
- `git diff --check`: 성공
- JPG 자산 경로 및 파일 크기 확인: 성공
- Angular/Pug 바인딩 이름 정적 검색: 성공
- 실제 브라우저 수동 확인: 현재 작업 환경에서는 미실행

## 참고

공용 JPG는 여러 인물이 한 장에 배치된 모델 시트라서 CSS 배경 위치로 대표 캐릭터를 잘라 보여준다. PSD 원본은 파일당 약 55~60MB로 웹 초기 로딩에 부적합하여 포함하지 않았다.
