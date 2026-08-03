import type { RespawnPosition } from '../../../shared/socket-events.js';
import { createMysqlJsonModel } from '../database/mysqlJsonModel.js';

export const WorldRespawnPositionModel = createMysqlJsonModel('world_respawn_positions');

export async function loadOrSeedWorldRespawnPosition(fallback: RespawnPosition): Promise<RespawnPosition> {
  const document = await WorldRespawnPositionModel.findOneAndUpdate(
    { map: 'town' },
    { $setOnInsert: { map: 'town', ...fallback } },
    { upsert: true, returnDocument: 'after' },
  ).lean();
  return { x: Math.round(document.x), z: Math.round(document.z), yaw: document.yaw };
}

export async function saveWorldRespawnPosition(position: RespawnPosition) {
  await WorldRespawnPositionModel.findOneAndUpdate(
    { map: 'town' },
    { $set: { x: position.x, z: position.z, yaw: position.yaw } },
    { upsert: true, returnDocument: 'after' },
  );
}
