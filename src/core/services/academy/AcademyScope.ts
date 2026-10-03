import 'server-only'

import { notFound } from '@/core/lib/errors'
import { Permissions } from '@/utils/constants/permissions'
import type { PermissionHelpers, SessionUser } from '@/types/auth'
import type { Prisma } from '@prisma/client'

/**
 * Sessions a member is allowed to see
 * @param {SessionUser} viewer - Signed-in member
 * @param {PermissionHelpers} access - Permission helpers
 * @return {Prisma.AcademySessionWhereInput} - Where clause
 */

export const academyScope = (
  viewer: SessionUser,
  access: PermissionHelpers
): Prisma.AcademySessionWhereInput => {
  if (access.isAdmin || access.isResponsable) return {}

  // A junior trains under a junior function, their own seat still opens the session
  return {
    OR: [
      { functionId: { in: viewer.functionIds } },
      { juniors: { some: { accountId: viewer.id } } },
    ],
  }
}

/**
 * Guard a junior-scoped read, a plain junior only reaching their own file
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
