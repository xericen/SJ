# 027. 곰체험소 안내 제거 및 곰동상 보상 확인

## 사용자 요청

곰체험소 좌측 하단 안내를 제거하고, 먹이 5개 급여 완료 시 베어트리파크 곰동상이 마이홈에 설치되었다는 문구와 GLB 기반 설치를 보장한다.

## 변경 파일

- `react-app/src/components/PersonalFarmProgressExperience.tsx`
- `react-app/src/components/PersonalFarmProgressExperience.css`
- 최신 `src/assets/jochwon-app/index.html` 및 `assets/*`

## 원인 및 확인

좌측 하단 안내는 이전에 추가한 `bear-play-zone-guide-card`였으므로 렌더링과 CSS를 제거했다. 급여 완료 문구를 명확히 변경했고, 기존 `bearStatueAssetFactory`의 `bear.glb` 기반 마이홈 자동 설치 경로와 WIZ query action 저장 경로를 유지·재검증했다. React/Vite 및 WIZ 빌드 성공, 운영 배포를 완료했다.
