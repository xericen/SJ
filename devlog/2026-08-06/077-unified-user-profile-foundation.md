# 서버 통합 사용자 프로필 기반 구현

- **ID**: 077
- **날짜**: 2026-08-06
- **유형**: 기능 추가

## 작업 요약
현재 MySQL JSON 문서 저장소의 실제 사용자·경험·동아리·프로젝트 원천을 읽어 다섯 프로필 영역과 장소 행동을 하나의 읽기 전용 DTO로 조립하는 서버 서비스를 구현했다. 프로필 완성도는 서버에서 영역별 20점으로 계산하며, 인증된 본인만 조회·신규 소셜 신호를 저장할 수 있는 API와 게스트 메모리 정책을 추가했다.

## 원문 요청사항
```text
# ReviewOps Codex 작업 요청

아래 요청을 현재 프로젝트 루트에서 처리하세요. 필요한 파일을 직접 수정하고, 마지막 응답은 한국어로 간결하게 작성하세요.
스트리밍 응답은 사용하지 않습니다. 작업이 끝난 뒤 변경 요약, 확인한 내용, 남은 리스크만 정리하세요.
이 작업의 세션 단위는 아래 리뷰 ID입니다. 리뷰 ID가 같으면 같은 Codex 히스토리 맥락으로 이어서 처리하세요.

## 사용자 요청

서버의 “통합 사용자 프로필 데이터 구조”만 구현해줘.

아직 OpenAI 프롬프트를 교체하거나 기존 AI route를 삭제하지 마.
아직 매칭 가중치 계산도 변경하지 마.

이번 단계 목표:

1. 분산된 사용자 데이터를 5개 프로필 영역과 장소 행동 영역으로 통합
2. 소셜 사용자의 데이터는 현재 쓰는 데이터 베이스를 최종 기준으로 사용
3. 게스트 데이터는 메모리 세션만 사용
4. 서버에서 프로필 완성도를 계산
5. 이후 매칭과 AI 3개 기능이 공통으로 사용할 읽기 전용 DTO 생성

최종 AI 기능은 이후 다음 3개로 통일할 예정이다.

- 사용자 프로필 AI 성향 요약
- 사람 매칭 이유와 함께할 활동 설명
- 정부청사 AI 맞춤 세종 코스 추천

중요:

- 이번 단계에서는 OpenAI를 호출하지 마.
- 기존 AI 프롬프트를 삭제하지 마.
- 기존 매칭 공식을 아직 바꾸지 마.
- localStorage 데이터를 서버가 신뢰하는 최종 프로필로 사용하지 마.
- 새로운 임의 프로필 데이터를 만들지 마.
- 현재 실제 체험에서 수집되는 데이터만 연결해.
- push하지 마.

==================================================
1. 공식 통합 프로필 타입
==================================================

shared 영역에 공식 통합 프로필 타입을 하나만 정의해줘.

예시:

interface UnifiedUserProfile {
  userId: string;
  profileCompletion: number;

  festivalFood: {
    festivalTypes: string[];
    foodTypes: string[];
    participationStyles: string[];
    evidenceCount: number;
  };

  gardenNature: {
    topFlowers: Array<{
      flowerId: string;
      displayName: string;
      meanings: string[];
      interestScore: number;
    }>;
    observationStyle?: string;
    exploredFlowerCount: number;
    evidenceCount: number;
  };

  arts: {
    preferredGenres: string[];
    viewingStyles: string[];
    evidenceCount: number;
  };

  clubs: {
    categories: string[];
    preferredGroupSize?: string;
    participationRole?: string;
    evidenceCount: number;
  };

  collaborationProjects: {
    interests: string[];
    preferredRoles: string[];
    collaborationStyle?: string;
    availableTimes: string[];
    evidenceCount: number;
  };

  placeBehavior: {
    visitedPlaceIds: string[];
    mostVisitedPlaceIds: string[];
    longestStayedPlaceIds: string[];
    revisitPlaceIds: string[];
  };

  completedDomains: string[];
  updatedAt: string;
}

필드 이름은 현재 실제 코드에 맞게 조정할 수 있지만,
다섯 영역과 placeBehavior는 반드시 유지해.

같은 개념의 타입을 클라이언트·서버에 중복 정의하지 마.

==================================================
2. 현재 데이터 원천 연결
==================================================

조사 보고서에서 확인된 실제 데이터를 연결해.

### festivalFood

현재 원천:

- experienceHarness.festival
- experienceHarness.food
- profileFragments
- activityRecords

다음으로 변환:

- festivalTypes
- foodTypes
- participationStyles
- evidenceCount

### gardenNature

현재 원천:

- User.profile.gardenNature.flowerInterests
- 꽃 catalog
- topFlowerInterests selector

다음으로 변환:

- topFlowers
- 꽃 이름
- 꽃말
- interestScore
- exploredFlowerCount
- observationStyle

꽃말은 FlowerInterestRecord에 중복 저장하지 말고
공통 꽃 catalog에서 결합해.

### arts

현재 원천:

- experienceHarness.performance
- performance genre map
- activityRecords

다음으로 변환:

- preferredGenres
- viewingStyles
- evidenceCount

### clubs

현재 원천:

- Club 컬렉션
- 사용자의 가입·관심 동아리
- campusProfileSignals

소셜 사용자 기준으로 localStorage만 사용 중인 값은
공식 서버 저장 API와 MongoDB 필드를 추가해 저장하도록 정리해.

다음으로 변환:

- categories
- preferredGroupSize
- participationRole
- evidenceCount

### collaborationProjects

현재 원천:

- Project 컬렉션
- 프로젝트 지원서
- profileSnapshot
- tags
- activityTypes
- preferredTraits
- recommendedRole 관련 신호

현재 localStorage에만 있는 소셜 사용자 데이터는
서버 저장 구조로 이전하거나 이후 체험부터 MongoDB에 저장되게 해.

다음으로 변환:

- interests
- preferredRoles
- collaborationStyle
- availableTimes
- evidenceCount

### placeBehavior

현재 원천:

- map 방문 기록
- activityRecords
- map-exit 기록
- 꽃 근접·재방문 기록

다음으로 변환:

- visitedPlaceIds
- mostVisitedPlaceIds
- longestStayedPlaceIds
- revisitPlaceIds

비활성 상태로 오래 켜둔 시간은 체류 시간에서 제외할 수 있는 구조를 사용해.

==================================================
3. 소셜 사용자 DB 구조
==================================================

User 모델 또는 별도 프로필 모델에 다음 영역을 공식 저장 구조로 추가해.

- festivalFood
- gardenNature
- arts
- clubs
- collaborationProjects
- placeBehavior

기존 User.profile.gardenNature는 재사용해.

기존 문서에 새 필드가 없어도 조회 오류가 나지 않도록 기본값을 적용해.

배열:

default: []

객체:

필드별 기본 객체

기존 experienceHarness, Club, Project 데이터를 즉시 전부 복사해
중복 저장할 필요는 없다.

다음 중 하나로 구현해.

A. 원본 컬렉션을 조회해 UnifiedUserProfile을 실시간 조립

또는

B. 원본 이벤트 저장 시 User의 통합 프로필 필드도 갱신

현재 구조에 적합한 방식을 선택하되,
통합 프로필을 읽는 호출부가 여러 저장소를 직접 조회하지 않게 해.

==================================================
4. 게스트 정책
==================================================

게스트는 동일한 UnifiedUserProfile 타입을 사용하지만
메모리 세션에서만 관리해.

- MongoDB 호출 없음
- account/me 프로필 저장 API 호출 없음
- localStorage 없음
- sessionStorage 없음
- 게임 내부 맵 이동 중 유지
- 새로고침·메인 이동·종료 시 초기화
- 정부청사 AI와 사람 매칭은 사용 불가

게스트 데이터를 소셜 사용자의 통합 DB 프로필과 섞지 마.

==================================================
5. 통합 프로필 생성 서비스
==================================================

서버에 단일 서비스를 만들어줘.

권장:

server/src/services/profile/buildUnifiedUserProfile.ts

책임:

- 사용자 기본 정보 조회
- 경험 하네스 데이터 읽기
- 꽃 관심도 읽기
- Club 데이터 읽기
- Project 및 지원서 데이터 읽기
- 장소 행동 요약
- 누락 필드 정규화
- UnifiedUserProfile 반환

예시:

async function buildUnifiedUserProfile(
  userId: string,
): Promise<UnifiedUserProfile>

AI route나 매칭 route가 각자 DB를 조합하지 않도록
이 서비스를 이후 공통 진입점으로 사용하게 할 예정이다.

이번 단계에서는 기존 AI route에 아직 연결하지 마.

==================================================
6. 서버 프로필 완성도 계산
==================================================

프로필 완성도를 클라이언트가 결정하지 않게 해.

서버에서 다섯 영역의 실제 데이터 존재 여부를 계산해.

권장 기본 가중치:

const PROFILE_COMPLETION_WEIGHTS = {
  festivalFood: 20,
  gardenNature: 20,
  arts: 20,
  clubs: 20,
  collaborationProjects: 20,
} as const;

각 영역은 단순 객체 존재가 아니라
최소한 의미 있는 데이터가 있어야 완료로 인정해.

예:

- festivalFood: 축제 또는 음식 취향 1개 이상
- gardenNature: 의미 있게 탐색한 꽃 1개 이상
- arts: 예술 장르 또는 행동 근거 1개 이상
- clubs: 관심 또는 가입 동아리 분야 1개 이상
- collaborationProjects: 관심 분야·역할·협업 성향 중 의미 있는 값 존재

부분 점수를 지원해도 되지만 총점은 항상 0~100이어야 한다.

정부청사 50% 해금은 다음 단계에서 이 서버 계산값을 사용한다.

==================================================
7. 조회 API
==================================================

소셜 사용자 본인의 통합 프로필을 조회하는 API를 추가해.

예:

GET /api/account/me/unified-profile

조건:

- 인증 필수
- userId를 query/body에서 받지 않음
- 인증 세션 사용자만 조회
- UnifiedUserProfile 구조로 반환
- 기존 사용자 누락 필드에서도 200
- 프로필 데이터가 없어도 빈 기본 DTO 반환

다른 사용자의 공개 매칭 프로필은
후속 매칭 단계에서 별도 안전 DTO를 만들 예정이다.

이번 단계에서는 다른 사용자의 전체 프로필 조회 API를 만들지 마.

==================================================
8. 민감 데이터 제외
==================================================

통합 프로필에 다음을 포함하지 마.

- 이메일
- OAuth 토큰
- 인증 provider ID
- 세션 쿠키
- 업로드 파일 경로
- 비공개 채팅 내용
- 사용자 원본 메모 전체
- 개인 방문 사진
- MongoDB 내부 필드

AI와 매칭에 필요한 요약 정보만 포함해.

==================================================
9. localStorage 의존 정리
==================================================

소셜 사용자의 다음 데이터가 localStorage에만 있다면
현재 실제 사용 위치를 조사해.

- 동아리 관심
- 프로젝트 관심
- 희망 역할
- 협업 스타일
- 활동 가능 시간

다음 원칙으로 변경해.

소셜 사용자:

- 서버 API 및 MongoDB 저장
- 새로고침 후 유지

게스트:

- 메모리만 사용
- 새로고침 후 초기화

기존 localStorage 값은 신규 서버 데이터의 신뢰 원천으로 사용하지 마.

이번 단계에서 삭제가 위험하면 읽기 경로는 잠시 유지하되
새 통합 프로필에는 포함하지 않고 legacy로 표시해.

==================================================
10. 테스트
==================================================

다음 사용자를 테스트해.

### 빈 신규 사용자

- 모든 영역 기본값
- profileCompletion 0
- API 200

### 축제·먹거리만 사용한 사용자

- festivalFood 데이터 존재
- 해당 영역 점수만 반영

### 꽃만 탐색한 사용자

- topFlowers 생성
- 꽃 이름과 꽃말 결합
- gardenNature 반영

### 동아리·프로젝트 사용자

- Club/Project 데이터 반영
- localStorage가 아닌 서버 원본 사용

### 전체 사용자

- 다섯 영역 모두 반영
- profileCompletion 100 이하
- completedDomains 정상

### 사용자 분리

- 사용자 A와 B 데이터 혼합 없음

실행:

- 클라이언트 TypeScript
- 서버 TypeScript
- npm run build
- 통합 프로필 서비스 테스트
- 프로필 완성도 테스트
- API 인증 테스트
- git diff --check

==================================================
11. 이번 단계에서 하지 않을 것
==================================================

- 기존 OpenAI 프롬프트 삭제
- 새로운 OpenAI 호출
- 매칭 가중치 변경
- 매칭 UI 변경
- 정부청사 AI prompt 변경
- 기존 AI route 삭제
- 곰·온실 AI 삭제
- 프로필 AI 요약 재생성

이번에는 AI와 매칭이 사용할 데이터 기반만 만든다.

==================================================
12. 완료 보고
==================================================

## 공식 통합 프로필 타입

최종 타입과 필드를 알려줘.

## 영역별 데이터 원천

각 영역이 어떤 DB/서비스에서 생성되는지 알려줘.

## 소셜 저장

MongoDB에 새로 저장한 값과
기존 원천에서 실시간 조립하는 값을 구분해줘.

## 게스트 저장

메모리 초기화 정책을 알려줘.

## 프로필 완성도

- 영역별 기준
- 가중치
- 서버 계산 위치

## API

- endpoint
- 인증
- 응답 예시

## localStorage 정리

- 서버로 이전한 값
- 아직 legacy로 남은 값

## 테스트 결과

- 빈 사용자
- 부분 사용자
- 전체 사용자
- 사용자 분리
- 타입 및 빌드

## 다음 단계 준비 상태

다음 필드가 모두 실제 값으로 생성 가능한지 알려줘.

- festivalFood
- gardenNature
- arts
- clubs
- collaborationProjects
- placeBehavior
- profileCompletion

실제 값이 없는 필드는 완료됐다고 쓰지 마.

## 리뷰 요약

- 리뷰 ID: cuicnigsomcfkkfkxocclyrmsvqoemuu
- 제목: AI 프롬포트
- 요청 링크: https://sj.wizide.com/home
- Codex 요청자: 김민주
- 프로젝트 루트: /opt/app
- Codex 세션 ID: 신규
- Codex 모델: 5.6 sol (gpt-5.6-sol)
- Codex 추론수준: medium (medium)
- 스크린샷 컨텍스트: 없음
- 에이전트 작업 지시서 컨텍스트: 없음
- HTML 문서 생성 규칙 컨텍스트: 없음
- HTML 문서 설정 컨텍스트: 없음
- HTML 프로젝트 인스트럭션 파일: 없음
- 첨부파일 컨텍스트: 0개
```

## 변경 파일 목록

- 공식 shared 계약: `react-app/shared/unified-user-profile.ts`, `react-app/shared/flower-catalog.ts`
- 서버 저장 모델: `react-app/server/src/models/User.ts`, `react-app/server/src/models/Project.ts`
- 조립·완성도 서비스: `react-app/server/src/services/profile/buildUnifiedUserProfile.ts`
- 인증 조회·저장 API: `react-app/server/src/routes/unifiedProfile.ts`, `react-app/server/src/index.ts`
- 실제 이벤트 연결: `react-app/server/src/services/personalFarmProgressService.ts`, `react-app/src/services/experienceHarness.ts`
- 소셜 서버 동기화·게스트 메모리: `react-app/src/services/unifiedProfileApi.ts`, `react-app/src/services/campusProfileSignals.ts`, `react-app/src/services/projectRoomProjects.ts`, `react-app/src/services/guestUnifiedProfile.ts`, `react-app/src/game/GameCanvas.tsx`
- 공통 꽃 카탈로그 소비: `react-app/src/services/flowerInterestProfile.ts`
- 테스트: `react-app/server/src/services/profile/buildUnifiedUserProfile.test.ts`, `react-app/server/src/routes/unifiedProfile.test.ts`

## 검증 결과

- `npm --prefix server test`: 67개 통과
- `npm --prefix server run typecheck`: 통과
- `npx tsc -b --pretty false`: 통과
- `npm run build`: 통과(기존 SUIT 폰트 런타임 경로 경고만 존재)
- WIZ normal build: 통과
- `git diff --check`: 통과
