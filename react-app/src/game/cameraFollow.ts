export const SEJONG_ARTS_CENTER_FOLLOW_CAMERA_DISTANCE=1300;
export const LAKE_PARK_FOLLOW_CAMERA_DISTANCE=1080;
export const LAKE_PARK_CAMERA_ZOOM=1.35;
export const LAKE_PARK_CAMERA_ELEVATION_DEG=33;

export function clampCameraBehindLimit(requestedZ:number,rearLimitZ:number){
  return Math.max(requestedZ,rearLimitZ);
}

export function orthographicZoomForCameraDistance(baseZoom:number,authoredDistance:number,requestedDistance:number){
  if(!Number.isFinite(requestedDistance)||requestedDistance<=0)return baseZoom;
  return baseZoom*authoredDistance/requestedDistance;
}
