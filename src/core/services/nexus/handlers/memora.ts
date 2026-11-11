import 'server-only'

import { buildInventoryReport } from '@/core/lib/nexus/inventory'
import { readAudit, readAuditLine } from '@/core/services/nexus/NexusAuditService'
import type { NexusHandler } from '@/core/services/nexus/handlers/types'
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

/**
 * Handlers of Memora and console reads
 * @type {Record<string, NexusHandler>}
 */

export const MEMORA_HANDLERS: Record<string, NexusHandler> = {
  'memora.inventory': inventory,
  'nexus.audit': audit,
  'nexus.auditGet': auditGet,
}
