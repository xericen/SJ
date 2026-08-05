export const SEJONG_SHARED_FOLLOW_CAMERA_DISTANCE=1300;

export function clampCameraBehindLimit(requestedZ:number,rearLimitZ:number){
  return Math.max(requestedZ,rearLimitZ);
}
