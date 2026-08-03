import { createMysqlJsonModel } from '../database/mysqlJsonModel.js';

export const DirectMessageModel = createMysqlJsonModel('direct_messages', (input) => ({
  type: 'user',
  ...input,
}));
