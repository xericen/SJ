export const UNIFIED_WORLD_PORTAL_VISUAL={
  appearance:'white-circle',
  theme:'mint',
} as const;

export function withUnifiedWorldPortalVisual<T extends object>(config:T){
  // All maps use the same circular portal silhouette; only the destination
  // label and placement remain map-specific.
  return {...config,appearance:UNIFIED_WORLD_PORTAL_VISUAL.appearance};
}
