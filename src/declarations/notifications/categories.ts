import { createRegistry } from '@/core/lib/registry'
import type { IconName } from '@/declarations/ui/icons'
import type { NotificationKindName } from '@/utils/constants/notifications'

/**
 * Family a member silences on their phone
 * @type {string}
 */

export type PushCategoryName =
  | 'mentions'
  | 'work'
  | 'meetings'
  | 'absences'
  | 'lives'
  | 'recruitment'
  | 'academy'
  | 'announcements'

/**
 * How one push family reads in the settings
 * @typedef {Object} PushCategoryOption
 * @property {string} label - Family name
 * @property {string} description - What it carries
 * @property {IconName} icon - Glyph
 * @property {boolean} [urgent] - Wakes a sleeping phone
 */

export interface PushCategoryOption {
  label: string
  description: string
  icon: IconName
  urgent?: boolean
}

const PUSH_CATEGORY_MAP: Record<PushCategoryName, PushCategoryOption> = {
  mentions: {
    label: 'Mentions',
    description: 'Quand quelqu’un te cite avec @.',
    icon: 'discord',
    urgent: true,
  },
  work: {
    label: 'Tâches et projets',
    description: 'Une tâche, un projet, une équipe ou une difficulté qu’on te confie.',
    icon: 'tasks',
  },
  meetings: {
    label: 'Réunions et rendez-vous',
    description: 'Invitations, demandes de rendez-vous et bilans annuels.',
    icon: 'meetings',
  },
  absences: {
    label: 'Absences',
    description: 'Le traitement de tes absences.',
    icon: 'absences',
  },
  lives: {
    label: 'Lives',
    description: 'Convocations, lancements, coordination et bilans de live.',
    icon: 'liveDot',
    urgent: true,
  },
  recruitment: {
    label: 'Recrutement',
    description: 'Les candidatures et recrutements qu’on te confie.',
    icon: 'recruitment',
  },
  academy: {
    label: 'Formations et Academy',
    description: 'Formations, compétences, parcours Legacy, PIM et appels de présence.',
    icon: 'academy',
  },
  announcements: {
    label: 'Annonces et accès',
    description: 'Les communications publiées et les changements de tes accès.',
    icon: 'communications',
  },
}

export const PUSH_CATEGORY_REGISTRY = createRegistry<PushCategoryName, PushCategoryOption>(
  PUSH_CATEGORY_MAP
)

/**
 * Family of every notification kind
 * @type {Record<NotificationKindName, PushCategoryName>}
 */

export const PUSH_CATEGORY_OF_KIND: Record<NotificationKindName, PushCategoryName> = {
  Mentioned: 'mentions',
  TaskAssigned: 'work',
  ProjectAssigned: 'work',
  TeamAssigned: 'work',
  HurdleShared: 'work',
  MeetingInvited: 'meetings',
  MeetingRequested: 'meetings',
  AnnualSlotTaken: 'meetings',
  AnnualReviewReminder: 'meetings',
  AnnualSlotCancelled: 'meetings',
  AbsenceReviewed: 'absences',
  AbsenceAcknowledged: 'absences',
  LiveAnnounced: 'lives',
  LiveStarted: 'lives',
  LiveCancelled: 'lives',
  LiveReportReady: 'lives',
  LiveCoordinatorAsked: 'lives',
  LiveCoordinatorAccepted: 'lives',
  LiveCoordinatorDeclined: 'lives',
  LiveCoordinatorGap: 'lives',
  CandidateAssigned: 'recruitment',
  RecruitmentAssigned: 'recruitment',
  SkillGraded: 'academy',
  ReviewDecided: 'academy',
  StepValidated: 'academy',
  TrainingValidated: 'academy',
  TrainingFinished: 'academy',
  AttendanceRequested: 'academy',
  LegacyOpened: 'academy',
  LegacyDecided: 'academy',
  PimReviewDue: 'academy',
  PimReviewSubmitted: 'academy',
  PimLaunched: 'academy',
  PimSecondPeriod: 'academy',
  PimDeparture: 'academy',
  AccessChanged: 'announcements',
  CommunicationPublished: 'announcements',
  PushTrial: 'announcements',
}
