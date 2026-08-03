import { createMysqlJsonModel } from '../database/mysqlJsonModel.js';

export const UserModel = createMysqlJsonModel('users', (input) => ({
  profileImage: '',
  ageSource: 'unknown',
  explicitInterests: [],
  onboardingCompleted: false,
  ageGroup: 'unknown',
  authProvider: 'kakao',
  lastLoginAt: new Date(),
  ...input,
}));
