import 'server-only'

import { prisma } from '@/core/lib/db'
import { redactInput } from '@/core/lib/nexus/redact'
import type { NexusHandler } from '@/core/services/nexus/handlers/types'
import { NEXUS_SYSTEM } from '@/declarations/nexus/modulesSettings'
import { EVENT_ORIGINS } from '@/utils/constants/events'

// Commands that leave a mark on the system
const MARKING = ['access.', 'system.', 'configurations.']

const history: NexusHandler = async (context) => {
  const since = context.args.since instanceof Date ? context.args.since : undefined
  const type = context.args.type ? String(context.args.type) : null
  const take = NEXUS_SYSTEM.queueRows

  const [logs, audits] = await Promise.all([
    prisma.activityLog.findMany({
      where: { origin: EVENT_ORIGINS.ids.System, ...(since && { createdAt: { gte: since } }) },
      orderBy: { createdAt: 'desc' },
      take,
      select: { createdAt: true, summary: true, eventType: true },
    }),
    prisma.nexusAudit.findMany({
      where: {
        status: 'OK',
        level: { in: ['write', 'dangerous'] },
        OR: MARKING.map((prefix) => ({ commandId: { startsWith: prefix } })),
        ...(since && { createdAt: { gte: since } }),
      },
      orderBy: { createdAt: 'desc' },
      take,
      select: { createdAt: true, commandId: true, input: true },
    }),
  ])

  const events = [
    ...logs.map((row) => ({
      at: row.createdAt,
      label: `Système : ${row.summary}`,
      kind: 'system',
    })),
    ...audits.map((row) => ({
      at: row.createdAt,
      label: `Nexus ${row.commandId} : ${redactInput(row.input)}`,
      kind: 'nexus',
    })),
  ]
    .filter((event) => !type || event.kind === type)
    .sort((a, b) => b.at.getTime() - a.at.getTime())
    .slice(0, take)

  return { output: events }
}

/**
 * Events of the system module
 * @type {Record<string, NexusHandler>}
 */

export const EVENT_HANDLERS: Record<string, NexusHandler> = { 'system.eventsHistory': history }
