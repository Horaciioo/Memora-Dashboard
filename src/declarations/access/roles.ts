import { createRegistry } from '@/core/lib/registry'
import { MemberRoles, MemberStatuses, AcademyPeriods } from '@/utils/constants/hierarchy'
import type {
  AcademyPeriodName,
  MemberRoleName,
  MemberStatusName,
} from '@/utils/constants/hierarchy'
import { Permissions, PermissionsList } from '@/utils/constants/permissions'
import type { PermissionName } from '@/utils/constants/permissions'

/**
 * Hierarchy level metadata
 * @typedef {Object} RoleOption
 * @property {string} label - Display name
 * @property {string} summary - Short description
 * @property {number} rank - Higher outranks lower
 * @property {string} accent - Token driving the badge colour
 */

interface RoleOption {
  label: string
  summary: string
  rank: number
  accent: string
}

const ROLE_MAP: Record<MemberRoleName, RoleOption> = {
  [MemberRoles.Admin]: {
    label: 'Admin',
    summary: 'Pilote les responsables et fait la passerelle avec les YouTubeurs.',
    rank: 3,
    accent: 'brand',
  },
  [MemberRoles.Responsable]: {
    label: 'Responsable',
    summary: 'Chef d’équipe, il a une ou plusieurs équipes à charge.',
    rank: 2,
    accent: 'info',
  },
  [MemberRoles.Moderateur]: {
    label: 'Modérateur',
    summary: 'Affecté à un YouTubeur et à une fonction de modération.',
    rank: 1,
    accent: 'neutral',
  },
}

export const ROLE_REGISTRY = createRegistry(ROLE_MAP)

/**
 * Membership status metadata
 * @typedef {Object} MemberStatusOption
 * @property {string} label - Display name
 * @property {string} accent - Token driving the badge colour
 */

interface MemberStatusOption {
  label: string
  accent: string
}

const MEMBER_STATUS_MAP: Record<MemberStatusName, MemberStatusOption> = {
  [MemberStatuses.Academy]: { label: 'Academy', accent: 'info' },
  [MemberStatuses.Active]: { label: 'Actif', accent: 'success' },
  [MemberStatuses.Paused]: { label: 'En pause', accent: 'warning' },
  [MemberStatuses.Left]: { label: 'Parti', accent: 'neutral' },
}

export const MEMBER_STATUS_REGISTRY = createRegistry(MEMBER_STATUS_MAP)

/**
 * Academy period metadata
 * @typedef {Object} AcademyPeriodOption
 * @property {string} label - Display name
 * @property {string} summary - What the period covers
 * @property {number} step - Order inside the academy
 */

interface AcademyPeriodOption {
  label: string
  summary: string
  step: number
}

const ACADEMY_PERIOD_MAP: Record<AcademyPeriodName, AcademyPeriodOption> = {
  [AcademyPeriods.Discovery]: {
    label: '1ʳᵉ période',
    summary: 'Découverte, observation et bases du poste.',
    step: 1,
  },
  [AcademyPeriods.Practice]: {
    label: '2ᵉ période',
    summary: 'Apprentissage, mise en application et test grandeur nature.',
    step: 2,
  },
}

export const ACADEMY_PERIOD_REGISTRY = createRegistry(ACADEMY_PERIOD_MAP)

/**
 * Every declared permission
 * @type {PermissionName[]}
 */

const ALL_PERMISSIONS: PermissionName[] = PermissionsList.map((entry) => entry.name)

/**
 * Suggested grants per hierarchy level
 * @type {Record<MemberRoleName, PermissionName[]>}
 */

export const ROLE_PRESETS: Record<MemberRoleName, PermissionName[]> = {
  [MemberRoles.Admin]: ALL_PERMISSIONS,
  [MemberRoles.Responsable]: [
    Permissions.MemberRead,
    Permissions.MemberCreate,
    Permissions.MemberUpdate,
    Permissions.MemberNoteRead,
    Permissions.MemberNoteWrite,
    Permissions.MemberLogRead,
    Permissions.ProjectRead,
    Permissions.ProjectCreate,
    Permissions.ProjectUpdate,
    Permissions.CommunicationRead,
    Permissions.CommunicationWrite,
    Permissions.TaskRead,
    Permissions.TaskCreate,
    Permissions.TaskUpdate,
    Permissions.TaskDelete,
    Permissions.MeetingRead,
    Permissions.MeetingCreate,
    Permissions.MeetingUpdate,
    Permissions.AbsenceRead,
    Permissions.AbsenceCreate,
    Permissions.AbsenceReview,
    Permissions.LiveconRead,
    Permissions.LiveconUpdate,
    Permissions.AcademyRead,
    Permissions.AcademyManage,
    Permissions.AcademyReviewRead,
    Permissions.AcademyReviewWrite,
    Permissions.AcademySkillWrite,
    Permissions.AcademyNoteRead,
    Permissions.AcademyNoteWrite,
    Permissions.AcademyObjectiveWrite,
    Permissions.AcademyReviewValidate,
    Permissions.TeamRead,
    Permissions.TeamManage,
    Permissions.CalendarRead,
    Permissions.CalendarManage,
    Permissions.ReferenceRead,
  ],
  [MemberRoles.Moderateur]: [
    Permissions.MemberRead,
    Permissions.ProjectRead,
    Permissions.CommunicationRead,
    Permissions.TaskRead,
    Permissions.TaskUpdate,
    Permissions.MeetingRead,
    Permissions.AbsenceCreate,
    Permissions.LiveconRead,
    Permissions.AcademyRead,
    Permissions.AcademySelfRead,
    Permissions.AcademyTrainingComplete,
    Permissions.TeamRead,
    Permissions.CalendarRead,
  ],
}
