export const CAMPUS_PORTAL_VISUAL_SCALE=2/3;

export const portalVisualScaleForMap=(mapName:string)=>mapName==='공동캠퍼스'
  ?CAMPUS_PORTAL_VISUAL_SCALE
  :1;
