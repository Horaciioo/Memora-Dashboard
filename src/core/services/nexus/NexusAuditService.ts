import 'server-only'

import { prisma } from '@/core/lib/db'
import { NEXUS_COMMANDS, NEXUS_RETENTION } from '@/declarations/nexus/settings'
import { DAY_MS } from '@/utils/constants/time'
import type { NexusAuditStatus, Prisma } from '@prisma/client'

/**
 * Line to write
 * @typedef {Object} AuditEntry
 * @property {string | null} nexusSessionId - Console session
 * @property {string} accountId - Owner
 * @property {string | null} commandId - Resolved command
 * @property {string} input - Typed text, secrets masked
 * @property {string | null} level - Level of the command
 * @property {NexusAuditStatus} status - Outcome
 * @property {string} [refusal] - Pipeline step that refused
 * @property {string} [target] - Entity and identifier aimed at
 * @property {unknown} [before] - Masked value before
 * @property {unknown} [after] - Masked value after
 * @property {boolean} [reversible] - Can be undone
 * @property {string} requestId - Request identifier
 * @property {number} durationMs - Time taken
 * @property {string | null} address - Client address
 */

export interface AuditEntry {
  nexusSessionId: string | null
  accountId: string
  commandId: string | null
  input: string
  level: string | null
  status: NexusAuditStatus
  refusal?: string
  target?: string
  before?: unknown
  after?: unknown
  reversible?: boolean
  requestId: string
  durationMs: number
  address: string | null
}

// Client able to write a line
type AuditClient = Pick<Prisma.TransactionClient, 'nexusAudit'>

// Json column value
const asJson = (value: unknown): Prisma.InputJsonValue | undefined =>
  value === undefined ? undefined : (JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue)

/**
 * Write one audit line, in the caller's transaction when given
 * @param {AuditEntry} entry - Line to write
 * @param {AuditClient} [client] - Transaction or default client
 * @return {Promise<void>}
 */

export const recordAudit = async (
  entry: AuditEntry,
  client: AuditClient = prisma
): Promise<void> => {
  await client.nexusAudit.create({
    data: { ...entry, before: asJson(entry.before), after: asJson(entry.after) },
  })
}

/**
 * Filters of an audit reading
 * @typedef {Object} AuditFilter
 * @property {string} accountId - Owner
 * @property {Date} [since] - Oldest line
 * @property {string} [command] - Command identifier
 * @property {string} [target] - Target text
 * @property {number} page - Page from 1
 */

export interface AuditFilter {
  accountId: string
  since?: Date
  command?: string
  target?: string
  page: number
}

/**
 * Read a page of the audit, newest first
 * @param {AuditFilter} filter - Filters
 * @return {Promise<{ rows: object[], total: number }>} - Lines and count
 */

export const readAudit = async (filter: AuditFilter) => {
  const where: Prisma.NexusAuditWhereInput = {
    accountId: filter.accountId,
    ...(filter.since ? { createdAt: { gte: filter.since } } : {}),
    ...(filter.command ? { commandId: filter.command } : {}),
    ...(filter.target ? { target: { contains: filter.target } } : {}),
  }
  const take = NEXUS_COMMANDS.auditPageSize

  const [rows, total] = await Promise.all([
    prisma.nexusAudit.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take,
      skip: (filter.page - 1) * take,
      select: {
        id: true,
        createdAt: true,
        commandId: true,
        input: true,
        status: true,
        refusal: true,
        target: true,
        durationMs: true,
      },
    }),
    prisma.nexusAudit.count({ where }),
  ])

  return { rows, total }
}

/**
 * Read one audit line
 * @param {string} accountId - Owner
 * @param {string} id - Line identifier
 * @return {Promise<object | null>} - Full line or null
 */

export const readAuditLine = (accountId: string, id: string) =>
  prisma.nexusAudit.findFirst({ where: { id, accountId } })

/**
 * Drop console traces past their window, left out of the maintenance report
 * @return {Promise<void>}
 */

export const purgeNexusTraces = async (): Promise<void> => {
  const now = Date.now()
  const before = (days: number): Date => new Date(now - days * DAY_MS)

  await Promise.all([
    prisma.nexusAudit.deleteMany({
      where: { createdAt: { lt: before(NEXUS_RETENTION.auditDays) } },
    }),
    prisma.nexusAttempt.deleteMany({
      where: { createdAt: { lt: before(NEXUS_RETENTION.attemptDays) } },
    }),
    prisma.nexusSession.deleteMany({
      where: { expiresAt: { lt: before(NEXUS_RETENTION.attemptDays) } },
    }),
    prisma.nexusLockout.deleteMany({
      where: { until: { lt: before(NEXUS_RETENTION.attemptDays) } },
    }),
  ])
}
