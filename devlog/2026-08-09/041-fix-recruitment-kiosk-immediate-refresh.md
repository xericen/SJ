# 새 모집글의 모집센터 키오스크 즉시 반영 복구

## 원문 요청사항

```text
새 모집글 등록 즉시 모집센터 키오스크의 모집 둘러보기를 갱신합니다. 안 들어가는데 원인찾고 다시 수정해줘
```

## 변경 파일

- `react-app/src/components/RecruitmentCenterDesk.tsx`
- `react-app/src/components/RecruitmentCenterKiosk.tsx`
- `react-app/scripts/reviewOpsRegression.test.ts`
- `src/app/page.home/view.pug`
- `src/assets/jochwon-app/`

## 원인 및 변경 내용

- 모집 생성 API의 단건 응답 필드 `item`을 작성 화면이 해석하지 못하던 응답 정규화 누락을 수정했다.
- 갱신 이벤트에 생성된 모집글을 함께 전달하고 키오스크가 즉시 목록 앞에 반영한 뒤 서버 목록을 재조회하도록 변경했다.
- 서버·로컬 응답 구조를 정규화하고 중복 ID를 제거해 로그인·게스트 모집글 모두 키오스크에 유지되도록 보완했다.

## 검증

- TypeScript 빌드 검사 통과
- ReviewOps 회귀 테스트 4건 통과
- React 프로덕션 빌드 통과
- WIZ 일반 빌드 및 운영 정적 번들 HTTP 응답 확인
