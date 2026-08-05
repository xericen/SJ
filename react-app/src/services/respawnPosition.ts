import { FIXED_LAKE_RESPAWN,type RespawnPosition } from '../../shared/socket-events';

export async function getSharedRespawnPosition():Promise<RespawnPosition>{
  return {...FIXED_LAKE_RESPAWN};
}
