import 'server-only'

import { prisma } from '@/core/lib/db'
import { notFound } from '@/core/lib/errors'
import { scopedWhere } from '@/core/services/auth/ScopeService'
import type { AccessScope } from '@/core/services/auth/ScopeService'

/**
 * Refuse a request outside the perimeter, as if it did not exist
 * @param {string} id - Request identifier
 * @param {AccessScope} scope - Creator perimeter
 * @return {Promise<void>} - Throws when hidden
 */

export const assertRequestInScope = async (id: string, scope: AccessScope): Promise<void> => {
  const count = await prisma.unbanRequest.count({
    where: scopedWhere('unbanRequest', scope, { id }),
  })
  if (count === 0) throw notFound()
}
