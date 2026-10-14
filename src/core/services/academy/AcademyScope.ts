import 'server-only'

import { notFound } from '@/core/lib/errors'
import { Permissions } from '@/utils/constants/permissions'
import type { PermissionHelpers, SessionUser } from '@/types/auth'
import type { Prisma } from '@prisma/client'

/**
 * Promotions and juniors a member is allowed to see
 * @typedef {Object} AcademyScope
 * @property {Prisma.AcademySessionWhereInput} session - Promotions in reach
 * @property {Prisma.AcademyJuniorWhereInput} juniors - Juniors in reach inside them
 */

export interface AcademyScope {
  session: Prisma.AcademySessionWhereInput
  juniors: Prisma.AcademyJuniorWhereInput
}

/**
 * Everything a member is allowed to see
 * @type {AcademyScope}
 */

export const OPEN_SCOPE: AcademyScope = { session: {}, juniors: {} }

/**
 * Sessions and juniors a member is allowed to see
 * @param {SessionUser} viewer - Signed-in member
 * @param {PermissionHelpers} access - Permission helpers
 * @return {AcademyScope} - Where clauses
 */

export const academyScope = (viewer: SessionUser, access: PermissionHelpers): AcademyScope => {
  if (access.isAdmin || access.isResponsable) return OPEN_SCOPE

  // A trainer follows their own juniors only, a junior sees nobody but themselves
  return {
    session: {
      OR: [
        { functionId: { in: viewer.functionIds } },
        { juniors: { some: { OR: [{ accountId: viewer.id }, { trainerId: viewer.id }] } } },
        { trainers: { some: { accountId: viewer.id } } },
      ],
    },
    juniors: { OR: [{ accountId: viewer.id }, { trainerId: viewer.id }] },
  }
}

/**
 * Guard a junior-scoped read
 * @param {SessionUser} viewer - Signed-in member
 * @param {PermissionHelpers} access - Permission helpers
 * @param {{ accountId: string }} junior - Junior being read
 * @return {void} - Throws when neither broad nor self access applies
 */

export const assertJuniorViewer = (
  viewer: SessionUser,
  access: PermissionHelpers,
  junior: { accountId: string }
): void => {
  if (access.can(Permissions.AcademyRead)) return
  // A junior with only self access never reaches a file other than their own
  if (access.can(Permissions.AcademySelfRead) && junior.accountId === viewer.id) return

  throw notFound()
}
