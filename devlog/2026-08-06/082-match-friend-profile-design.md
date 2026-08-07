# 친구 프로필을 내 프로필 디자인으로 통일

- **ID**: 082
- **날짜**: 2026-08-06
- **유형**: UX·친구 프로필
- **리뷰 ID**: sdpnckxiwdllqofimnhuovxfuiofjomy

## 작업 요약

친구 프로필의 과도하게 큰 캐릭터를 내 프로필과 동일한 작은 프리뷰·104px 원형 영역·1.5배 비율로 변경했다. 모달 크기, 헤더 간격, 이름 배지, 기본정보 칩과 우측 액션 카드도 내 프로필의 디자인 체계에 맞췄다.

## 원문 요청사항

```text
친구 프로필보ㅁ면  현재 캐릭터 너무 크게 나오는데, 내 프로필이랑 동일한 디자인으로 만들어주면 좋을 거 같아
```

## 변경 파일 목록

- `react-app/src/components/SocialProfileModal.tsx`
  - 친구 캐릭터에 작은 프리뷰를 사용하고, 내 프로필과 같은 헤더·기본정보 배치로 변경했다.
- `react-app/src/components/SocialProfileModal.css`
  - 모달, 캐릭터 영역, 타이포그래피, 정보 칩, 액션 카드와 모바일 스타일을 내 프로필 디자인에 맞췄다.
- `react-app/scripts/socialProfileActions.test.ts`
  - 내 프로필과 친구 프로필의 캐릭터 크기·배율 일치 회귀 검사를 추가했다.
- `react-app/src/runtimeBuild.ts`, `react-app/dist/`, `src/assets/jochwon-app/`
  - 런타임 빌드 ID를 `20260806-match-friend-profile-v178`로 갱신하고 배포 번들을 동기화했다.
- `devlog.md`, `devlog/2026-08-06/082-match-friend-profile-design.md`
  - 이번 변경과 검증 결과를 기록했다.

## 확인 결과

- 소셜 프로필 회귀 테스트 7건 통과
- 클라이언트·서버 TypeScript 검사 및 Vite 프로덕션 빌드 통과
- 프런트 성능 예산 검사 통과
- `react-app/dist`와 WIZ 배포 자산의 동일성 확인
- WIZ 프로젝트 일반 빌드 통과

## 남은 리스크

- 매우 긴 닉네임이나 위치명이 있는 실제 계정의 줄바꿈 상태는 브라우저 실기 확인이 필요하다.
