export const UNIFIED_WORLD_PORTAL_VISUAL={
  appearance:'white-circle',
  theme:'mint',
} as const;

export function withUnifiedWorldPortalVisual<T extends object>(config:T){
  // Keep the shared white-circle shape, but allow map-specific colors such as
  // the orange nature-world portals to survive the normalization step.
  return {...UNIFIED_WORLD_PORTAL_VISUAL,...config};
}
