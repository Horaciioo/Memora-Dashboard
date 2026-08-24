import 'server-only'

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

  const functionIds = [viewer.primaryFunctionId, viewer.secondaryFunctionId].filter(
    (id): id is string => id !== null
  )

  return { functionId: { in: functionIds } }
}
