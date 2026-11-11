/**
 * Reference tables seeded by prisma/seed.ts
 * @type {readonly string[]}
 */

export const SEEDED_ENTITIES = [
  'division',
  'jobFunction',
  'priority',
  'liveconLevel',
  'recruitmentOutcome',
  'recruitmentStepTemplate',
] as const

/**
 * Entities written by a business service
 * @type {Record<string, string>}
 */

export const SERVICE_OWNED: Record<string, string> = {
  account: 'AccountService',
  absence: 'AbsenceService',
  featureSwitch: 'FeatureService',
  playSession: 'PlaySessionService',
  playProfile: 'PlayAdminService',
  playGameStat: 'PlayAdminService',
}

/**
 * Loose references that follow an identifier
 * @typedef {Object} SoftReference
 * @property {string} entity - Entity holding the loose value
 * @property {string} column - Column holding it
 */

export interface SoftReference {
  entity: string
  column: string
}

// Held by every entity
const COMMON_REFERENCES: SoftReference[] = [{ entity: 'activityLog', column: 'targetId' }]

/**
 * Entities whose identifier may be rewritten, with their loose references
 * @type {Record<string, SoftReference[]>}
 */

export const MIGRATABLE_ENTITIES: Record<string, SoftReference[]> = {
  team: COMMON_REFERENCES,
  project: COMMON_REFERENCES,
  platform: COMMON_REFERENCES,
  workflowState: COMMON_REFERENCES,
  skillCategory: COMMON_REFERENCES,
  pageCategory: COMMON_REFERENCES,
}
