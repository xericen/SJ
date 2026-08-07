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
  festivalFood:{festivalTypes:[],foodTypes:[],participationStyles:[],evidenceRecords:[],...(input.festivalFood??{})},
  profile:{
    ...(input.profile??{}),
    gardenNature:{flowerInterests:[],...(input.profile?.gardenNature??{})},
  },
  arts:{preferredGenres:[],viewingStyles:[],evidenceRecords:[],...(input.arts??{})},
  clubs:{categories:[],campusProfileSignals:[],...(input.clubs??{})},
  collaborationProjects:{interests:[],preferredRoles:[],availableTimes:[],evidenceRecords:[],...(input.collaborationProjects??{})},
  placeBehavior:{visitedPlaceIds:[],visitRecords:[],...(input.placeBehavior??{})},
}));
