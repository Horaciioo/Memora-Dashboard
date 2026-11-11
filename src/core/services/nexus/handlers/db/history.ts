import 'server-only'

import { prisma } from '@/core/lib/db'
import { redactInput } from '@/core/lib/nexus/redact'
import { entityOf, idValue } from '@/core/services/nexus/handlers/db/access'
import type { NexusHandler } from '@/core/services/nexus/handlers/types'
import { NEXUS_GAME } from '@/declarations/nexus/modulesSettings'

const history: NexusHandler = async (context) => {
  const handle = entityOf(context.params.entity)
  const id = String(idValue(handle, String(context.args.id)))
  const take = NEXUS_GAME.eventRows

  // Three sources, one timeline
  const [audits, logs, revisions] = await Promise.all([
    prisma.nexusAudit.findMany({
      where: { target: `${handle.key}:${id}`, status: 'OK' },
      orderBy: { createdAt: 'desc' },
      take,
      select: { id: true, createdAt: true, commandId: true, input: true },
    }),
    prisma.activityLog.findMany({
      where: { targetId: id },
      orderBy: { createdAt: 'desc' },
      take,
      select: { createdAt: true, summary: true },
    }),
    handle.key === 'page'
      ? prisma.pageRevision.findMany({
          where: { pageId: id },
          orderBy: { createdAt: 'desc' },
          take,
          select: { createdAt: true, version: true, title: true },
        })
      : Promise.resolve([]),
  ])

  const events = [
    ...audits.map((row) => ({
      at: row.createdAt,
      label: `Nexus ${row.commandId} : ${redactInput(row.input)} (audit ${row.id})`,
    })),
    ...logs.map((row) => ({ at: row.createdAt, label: `Journal : ${row.summary}` })),
    ...revisions.map((row) => ({
      at: row.createdAt,
      label: `Révision ${row.version} : ${row.title}`,
    })),
  ]

  return { output: events.sort((a, b) => b.at.getTime() - a.at.getTime()).slice(0, take) }
}

/**
 * History read of the database module
 * @type {Record<string, NexusHandler>}
 */

export const DB_HISTORY_HANDLERS: Record<string, NexusHandler> = { 'db.history': history }
