export const UNIFIED_WORLD_PORTAL_VISUAL={
  appearance:'white-circle',
  theme:'mint',
} as const;

export function withUnifiedWorldPortalVisual<T extends object>(config:T){
  return {...config,...UNIFIED_WORLD_PORTAL_VISUAL};
}
