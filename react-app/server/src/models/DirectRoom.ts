import { createMysqlJsonModel } from '../database/mysqlJsonModel.js';

export const DirectRoomModel = createMysqlJsonModel('direct_rooms', (input) => ({
  active: true,
  ...input,
}));
