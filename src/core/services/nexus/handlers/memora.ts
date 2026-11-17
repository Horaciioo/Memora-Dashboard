import 'server-only'

import { buildInventoryReport } from '@/core/lib/nexus/inventory'
import { readAudit, readAuditLine } from '@/core/services/nexus/NexusAuditService'
import type { NexusHandler } from '@/core/services/nexus/handlers/types'
import { prisma } from '@/core/lib/db'
import {
  readAvailabilityChoice,
  setAvailability,
} from '@/core/services/preferences/AvailabilityService'
import { redactRecord } from '@/core/lib/nexus/redact'
import { notFound } from '@/core/lib/errors'

const inventory: NexusHandler = async () => ({ output: { ...buildInventoryReport() } })

const audit: NexusHandler = async (context) => {
  const page = Number(context.args.page ?? 1)
  const { rows, total } = await readAudit({
    accountId: context.accountId,
    since: context.args.since instanceof Date ? context.args.since : undefined,
    command: context.args.command ? String(context.args.command) : undefined,
    target: context.args.target ? String(context.args.target) : undefined,
    page,
  })

  return { output: rows, pagination: { page, total } }
}

const auditGet: NexusHandler = async (context) => {
  const line = await readAuditLine(context.accountId, String(context.args.id))
  if (!line) throw notFound()

  return { output: redactRecord({ ...line }) }
}

const availabilityOf = async (id: string) => {
  const account = await prisma.account.findUnique({
    where: { id },
    select: { id: true, displayName: true, availability: true },
  })
  if (!account) throw notFound()

  return account
}

const availability: NexusHandler = async (context) => ({
  output: await availabilityOf(String(context.args.id)),
})

const availabilitySet: NexusHandler = async (context) => {
  const before = await availabilityOf(String(context.args.id))
  const value = readAvailabilityChoice(String(context.args.value).toUpperCase())
  if (context.dryRun) return { output: { ...before, next: value } }

  const stored = await setAvailability(before.id, value)

  return {
    output: { ...before, availability: stored },
    target: `account:${before.id}`,
    before: before.availability,
    after: stored,
  }
}

/**
 * Handlers of Memora and console reads
 * @type {Record<string, NexusHandler>}
 */

export const MEMORA_HANDLERS: Record<string, NexusHandler> = {
  'memora.inventory': inventory,
  'memora.availability': availability,
  'memora.availabilitySet': availabilitySet,
  'nexus.audit': audit,
  'nexus.auditGet': auditGet,
}
