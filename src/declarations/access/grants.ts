import { FunctionNames } from '@/declarations/reference/fixed'
import { ROLE_PRESETS } from '@/declarations/access/roles'
import { MemberRoles } from '@/utils/constants/hierarchy'
import type { MemberRoleName } from '@/utils/constants/hierarchy'
import { Permissions } from '@/utils/constants/permissions'
import type { PermissionName } from '@/utils/constants/permissions'

/**
 * One batch of permissions landing on an existing database
 * @typedef {Object} GrantAddition
 * @property {string} key - Stable identifier
 * @property {Partial<Record<MemberRoleName, PermissionName[]>>} grants - Permissions per role
 * @property {Record<string, PermissionName[]>} [functions] - Permissions per function name
 * @property {Partial<Record<MemberRoleName, PermissionName[]>>} [revokes] - Role permissions taken back
 * @property {Record<string, PermissionName[]>} [functionRevokes] - Function permissions taken back per function name
 * @property {Record<string, PermissionName[]>} [denies] - Permissions refused per function name
 * @property {Partial<Record<MemberRoleName, PermissionName[]>>} [roleDenies] - Permissions refused per role
 */

export interface GrantAddition {
  key: string
  grants: Partial<Record<MemberRoleName, PermissionName[]>>
  functions?: Record<string, PermissionName[]>
  functionRevokes?: Record<string, PermissionName[]>
  revokes?: Partial<Record<MemberRoleName, PermissionName[]>>
  denies?: Record<string, PermissionName[]>
  roleDenies?: Partial<Record<MemberRoleName, PermissionName[]>>
}

/**
 * Permission batches
 * @type {readonly GrantAddition[]}
 */

export const GRANT_ADDITIONS: readonly GrantAddition[] = [
  { key: 'initial-role-presets', grants: ROLE_PRESETS },
  // Databases born before the level carry no row for it
  {
    key: 'employee-role',
    grants: { [MemberRoles.Employe]: ROLE_PRESETS[MemberRoles.Employe] },
  },
  {
    key: 'work-visibility',
    grants: {
      [MemberRoles.Admin]: [
        Permissions.ProjectReadAll,
        Permissions.TaskManage,
        Permissions.MeetingContentRead,
        Permissions.WorkLogRead,
      ],
      [MemberRoles.Responsable]: [
        Permissions.ProjectReadAll,
        Permissions.TaskManage,
        Permissions.MeetingContentRead,
        Permissions.WorkLogRead,
      ],
      // Floor role writes announcements and tasks, inside the projects naming them
      [MemberRoles.Moderateur]: [Permissions.CommunicationWrite],
    },
  },
  {
    key: 'academy-fsi',
    grants: {
      [MemberRoles.Responsable]: [
        Permissions.AcademySkillWrite,
        Permissions.AcademyNoteRead,
        Permissions.AcademyNoteWrite,
        Permissions.AcademyObjectiveWrite,
        Permissions.AcademyReviewValidate,
      ],
      [MemberRoles.Moderateur]: [Permissions.AcademySelfRead, Permissions.AcademyTrainingComplete],
    },
  },
  {
    key: 'moderation-sanctions',
    grants: {
      [MemberRoles.Admin]: [Permissions.SanctionRead, Permissions.SanctionManage],
      [MemberRoles.Responsable]: [Permissions.SanctionRead, Permissions.SanctionManage],
      [MemberRoles.Moderateur]: [Permissions.SanctionRead],
    },
  },
  {
    key: 'recruitment-sessions',
    grants: {
      [MemberRoles.Admin]: [
        Permissions.RecruitmentRead,
        Permissions.RecruitmentManage,
        Permissions.RecruitmentCandidateWrite,
        Permissions.RecruitmentInstructionWrite,
      ],
      [MemberRoles.Responsable]: [
        Permissions.RecruitmentRead,
        Permissions.RecruitmentManage,
        Permissions.RecruitmentCandidateWrite,
        Permissions.RecruitmentInstructionWrite,
      ],
    },
  },
  {
    key: 'legacy-track',
    grants: {
      [MemberRoles.Responsable]: [Permissions.LegacyRead, Permissions.LegacyManage],
    },
  },
  {
    key: 'integration-links',
    grants: {
      [MemberRoles.Admin]: [Permissions.IntegrationManage],
      [MemberRoles.Responsable]: [Permissions.IntegrationManage],
    },
  },
  {
    key: 'live-modview',
    grants: {
      [MemberRoles.Admin]: [
        Permissions.LiveAnnounce,
        Permissions.LiveUnbanRequest,
        Permissions.LiveModeShield,
        Permissions.LiveModeSubscribers,
        Permissions.LiveModeFollowers,
        Permissions.LiveModeEmotes,
        Permissions.LiveModeSlow,
        Permissions.LiveTerms,
        Permissions.LiveCrisisChat,
        Permissions.LiveLogRead,
        Permissions.LiveCreatorReport,
      ],
      [MemberRoles.Responsable]: [
        Permissions.LiveAnnounce,
        Permissions.LiveUnbanRequest,
        Permissions.LiveModeEmotes,
        Permissions.LiveModeSlow,
        Permissions.LiveTerms,
        Permissions.LiveLogRead,
      ],
      // Floor role
      [MemberRoles.Moderateur]: [Permissions.LiveRead, Permissions.LiveModerate],
    },
  },
  {
    key: 'live-chat-modes-by-seat',
    grants: {
      [MemberRoles.Responsable]: [Permissions.LiveModeSubscribers],
      [MemberRoles.Moderateur]: [Permissions.LiveModeSlow],
    },
    // The Junior stands on the floor but never touches the modes
    roleDenies: { [MemberRoles.Junior]: [Permissions.LiveModeSlow, Permissions.LiveTerms] },
  },
  {
    key: 'live-pin',
    grants: {
      [MemberRoles.Admin]: [Permissions.LivePin],
      [MemberRoles.Responsable]: [Permissions.LivePin],
    },
  },
  {
    key: 'live-roster-focus',
    grants: {
      [MemberRoles.Admin]: [Permissions.LiveRoster, Permissions.LiveInspect, Permissions.LiveFocus],
      [MemberRoles.Responsable]: [
        Permissions.LiveRoster,
        Permissions.LiveInspect,
        Permissions.LiveFocus,
      ],
    },
    // Trainers follow their juniors only
    functions: { Formateurs: [Permissions.LiveFocus] },
  },
  {
    key: 'work-deletion',
    grants: {
      [MemberRoles.Admin]: [
        Permissions.ProjectDelete,
        Permissions.TaskDelete,
        Permissions.MeetingDelete,
      ],
      [MemberRoles.Responsable]: [
        Permissions.ProjectDelete,
        Permissions.TaskDelete,
        Permissions.MeetingDelete,
      ],
    },
  },
  {
    key: 'floor-work-read-only',
    grants: {},
    // Moderators read their work, never change it
    revokes: { [MemberRoles.Moderateur]: [Permissions.TaskCreate, Permissions.TaskUpdate] },
  },
  {
    key: 'communications-leads-only',
    grants: {},
    // Announcements belong to the lead, the floor never reads them
    revokes: {
      [MemberRoles.Moderateur]: [Permissions.CommunicationRead, Permissions.CommunicationWrite],
    },
  },
  {
    key: 'discord-no-live',
    grants: {},
    // Discord moderators have no live to follow
    denies: {
      [FunctionNames.Discord]: [
        Permissions.LiveRead,
        Permissions.LiveModerate,
        Permissions.LiveLogRead,
      ],
      [FunctionNames.JuniorDiscord]: [
        Permissions.LiveRead,
        Permissions.LiveModerate,
        Permissions.LiveLogRead,
      ],
    },
    // Lives as a second trade wins
    functions: {
      [FunctionNames.Lives]: [
        Permissions.LiveRead,
        Permissions.LiveModerate,
        Permissions.LiveLogRead,
      ],
      [FunctionNames.JuniorLives]: [
        Permissions.LiveRead,
        Permissions.LiveModerate,
        Permissions.LiveLogRead,
      ],
    },
  },
  {
    key: 'academy-recruitment-by-function',
    grants: {},
    // Only trainers and recruiters open these pages
    functions: {
      [FunctionNames.Trainers]: [Permissions.AcademyRead],
      [FunctionNames.Recruiters]: [Permissions.RecruitmentRead],
    },
    revokes: { [MemberRoles.Moderateur]: [Permissions.AcademyRead, Permissions.RecruitmentRead] },
  },
  {
    key: 'trainers-recruiters-working-rights',
    grants: {},
    // They do their work without any Responsable access
    functions: {
      [FunctionNames.Trainers]: [
        Permissions.AcademyReviewRead,
        Permissions.AcademyReviewWrite,
        Permissions.AcademySkillWrite,
        Permissions.AcademyNoteRead,
        Permissions.AcademyNoteWrite,
        Permissions.AcademyObjectiveWrite,
      ],
      [FunctionNames.Recruiters]: [Permissions.RecruitmentCandidateWrite],
    },
  },
  {
    key: 'observers-follow-recruitments',
    grants: {},
    // They read every session without touching it
    functions: { Observateurs: [Permissions.RecruitmentObserve] },
  },
  {
    key: 'trainers-calendar-off',
    grants: {},
    // Planning stays with the Responsables for now
    functionRevokes: { Formateurs: [Permissions.CalendarManage] },
  },
  {
    key: 'trainers-open-academy',
    grants: {},
    // Moderators holding the function open the Academy
    functions: { Formateurs: [Permissions.AcademyRead] },
  },
  {
    key: 'leads-see-youtubers',
    grants: {
      // They read the creator files and seat their teams, never touch the administration
      [MemberRoles.Responsable]: [
        Permissions.ReferenceRead,
        Permissions.TeamRead,
        Permissions.TeamManage,
      ],
    },
  },
  {
    key: 'memora-play',
    // Everyone opening Memora plays
    grants: { [MemberRoles.Moderateur]: [Permissions.PlayAccess] },
  },
  {
    key: 'memora-play-manage',
    // Leads steer the progression of those below
    grants: {
      [MemberRoles.Admin]: [Permissions.PlayManage],
      [MemberRoles.Responsable]: [Permissions.PlayManage],
    },
  },
]
