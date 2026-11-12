import 'server-only'

import { conflict } from '@/core/lib/errors'
import { prisma } from '@/core/lib/db'
import { pick, sameValue } from '@/core/lib/nexus/diff'
import type { HandlerContext } from '@/core/services/nexus/handlers/types'
import { DB_COPY } from '@/declarations/nexus/modulesCopy'
import { NEXUS_COMMANDS } from '@/declarations/nexus/settings'
import { SECOND_MS } from '@/utils/constants/time'

/**
 * Refuse when the row moved since its preview
 * @param {HandlerContext} context - Handler context
 * @param {string} target - Entity and identifier
 * @param {Record<string, unknown>} current - Row now, plain
 * @return {Promise<void>} - Throws when changed
 */

export const assertUnmoved = async (
  context: HandlerContext,
  target: string,
  current: Record<string, unknown>
): Promise<void> => {
  if (!context.nexus) return

  // Last preview of this row
  const previewed = await prisma.nexusAudit.findFirst({
    where: {
      nexusSessionId: context.nexus.id,
      target,
      status: 'PREVIEWED',
      createdAt: { gt: new Date(Date.now() - NEXUS_COMMANDS.confirmSeconds * SECOND_MS) },
    },
    orderBy: { createdAt: 'desc' },
    select: { before: true },
  })
  const seen = previewed?.before
  if (!seen || typeof seen !== 'object' || Array.isArray(seen)) return

  // Same values on the columns shown
  const shown = seen as Record<string, unknown>
  if (!sameValue(shown, pick(current, Object.keys(shown)))) throw conflict(DB_COPY.rowMoved)
}
