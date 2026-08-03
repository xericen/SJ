# Three.js 스켈레탈 아바타 전환

- **ID**: 002
- **날짜**: 2026-07-20
- **유형**: 기능 추가
- **리뷰 ID**: nwjxtneabhsizrleedrencdjyxllfnlv

## 작업 요약

DOM 월드맵 위에 단일 투명 Three.js Canvas를 오버레이하고, 실제 관절 계층과 9개 AnimationClip이 포함된 토이 스타일 GLB를 연결했습니다.
기존 좌표·상태 머신·이름표·감정 UI는 유지하면서 GLTFLoader, AnimationMixer cross-fade, Quaternion 회전, 커스터마이징, 자동 CSS fallback을 구현했습니다.

## 원문 요청사항

```text
현재 캐릭터는 Angular/Pug DOM 파츠와 CSS 3D 애니메이션으로 구현되어 있다.

하지만 목표하는 동작은 단순히 팔과 다리를 일자로 앞뒤 회전시키는 수준이 아니라, 첨부 참고 이미지처럼 다음 특징을 가진 자연스러운 3D 캐릭터 포즈와 움직임이다.

목표 스타일:
- 둥글고 귀여운 토이 스타일의 3D 캐릭터
- 팔꿈치와 무릎이 실제 관절처럼 구부러짐
- 몸통이 이동 방향에 따라 기울고 비틀림
- 달리기, 점프, 기쁨, 손 흔들기 등에서 전신 포즈가 자연스럽게 변함
- 손과 발이 몸 안쪽으로 접히지 않고 공간상 앞뒤로 움직임
- 정면뿐 아니라 좌우·대각선 방향에서도 입체감 유지
- 현재 캐릭터의 귀여운 비율과 색감은 최대한 유지

중요:
CSS DOM 파츠 애니메이션을 계속 억지로 확장하지 말고, 현재 지도와 UI 구조는 유지하면서 캐릭터 렌더링 부분만 실제 3D 스켈레탈 아바타 구조로 전환할 수 있는지 먼저 분석해줘.

1. 기술 전환 가능성 분석

현재 프로젝트에서 다음 방식 중 어떤 것이 가장 적합한지 검토한다.

우선순위:
1) Three.js + GLTFLoader + AnimationMixer
2) Angular용 Three.js 직접 통합
3) 별도 Canvas 오버레이 위에 Three.js Scene 구성
4) 현재 지도 마커 위치와 3D Canvas 좌표 동기화
5) CSS DOM 캐릭터는 fallback으로 유지

분석 항목:
- 현재 지도 라이브러리
- 캐릭터가 지도 위에 배치되는 방식
- Angular 컴포넌트 구조
- 렌더링 루프
- 지도 확대/축소 및 이동 이벤트
- 캐릭터 좌표 변환 방식
- WebGL Canvas를 지도 위에 오버레이할 수 있는지
- 기존 이름표, 감정 UI, 채팅 버튼을 DOM으로 유지할 수 있는지

먼저 분석 결과를 정리한 뒤 실제 전환 작업을 진행한다.

2. 목표 아바타 구조

단일 GLB/GLTF 캐릭터 모델에 다음 뼈대가 포함되도록 전제한다.

필수 본:
- hips
- spine
- chest
- neck
- head
- leftShoulder
- leftUpperArm
- leftLowerArm
- leftHand
- rightShoulder
- rightUpperArm
- rightLowerArm
- rightHand
- leftUpperLeg
- leftLowerLeg
- leftFoot
- rightUpperLeg
- rightLowerLeg
- rightFoot

가능하면 humanoid rig를 사용한다.

모델에 애니메이션이 없다면:
- Mixamo 또는 Blender에서 애니메이션을 포함한 GLB를 준비할 수 있도록 구조를 만든다.
- 코드에 임시 절차적 본 회전을 넣더라도 최종적으로 AnimationMixer 클립으로 교체 가능하게 설계한다.

3. 필요한 애니메이션 클립

최소 다음 클립을 지원한다.

- idle
- walk
- run
- jump
- wave
- happy
- surprised
- heart
- sit

추가 권장:
- landing
- turnLeft
- turnRight
- dance
- highFive
- photoPose

각 클립은 GLB 안에 포함되거나 별도 파일로 로드할 수 있도록 한다.

4. 참고 이미지와 같은 자세 구현 기준

걷기:
- 한쪽 다리가 앞으로 나갈 때 반대쪽 팔이 앞으로 나감
- 무릎이 약간 굽혀짐
- 발이 지면을 뒤에서 밀고 앞으로 회수되는 동작
- 골반이 아주 미세하게 회전
- 몸통이 보행 방향으로 약간 기울어짐

달리기:
- 무릎이 걷기보다 높게 올라감
- 뒷다리는 무릎이 접히며 발뒤꿈치가 올라감
- 팔꿈치는 약 70~100도 굽혀진 상태로 앞뒤 움직임
- 상체는 진행 방향으로 약간 숙임
- 공중에 뜨는 짧은 비행 구간 표현
- 착지 시 무릎과 골반이 충격을 흡수함

점프:
- 준비 단계에서 무릎 굽힘
- 상승 시 두 팔이 올라감
- 공중에서 다리와 팔의 포즈 변화
- 착지 시 무릎 굽힘과 몸통 squash
- 이후 idle 또는 이동 상태로 자연스럽게 복귀

기쁨:
- 두 팔을 위로 올림
- 가슴과 머리를 약간 위로 듦
- 한쪽 다리를 들거나 짧게 점프
- 몸통이 뒤로 약간 열리는 포즈

손 흔들기:
- 어깨만 돌리는 것이 아니라 팔꿈치를 굽힘
- 손목 또는 손이 좌우로 흔들림
- 반대쪽 팔과 몸통은 자연스럽게 균형 유지
- 머리는 상대를 바라봄

5. AnimationMixer 기반 상태 머신

기존 상태 머신은 유지하되 GLTF AnimationAction을 제어하도록 변경한다.

상태:
- idle
- walk
- run
- jump
- wave
- happy
- surprised
- heart
- sit

우선순위:
jump > wave/happy/surprised/heart/sit > run > walk > idle

전환 시:
- 즉시 클립 교체하지 말고 crossFadeTo 사용
- 기본 cross-fade 시간 0.15~0.3초
- jump와 emote는 LoopOnce
- idle, walk, run은 LoopRepeat
- 일회성 액션 종료 후 현재 이동 속도에 맞는 상태로 복귀
- 같은 액션의 중복 실행 방지

6. 이동 방향과 캐릭터 회전

캐릭터 루트 오브젝트가 실제 이동 방향을 바라보게 한다.

- 현재 위치와 목표 위치 차이로 이동 벡터 계산
- atan2로 목표 회전 계산
- Quaternion.slerp 또는 damp 방식 사용
- 모델 기본 정면축이 +Z 또는 -Z인지 확인하고 offset 적용
- 거의 정지했을 때 마지막 방향 유지
- 방향 전환 중에도 walk/run 애니메이션 계속 재생
- 180도 회전 시 최단 경로 적용

주의:
팔다리 애니메이션은 모델 로컬 좌표계에서 재생하고, 캐릭터 전체 방향은 root group에서 처리한다.
루트 회전과 본 애니메이션을 같은 transform에서 덮어쓰지 않는다.

7. 지도와 3D 캐릭터 좌표 동기화

지도 위 DOM 캐릭터를 다음 구조로 전환한다.

- 지도는 기존 라이브러리와 DOM 유지
- 지도 위에 투명한 WebGL Canvas 오버레이
- 각 아바타의 지도 좌표를 화면 좌표로 변환
- Three.js 캐릭터의 screen-space 또는 world-space 위치를 해당 화면 좌표에 동기화
- 지도 pan/zoom 시 즉시 좌표 재계산
- 캐릭터 크기는 줌 레벨에 따라 과도하게 커지거나 작아지지 않도록 제한
- 이름표와 감정 이모지는 기존 DOM overlay로 유지 가능
- 3D 캐릭터와 이름표 위치가 어긋나지 않도록 anchor offset 적용

지도 라이브러리에 공식 WebGL overlay 기능이 있으면 그것을 우선 사용한다.
없으면 pointer-events:none Canvas overlay를 사용한다.

8. 카메라 구성

현재 참고 이미지처럼 캐릭터의 전신과 입체감이 보이도록 구성한다.

권장:
- PerspectiveCamera 또는 OrthographicCamera 비교
- 지도형 UI에서는 OrthographicCamera 우선 검토
- 카메라를 캐릭터 정면보다 약간 위에서 내려다보는 각도
- 캐릭터가 방향을 바꿔도 머리와 몸통 입체감이 유지되게 조명 구성
- 캐릭터마다 별도 Scene을 만들지 말고 하나의 Scene에 배치

9. 조명과 재질

귀여운 토이 스타일을 유지한다.

- HemisphereLight
- DirectionalLight
- 약한 AmbientLight
- 부드러운 그림자
- 과도한 금속성 금지
- roughness가 높은 플라스틱 또는 클레이 재질
- 피부와 의상에 부드러운 하이라이트
- 저사양 모바일을 위해 조명 수 최소화

가능하면:
- toon shading 또는 soft standard material
- outline은 성능 검토 후 선택 적용
- 그림자는 한 개의 blob shadow 또는 간단한 contact shadow 사용

10. 모델 커스터마이징 구조

기존 캐릭터 커스텀 정보를 유지한다.

최소 지원:
- 머리 색
- 상의 색
- 하의 색
- 신발 색
- 피부색
- 헤어 스타일 또는 액세서리

구현 방식:
- mesh name 또는 material name 기반으로 재질 교체
- 사용자별로 전체 모델을 복제하되 SkeletonUtils.clone 사용
- material 공유로 인해 다른 사용자의 색상이 같이 바뀌지 않게 필요한 재질만 clone
- 커스터마이징 데이터와 렌더링 로직 분리

11. 다수 아바타 성능

멀티플레이 확장을 고려한다.

- 렌더링 루프는 한 개만 사용
- AnimationMixer도 아바타별 최소 구성
- 화면 밖 아바타는 mixer 업데이트 빈도 감소
- 먼 아바타는 LOD 또는 낮은 애니메이션 업데이트 주기 적용
- 동일 모델은 geometry와 texture 공유
- 캐릭터 수 증가 시 draw call 관리
- 모바일에서 shadow 제한
- 매 프레임 객체 생성 금지

목표:
- 초기 10~20명 수준에서 부드럽게 동작
- 이후 최적화 가능한 구조

12. 기존 CSS 캐릭터 처리

전환 중 서비스가 깨지지 않도록 한다.

- 기존 CSS DOM 캐릭터는 fallback으로 유지
- GLB 로딩 성공 시 3D 캐릭터 표시
- 로딩 실패 또는 WebGL 미지원 시 기존 DOM 캐릭터 표시
- feature flag로 기존 방식과 신규 방식을 전환 가능하게 구현

예시:
enableSkeletalAvatar = true

13. 모델 파일이 현재 없는 경우

프로젝트에 rigged GLB 모델이 없다면 다음까지 수행한다.

- public 또는 assets 아래 avatar 모델 경로 구성
- 임시 placeholder GLB 로더 구현
- 모델 파일이 없는 상태에서도 앱 빌드가 깨지지 않게 fallback 처리
- 필요한 모델 규격 문서 작성
- 모델의 기본 정면축, 높이, 단위, 본 이름, 애니메이션 클립 이름을 문서화
- Mixamo 또는 Blender에서 export할 때 필요한 설정을 문서화

모델 규격 예시:
- 파일 형식: GLB
- 기본 높이: 1.6~2.0 Three.js unit
- 정면축: +Z 또는 -Z 중 하나로 통일
- 루트 위치: 발 중앙이 원점
- 스케일: 1
- 적용된 transform
- embedded texture
- humanoid skeleton
- 클립 이름: Idle, Walk, Run, Jump, Wave, Happy, Surprised, Heart, Sit

14. 임시 모델 없이 가짜 완료 처리 금지

다음은 완료로 간주하지 않는다.

- 기존 CSS 캐릭터에 rotateX만 추가한 것
- 팔과 다리를 일자로 흔들기만 한 것
- 2D 스프라이트를 3D라고 표현하는 것
- GLTFLoader 코드만 만들고 화면에 렌더링하지 않은 것
- Canvas만 추가하고 지도 좌표와 연결하지 않은 것
- 모델 파일이 없다는 이유로 구조 분석만 하고 끝내는 것

모델이 없다면 최소한:
- 3D Canvas 오버레이
- GLB 로더
- 좌표 동기화
- 상태 머신과 AnimationMixer 연결
- fallback
- 모델 규격 문서
까지 실제 코드로 구현한다.

15. 브라우저 검증

다음 장면을 실제 브라우저에서 확인한다.

- idle 상태 전신
- 오른쪽 걷기
- 왼쪽 걷기
- 위쪽 걷기
- 아래쪽 걷기
- 대각선 걷기
- 달리기
- 점프
- 손 흔들기
- 기쁨
- 180도 방향 전환
- 지도 확대 및 축소
- 지도 드래그
- 이름표 위치
- 모바일 크기 화면

확인 기준:
- 무릎과 팔꿈치가 자연스럽게 구부러진다.
- 손과 발이 몸 안쪽으로 파고들지 않는다.
- 캐릭터가 실제 이동 방향을 바라본다.
- 몸통과 골반이 동작에 맞춰 기울어진다.
- 상태 전환 시 포즈가 갑자기 튀지 않는다.
- 이름표와 감정 이모지가 캐릭터를 따라간다.
- 지도 조작과 충돌하지 않는다.
- 콘솔 오류가 없다.

16. 구현 우선순위

1차 필수:
- Three.js Canvas 오버레이
- rigged GLB 로드
- idle
- walk
- run
- jump
- wave
- 부드러운 방향 회전
- 지도 위치 동기화
- 이름표 연동
- fallback

2차:
- happy
- surprised
- heart
- sit
- 시선 처리
- 착지 전용 클립
- LOD
- 다수 사용자 최적화

17. 최종 보고 형식

구조 분석
- 기존 CSS 캐릭터 구조
- 선택한 Three.js 통합 방식
- 지도와 Canvas 연결 방식

변경 요약
- 3D 스켈레탈 아바타 전환 내용
- AnimationMixer 상태 연결
- 좌표 및 방향 동기화
- fallback 처리

모델 요구사항
- 현재 사용한 모델 경로
- 본 구조
- 클립 목록
- 정면축과 스케일

수정 파일
- 파일별 변경 사항

검증 결과
- 빌드
- 타입 검사
- 테스트
- 실제 브라우저에서 확인한 동작

남은 리스크
- 모델 애니메이션 품질
- 실제 모바일 성능
- 멀티플레이 서버 연동
- 커스터마이징 가능한 파츠 범위

중요 주의사항:
- 첨부 이미지의 인물을 그대로 복제하는 것이 아니라, 현재 서비스 캐릭터 디자인을 유지한 채 관절 움직임과 전신 포즈의 자연스러움만 참고할 것.
- CSS 파츠 방식만 조정해서 해결하려 하지 말 것.
- 자연스러운 팔꿈치와 무릎 동작을 위해 실제 rigged 3D 모델을 사용할 것.
- 기존 지도, GPS, 채팅, 이름표, 감정 UI는 유지할 것.
- 구현 전에 현재 코드 구조를 확인하고 존재하지 않는 파일이나 라이브러리를 임의로 가정하지 말 것.
```

## 변경 파일 목록

- `package.json`, `package-lock.json`
  - `three@0.166.1` 의존성 추가
- `src/assets/avatar/toy-avatar.glb`
  - 19개 humanoid 관절, 27개 토이 파츠, 9개 애니메이션 클립 포함
- `src/assets/avatar/README.md`
  - 모델 축·단위·본·클립·재질·Blender/Mixamo 교체 규격 문서화
- `tools/generate-avatar-glb.mjs`
  - 토이 스타일 관절 GLB와 자연스러운 전신 포즈 클립 생성 스크립트
- `src/app/page.home/skeletal-avatar-renderer.ts`
  - 단일 Scene/OrthographicCamera/WebGLRenderer 구성
  - GLTFLoader 본·클립 검증, AnimationMixer cross-fade, loop 정책
  - Quaternion.slerp 방향 회전, 좌표 변환, 조명·blob shadow 적용
  - SkeletonUtils.clone 및 사용자별 재질 clone·색상·헤어·액세서리 적용
- `src/app/page.home/character-animation-state.ts`
  - GLB Jump 길이에 맞춘 점프 상태와 쿨다운 정합화
- `src/app/page.home/view.ts`
  - Canvas 수명주기, feature flag, GLB 로딩·fallback, 프레임 동기화 연결
  - 머리 색 커스터마이징 및 3D 재질 갱신 연결
- `src/app/page.home/view.pug`
  - 투명 Canvas 오버레이와 DOM 이름표·감정 UI anchor 유지
  - GLB 준비 전 CSS fallback 표시
- `src/app/page.home/view.scss`
  - Canvas 계층·fade-in·fallback 전환 및 중복 CSS 애니메이션 중지
  - 머리 색 커스터마이징 UI 대응
- `devlog.md`
- `devlog/2026-07-20/002-threejs-skeletal-avatar.md`

## 확인 결과

- WIZ 일반 빌드 성공
- TypeScript/Pug/SCSS/Three.js 번들 컴파일 성공
- GLB 파싱: 243,180 bytes, 필수 본 19개, 필수 클립 9개, 메시 27개 확인
- 상태 머신·좌표 보간·본 포즈 통합 검증 17개 assertion 통과
- Walk 무릎 굽힘, Wave 팔꿈치 굽힘, Jump 골반 상승 트랙 수치 확인
- 번들 내 GLB·GLTFLoader·AnimationMixer cross-fade·Canvas·fallback 반영 확인
- `git diff --check` 통과

## 남은 참고사항

- 실행 환경에 브라우저 자동화 도구가 없어 실제 WebGL 화면·모바일 GPU·콘솔 육안 검증은 수행하지 못했습니다.
- 현재 월드맵은 별도 지도 SDK와 pan/zoom 이벤트가 없는 DOM 지도라 기존 퍼센트 좌표와 ResizeObserver를 동기화했습니다.
- 현 GLB는 관절별 토이 파츠 rig입니다. 향후 Blender 스킨 메시로 교체할 때 문서의 본·클립·재질 이름을 유지해야 합니다.
- 실제 원격 아바타 서버 스트림은 없으므로 다수 사용자 mixer/LOD 적용은 서버 데이터 연동 시 추가 검증이 필요합니다.
