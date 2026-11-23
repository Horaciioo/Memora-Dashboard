import type { NotificationKindName } from '@/utils/constants/notifications'

/**
 * How much a movement asks of the member, it only orders the lines
 * @type {'act' | 'follow' | 'glance'}
 */

export type RecapTierName = 'act' | 'follow' | 'glance'

/**
 * Tiers in reading order
 * @type {RecapTierName[]}
 */

export const RECAP_TIER_ORDER: RecapTierName[] = ['act', 'follow', 'glance']

// Notification kinds that ask for something, the others read as plain movement
const ACT_KINDS: NotificationKindName[] = [
  'Mentioned',
  'CommentReplied',
  'TaskAssigned',
  'ProjectAssigned',
  'TeamAssigned',
  'HurdleShared',
  'MeetingInvited',
  'MeetingRequested',
  'AnnualReviewReminder',
  'LiveCoordinatorAsked',
  'LiveCoordinatorGap',
  'CandidateAssigned',
  'RecruitmentAssigned',
  'AttendanceRequested',
  'PimReviewDue',
  'PimReferentAssigned',
  'PimDeparture',
  'IdentityAlert',
  'UnbanSubmitted',
  'UnbanAssigned',
]

// Notification kinds that only keep the member in the loop
const GLANCE_KINDS: NotificationKindName[] = [
  'CommunicationPublished',
  'LiveAnnounced',
  'LiveStarted',
  'CreatorLive',
  'LiveCancelled',
]

/**
 * Notification kinds the recap leaves out, a trial or a game call has no place in it
 * @type {Set<NotificationKindName>}
 */

export const RECAP_SKIPPED = new Set<NotificationKindName>([
  'PushTrial',
  'PlayInvited',
  'PlayGroupInvited',
  'PlayFollowedStarted',
  'StepValidated',
])

/**
 * Weight of one notification kind
 * @param {NotificationKindName} kind - Notification kind
 * @return {RecapTierName} - Tier it belongs to
 */

export const tierOfKind = (kind: NotificationKindName): RecapTierName => {
  if (ACT_KINDS.includes(kind)) return 'act'

  return GLANCE_KINDS.includes(kind) ? 'glance' : 'follow'
}
