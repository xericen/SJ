import type { CampusFeaturePortalPosition } from '../../../shared/socket-events.js';
import { createMysqlJsonModel } from '../database/mysqlJsonModel.js';

const fixedPositions: CampusFeaturePortalPosition[] = [
  { portal: 'people', x: 881, z: 950 },
  { portal: 'clubs', x: 1537, z: 499 },
  { portal: 'recruit', x: 817, z: 1318 },
  { portal: 'government', x: 1590, z: 1543 },
];
export const CampusFeaturePortalModel = createMysqlJsonModel('campus_feature_portals');

export async function loadCampusFeaturePortalPositions(): Promise<CampusFeaturePortalPosition[]> {
  return fixedPositions.map(position => ({ ...position }));
}

export async function saveCampusFeaturePortalPosition(position: CampusFeaturePortalPosition) {
  const fixed = fixedPositions.find(item => item.portal === position.portal);
  if (!fixed) return;
  await CampusFeaturePortalModel.findOneAndUpdate(
    { portal: fixed.portal },
    { $set: { x: fixed.x, z: fixed.z } },
    { upsert: true, returnDocument: 'after' },
  );
}

export async function seedCampusFeaturePortalPositions(_positions: CampusFeaturePortalPosition[]) {
  await Promise.all(fixedPositions.map((position) => CampusFeaturePortalModel.updateOne(
    { portal: position.portal },
    { $set: { portal: position.portal, x: position.x, z: position.z } },
    { upsert: true },
  )));
  return loadCampusFeaturePortalPositions();
}
