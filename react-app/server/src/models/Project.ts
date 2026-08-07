import {createMysqlJsonModel} from '../database/mysqlJsonModel.js';

export const ProjectModel=createMysqlJsonModel('projects',(input)=>({
  title:'',summary:'',description:'',placeIds:[],activityTypes:[],tags:[],preferredTraits:[],
  leaderUserId:'',leaderNickname:'',memberUserIds:[],memberNicknames:[],applicantNicknames:[],
  status:'recruiting',visibility:'public',...input,
}));

export const ProjectApplicationModel=createMysqlJsonModel('project_applications',(input)=>({
  projectId:'',applicantUserId:'',profileSnapshot:{},status:'pending',...input,
}));
