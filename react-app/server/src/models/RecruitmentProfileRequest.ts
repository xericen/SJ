import { createMysqlJsonModel } from '../database/mysqlJsonModel.js';

export const RecruitmentProfileRequestModel = createMysqlJsonModel(
  'recruitment_profile_requests',
  (input) => ({
    status: 'pending',
    ...input,
  }),
);
