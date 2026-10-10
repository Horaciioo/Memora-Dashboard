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
 * @property {Record<string, PermissionName[]>} [denies] - Permissions refused per function name
 */

export interface GrantAddition {
  key: string
  grants: Partial<Record<MemberRoleName, PermissionName[]>>
  functions?: Record<string, PermissionName[]>
  revokes?: Partial<Record<MemberRoleName, PermissionName[]>>
  denies?: Record<string, PermissionName[]>
}

/**
 * Permission batches
 * @type {readonly GrantAddition[]}
 */

export const GRANT_ADDITIONS: readonly GrantAddition[] = [
  { key: 'initial-role-presets', grants: ROLE_PRESETS },
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
    key: 'legacy-self-functions',
    grants: {},
    // Only a Junior Responsable follows a track
    functions: {
      'Junior Responsable Discord': [Permissions.LegacySelf],
      'Junior Responsable Lives': [Permissions.LegacySelf],
      'Junior Responsable Animateurs': [Permissions.LegacySelf],
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
    key: 'discord-no-live',
    grants: {},
    // Discord moderators have no live to follow
    denies: {
      Discord: [Permissions.LiveRead, Permissions.LiveModerate, Permissions.LiveLogRead],
      'Junior Discord': [Permissions.LiveRead, Permissions.LiveModerate, Permissions.LiveLogRead],
    },
  },
  {
    key: 'academy-recruitment-by-function',
    grants: {},
    // Only trainers and recruiters open these pages
    functions: {
      Formateurs: [Permissions.AcademyRead],
      Recruteurs: [Permissions.RecruitmentRead],
    },
    revokes: { [MemberRoles.Moderateur]: [Permissions.AcademyRead, Permissions.RecruitmentRead] },
  },
]
