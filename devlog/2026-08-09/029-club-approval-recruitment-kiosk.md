# 동아리 가입 승인·회장 권한 및 모집 키오스크 공용 연결

## 사용자 요청

카카오 로그인 사용자가 자신이 만든 동아리에 가입하지 못하게 하고, 가입 신청은 회장의 수락 후 회원으로 반영하며 회장만 집부·회원 역할을 변경하게 한다. 모집센터에서 작성한 모집글은 키오스크 모집 둘러보기에 표시하고, 충녕이·1:1 채팅·중앙광장의 OpenAI 프롬프트 위치와 사용 방식을 설명한다.

## 변경 파일

- `react-app/src/components/ClubStreetExperience.tsx`
- `react-app/src/components/ClubRoles.css`
- `react-app/src/components/RecruitmentCenterKiosk.tsx`
- `react-app/src/runtimeBuild.ts`
- `src/app/page.home/api.py`
- `src/app/page.home/view.pug`

## 확인 결과

- 동아리 생성자를 회장 구성원으로 고정하고 자기 동아리 가입 신청 차단
- 가입 신청을 승인 대기로 저장하고 회장 전용 수락·거절 및 집부·회원 역할 변경 API 적용
- 모집 키오스크가 WIZ 공용 모집글 응답을 읽도록 연결
- React·TypeScript·Vite 성능 예산 및 WIZ 빌드 확인
