export const DEFAULT_MAX_STEP_HEIGHT=22;
export const JUMP_COLLISION_CLEARANCE=8;
export const ARTS_CENTER_MAX_JUMP_STEP_HEIGHT=36;

export function reachableStepHeight(jumpHeight:number,maxJumpStepHeight?:number){
  if(maxJumpStepHeight===undefined||jumpHeight<=JUMP_COLLISION_CLEARANCE)return DEFAULT_MAX_STEP_HEIGHT;
  return Math.min(maxJumpStepHeight,DEFAULT_MAX_STEP_HEIGHT+jumpHeight);
}

export function isGroundFootprintCoherent(heights:readonly number[],maxStepHeight:number,initial=false){
  if(!heights.length)return false;
  const highest=Math.max(...heights),tolerance=initial?DEFAULT_MAX_STEP_HEIGHT:maxStepHeight;
  return heights.every(height=>Math.abs(height-highest)<=tolerance);
}
