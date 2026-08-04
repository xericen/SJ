import { createMysqlJsonModel } from '../database/mysqlJsonModel.js';

export const ClubModel = createMysqlJsonModel('clubs', (input) => ({
  description: '',
  category: '기타',
  color: '#6c5ce7',
  members: [],
  activity: '',
  location: '세종 공동캠퍼스',
  schedule: '일정 협의',
  capacity: 12,
  tags: [],
  ...input,
}));
