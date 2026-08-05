const ACCOUNT_DATA_PREFIXES=[
  'yeogi-',
  'jochiwon-',
  'sejong-',
  'greenhouse-',
  'bear-',
  'nature-discovery-',
  'campus-',
  'government-',
  'festival-',
  'food-',
  'project-room-',
  'club-',
  'arts-center-',
  'world-',
  'character-debug-settings-',
] as const;

const ACCOUNT_DATA_KEYS=new Set([
  'bear-photo-zone-position',
]);

export function clearAllAccountData(storage:Pick<Storage,'length'|'key'|'removeItem'>){
  const keys=Array.from({length:storage.length},(_,index)=>storage.key(index))
    .filter((key):key is string=>Boolean(key))
    .filter(key=>ACCOUNT_DATA_KEYS.has(key)||ACCOUNT_DATA_PREFIXES.some(prefix=>key.startsWith(prefix)));
  keys.forEach(key=>storage.removeItem(key));
  return keys;
}
