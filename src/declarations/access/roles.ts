import { createRegistry } from '@/core/lib/registry'
import { NavigationViews } from '@/declarations/navigation'
import type { NavigationViewName } from '@/declarations/navigation'
import { MemberRoles, MemberStatuses, AcademyPeriods } from '@/utils/constants/hierarchy'
import type {
  AcademyPeriodName,
  MemberRoleName,
  MemberStatusName,
} from '@/utils/constants/hierarchy'
import { Permissions, PermissionsList } from '@/utils/constants/permissions'
import type { PermissionName } from '@/utils/constants/permissions'
import type { IconName } from '@/declarations/ui/icons'

/**
 * Hierarchy level metadata
 * @typedef {Object} RoleOption
 * @property {string} label - Display name
 * @property {string} plural - Category heading
 * @property {string} summary - Short description
 * @property {number} rank - Higher outranks lower
 * @property {string} accent - Token driving the badge colour
 * @property {IconName} icon - Glyph replacing the label on compact badges
 * @property {NavigationViewName} [view] - Rail view the level unlocks
 */

interface RoleOption {
  label: string
  plural: string
  summary: string
  rank: number
  accent: string
  icon: IconName
  view?: NavigationViewName
}

const ROLE_MAP: Record<MemberRoleName, RoleOption> = {
  [MemberRoles.Admin]: {
    label: 'Admin',
    plural: 'Admins',
    summary: 'Pilote les responsables et fait la passerelle avec les YouTubeurs.',
    rank: 3,
    accent: 'authorityAdmin',
    icon: 'crown',
    view: NavigationViews.Administration,
  },
  [MemberRoles.Responsable]: {
    label: 'Responsable',
    plural: 'Responsables',
    summary: 'Chef d’équipe, il a une ou plusieurs équipes à charge.',
    rank: 2,
    accent: 'authorityLead',
    icon: 'flame',
    view: NavigationViews.Lead,
  },
  [MemberRoles.Moderateur]: {
    label: 'Modérateur',
    plural: 'Modérateurs',
    summary: 'Affecté à un YouTubeur et à une fonction de modération.',
    rank: 1,
    accent: 'info',
    icon: 'shieldOutline',
  },
  [MemberRoles.Junior]: {
    label: 'Junior',
    plural: 'Juniors',
    summary: 'Admis par recrutement, il suit sa PIM avant de devenir Modérateur.',
    rank: 0,
    accent: 'caution',
    icon: 'academy',
  },
}

export const ROLE_REGISTRY = createRegistry(ROLE_MAP)

/**
 * Highest role first
 * @param {MemberRoleName} left - One role
 * @param {MemberRoleName} right - Other role
 * @return {number} - Sort order
 */

export const byRoleRank = (left: MemberRoleName, right: MemberRoleName): number =>
  ROLE_MAP[right].rank - ROLE_MAP[left].rank

/**
 * Level every account stands on
 * @type {MemberRoleName}
 */

export const FLOOR_ROLE: MemberRoleName = MemberRoles.Moderateur

/**
 * Encadrement levels
 * @type {MemberRoleName[]}
 */

export const ENCADREMENT_ROLES: MemberRoleName[] = ROLE_REGISTRY.keys
  .filter((role) => ROLE_MAP[role].rank >= ROLE_MAP[MemberRoles.Responsable].rank)
  .sort((left, right) => ROLE_MAP[left].rank - ROLE_MAP[right].rank)

/**
 * Check the encadrement
 * @param {MemberRoleName} role - Hierarchy level
 * @return {boolean} - Sits at responsable level or above
 */

export const isEncadrement = (role: MemberRoleName): boolean => ENCADREMENT_ROLES.includes(role)

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
  [MemberStatuses.Pending]: { label: 'En attente', accent: 'caution' },
  [MemberStatuses.Academy]: { label: 'Academy', accent: 'info' },
  [MemberStatuses.Active]: { label: 'Actif', accent: 'success' },
  [MemberStatuses.Paused]: { label: 'En pause', accent: 'warning' },
  [MemberStatuses.Left]: { label: 'Parti', accent: 'neutral' },
  [MemberStatuses.Dismissed]: { label: 'Destitué', accent: 'danger' },
  [MemberStatuses.Resigned]: { label: 'Démissionnaire', accent: 'neutral' },
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
    Permissions.SanctionRead,
    Permissions.SanctionManage,
    Permissions.AcademyRead,
    Permissions.AcademyManage,
    Permissions.AcademyReviewRead,
    Permissions.AcademyReviewWrite,
    Permissions.AcademySkillWrite,
    Permissions.AcademyNoteRead,
    Permissions.AcademyNoteWrite,
    Permissions.AcademyObjectiveWrite,
    Permissions.AcademyReviewValidate,
    Permissions.LegacyRead,
    Permissions.LegacyManage,
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
    Permissions.SanctionRead,
    Permissions.AcademyRead,
    Permissions.AcademySelfRead,
    Permissions.AcademyTrainingComplete,
    Permissions.LegacySelf,
    Permissions.TeamRead,
    Permissions.CalendarRead,
  ],
  // Stands on the floor role
  [MemberRoles.Junior]: [],
}
