import { ROLE_PRESETS } from '@/declarations/access/roles'
import { MemberRoles } from '@/utils/constants/hierarchy'
import type { MemberRoleName } from '@/utils/constants/hierarchy'
import { Permissions } from '@/utils/constants/permissions'
import type { PermissionName } from '@/utils/constants/permissions'

/**
 * One batch of permissions landing on an existing database
 * @typedef {Object} GrantAddition
 * @property {string} key - Stable identifier, never reused
 * @property {Partial<Record<MemberRoleName, PermissionName[]>>} grants - Permissions per role
 */

export interface GrantAddition {
  key: string
  grants: Partial<Record<MemberRoleName, PermissionName[]>>
}

/**
 * Permission batches, applied once each and never taken back — a permission an
 * administrator removes afterwards stays removed
 * @type {readonly GrantAddition[]}
 */

export const GRANT_ADDITIONS: readonly GrantAddition[] = [
  { key: 'initial-role-presets', grants: ROLE_PRESETS },
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
      [MemberRoles.Moderateur]: [Permissions.RecruitmentRead],
    },
  },
  {
    key: 'integration-links',
    grants: {
      [MemberRoles.Admin]: [Permissions.IntegrationManage],
      [MemberRoles.Responsable]: [Permissions.IntegrationManage],
    },
  },
]
