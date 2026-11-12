import 'server-only'

import { conflict, notFound } from '@/core/lib/errors'
import { prisma } from '@/core/lib/db'
import type { NexusHandler } from '@/core/services/nexus/handlers/types'
import { readRuntimeReport } from '@/core/services/system/ConsoleService'
import { SERVICE_INVENTORY } from '@/declarations/nexus/inventory'
import { SYSTEM_COPY } from '@/declarations/nexus/modulesCopy'
import { NEXUS_SYSTEM } from '@/declarations/nexus/modulesSettings'
import { runtime } from '@/managers/infrastructure/Core/runtime'
import { CONFIG_SUBJECTS } from '@/types/infrastructure'
import type { ConfigSubject } from '@/types/infrastructure'

// Subject named in the path
const subjectOf = (name: string): ConfigSubject => {
  const subject = CONFIG_SUBJECTS.find((candidate) => candidate === name)
  if (!subject) throw notFound(SYSTEM_COPY.unknownService)

  return subject
}

const services: NexusHandler = async () => {
  const report = readRuntimeReport()

  return {
    output: report.subjects.map((entry) => ({
      service: entry.subject,
      enabled: entry.enabled,
      status: entry.probe?.status ?? null,
      restartable: SERVICE_INVENTORY[entry.subject].restartable,
      dependsOn: SERVICE_INVENTORY[entry.subject].dependsOn.join(', '),
      dependents: CONFIG_SUBJECTS.filter((other) =>
        SERVICE_INVENTORY[other].dependsOn.includes(entry.subject)
      ).join(', '),
    })),
  }
}

// Games and lives a restart would meet
const inFlight = async () => ({
  games: await prisma.playSession.count({ where: { status: { in: ['RUNNING', 'PAUSED'] } } }),
  lives: await prisma.live.count({ where: { status: 'LIVE' } }),
})

const restart: NexusHandler = async (context) => {
  const subject = subjectOf(context.params.service)
  const entry = SERVICE_INVENTORY[subject]
  if (!entry.restartable) throw conflict(SYSTEM_COPY.notRestartable)

  // Preview lists what hangs on it
  const dependents = CONFIG_SUBJECTS.filter((other) =>
    SERVICE_INVENTORY[other].dependsOn.includes(subject)
  )
  const load = await inFlight()
  const output = { service: subject, dependents: dependents.join(', ') || 'aucun', ...load }
  if (context.dryRun) return { output, level: 'warning' }

  // Queues stop their workers then reopen
  const container = runtime()
  const queues = container?.queues
  if (subject !== 'queues' || !queues) throw conflict(SYSTEM_COPY.notRestartable)
  await Promise.race([
    queues.closeAll().then(() => queues.load()),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('restart timeout')), NEXUS_SYSTEM.restartTimeoutMs)
    ),
  ])

  return {
    output: { ...output, ready: queues.isReady() },
    level: queues.isReady() ? 'success' : 'warning',
    target: `service:${subject}`,
  }
}

/**
 * Services of the system module
 * @type {Record<string, NexusHandler>}
 */

export const SERVICE_HANDLERS: Record<string, NexusHandler> = {
  'system.services': services,
  'system.restart': restart,
}
