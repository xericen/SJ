export const SEJONG_ARTS_CENTER_FOLLOW_CAMERA_DISTANCE=1300;
export const LAKE_PARK_FOLLOW_CAMERA_DISTANCE=1000;
export const LAKE_PARK_CAMERA_ZOOM=1.46;

export function clampCameraBehindLimit(requestedZ:number,rearLimitZ:number){
  return Math.max(requestedZ,rearLimitZ);
}
