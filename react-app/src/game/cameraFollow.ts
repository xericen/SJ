export const SEJONG_ARTS_CENTER_FOLLOW_CAMERA_DISTANCE=1300;
export const LAKE_PARK_FOLLOW_CAMERA_DISTANCE=1080;
export const LAKE_PARK_CAMERA_ZOOM=1.35;
export const LAKE_PARK_CAMERA_ELEVATION_DEG=33;
export const BEAR_TREE_PARK_CAMERA_ELEVATION_DEG=29;
export const BEAR_TREE_PARK_CAMERA_DISTANCE_MULTIPLIER=5/3;
// 베어트리파크의 기존 구도는 호수공원 카메라 조정과 독립적으로 유지한다.
export const BEAR_TREE_PARK_FOLLOW_CAMERA_DISTANCE=1667;
export const BEAR_TREE_PARK_CAMERA_ZOOM=.876;

export function clampCameraBehindLimit(requestedZ:number,rearLimitZ:number){
  return Math.max(requestedZ,rearLimitZ);
}
