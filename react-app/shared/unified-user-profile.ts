import type { GardenFlowerId } from './personal-farm.js';

export const UNIFIED_PROFILE_DOMAINS = [
  'festivalFood',
  'gardenNature',
  'arts',
  'clubs',
  'collaborationProjects',
] as const;

export type UnifiedProfileDomain = typeof UNIFIED_PROFILE_DOMAINS[number];

export interface UnifiedFlowerInterest {
  flowerId: GardenFlowerId;
  displayName: string;
  meanings: string[];
  interestScore: number;
}

export interface UnifiedUserProfile {
  userId: string;
  profileCompletion: number;
  festivalFood: {
    festivalTypes: string[];
    foodTypes: string[];
    participationStyles: string[];
    evidenceCount: number;
  };
  gardenNature: {
    topFlowers: UnifiedFlowerInterest[];
    observationStyle?: string;
    exploredFlowerCount: number;
    evidenceCount: number;
  };
  arts: {
    preferredGenres: string[];
    viewingStyles: string[];
    evidenceCount: number;
  };
  clubs: {
    categories: string[];
    preferredGroupSize?: string;
    participationRole?: string;
    evidenceCount: number;
  };
  collaborationProjects: {
    interests: string[];
    preferredRoles: string[];
    collaborationStyle?: string;
    availableTimes: string[];
    evidenceCount: number;
  };
  placeBehavior: {
    visitedPlaceIds: string[];
    mostVisitedPlaceIds: string[];
    longestStayedPlaceIds: string[];
    revisitPlaceIds: string[];
  };
  completedDomains: UnifiedProfileDomain[];
  updatedAt: string;
}

export const PROFILE_COMPLETION_WEIGHTS: Readonly<Record<UnifiedProfileDomain, 20>> = {
  festivalFood: 20,
  gardenNature: 20,
  arts: 20,
  clubs: 20,
  collaborationProjects: 20,
};

export function createEmptyUnifiedUserProfile(userId: string, updatedAt = new Date().toISOString()): UnifiedUserProfile {
  return {
    userId,
    profileCompletion: 0,
    festivalFood: { festivalTypes: [], foodTypes: [], participationStyles: [], evidenceCount: 0 },
    gardenNature: { topFlowers: [], exploredFlowerCount: 0, evidenceCount: 0 },
    arts: { preferredGenres: [], viewingStyles: [], evidenceCount: 0 },
    clubs: { categories: [], evidenceCount: 0 },
    collaborationProjects: { interests: [], preferredRoles: [], availableTimes: [], evidenceCount: 0 },
    placeBehavior: { visitedPlaceIds: [], mostVisitedPlaceIds: [], longestStayedPlaceIds: [], revisitPlaceIds: [] },
    completedDomains: [],
    updatedAt,
  };
}
