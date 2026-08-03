import { createMysqlJsonModel } from '../database/mysqlJsonModel.js';

export const JointCampusRecommendationModel = createMysqlJsonModel('joint_campus_recommendations', (input) => ({
  status: 'success',
  ...input,
}));
