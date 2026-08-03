import { randomUUID } from 'node:crypto';
import { createMysqlJsonModel } from '../database/mysqlJsonModel.js';

export const CommunityPostModel = createMysqlJsonModel('community_posts', (input) => ({
  id: randomUUID(),
  author: '익명',
  category: '자유게시판',
  likes: 0,
  likedBy: [],
  comments: [],
  applications: [],
  createdAt: new Date(),
  ...input,
}));
