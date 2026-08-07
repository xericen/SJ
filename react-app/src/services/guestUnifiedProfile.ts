import {createEmptyUnifiedUserProfile,type UnifiedUserProfile} from '../../shared/unified-user-profile';

/** Guest profile state intentionally lives only in this module's process memory. */
class GuestUnifiedProfileSession {
  private profile=createEmptyUnifiedUserProfile('guest');

  get():UnifiedUserProfile{return structuredClone(this.profile)}
  replace(profile:UnifiedUserProfile){this.profile=structuredClone({...profile,userId:'guest'})}
  reset(){this.profile=createEmptyUnifiedUserProfile('guest')}
}

export const guestUnifiedProfileSession=new GuestUnifiedProfileSession();
