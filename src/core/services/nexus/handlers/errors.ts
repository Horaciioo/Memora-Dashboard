import 'server-only'

import { prisma } from '@/core/lib/db'
import { notFound } from '@/core/lib/errors'
import { redactRecord } from '@/core/lib/nexus/redact'
import { OBSERVABILITY } from '@/core/lib/nexus/observe/registry'
import { shortCode } from '@/core/lib/nexus/observe/fingerprint'
import type { NexusHandler } from '@/core/services/nexus/handlers/types'
import { relatedEvents } from '@/core/services/nexus/handlers/related'
import { NEXUS_COMMANDS } from '@/declarations/nexus/settings'
import type { ErrorSeverity, ErrorSource, Prisma } from '@prisma/client'

// Optional text argument
const text = (value: unknown): string | undefined => (value ? String(value) : undefined)

// Moment given by --since or --last
const sinceOf = (args: Record<string, unknown>): Date | undefined =>
  args.since instanceof Date
    ? args.since
    : typeof args.last === 'number'
      ? new Date(Date.now() - args.last * 1000)
      : undefined

// Row as the table shows it
const summary = (row: {
  id: string
  severity: string
  source: string
  route: string | null
  message: string
  occurrences: number
  lastAt: Date
  requestId: string | null
  resolvedAt: Date | null
}) => ({
  id: row.id,
  code: row.requestId ? shortCode(row.requestId) : null,
  severity: row.severity.toLowerCase(),
  source: row.source.toLowerCase(),
  route: row.route,
  message: row.message,
  count: row.occurrences,
  lastAt: row.lastAt,
  resolved: row.resolvedAt !== null,
})

const errors: NexusHandler = async ({ args }) => {
  const page = Number(args.page ?? 1)
  const accountKey = text(args.user)
  const where: Prisma.ErrorEventWhereInput = {
    lastAt: sinceOf(args) ? { gte: sinceOf(args) } : undefined,
    severity: text(args.severity)?.toUpperCase() as ErrorSeverity | undefined,
    source: text(args.source)?.toUpperCase() as ErrorSource | undefined,
    route: text(args.route) ? { contains: text(args.route), mode: 'insensitive' } : undefined,
    accountId: accountKey,
    resolvedAt: args.open === true ? null : undefined,
  }
  const [rows, total] = await Promise.all([
    prisma.errorEvent.findMany({
      where,
      orderBy: { lastAt: 'desc' },
      take: NEXUS_COMMANDS.pageSize,
      skip: (page - 1) * NEXUS_COMMANDS.pageSize,
    }),
    prisma.errorEvent.count({ where }),
  ])

  return { output: rows.map(summary), pagination: { page, total } }
}

const error: NexusHandler = async ({ args }) => {
  const id = text(args.id)
  const code = text(args.code)?.toUpperCase()
  if (!id && !code) throw notFound()

  const row = id
    ? await prisma.errorEvent.findUnique({ where: { id } })
    : await findByCode(code as string)
  if (!row) throw notFound()

  return {
    output: { ...redactRecord({ ...row }), related_events: await relatedEvents(row) },
    target: `errorEvent:${row.id}`,
  }
}

// A short code is the head of a request identifier
const findByCode = async (code: string) => {
  const recent = await prisma.errorEvent.findMany({
    where: { requestId: { not: null } },
    orderBy: { lastAt: 'desc' },
    take: NEXUS_COMMANDS.maxRows,
  })

  return recent.find((row) => row.requestId && shortCode(row.requestId) === code) ?? null
}

const resolve: NexusHandler = async ({ args, tx, dryRun }) => {
  const id = String(args.id)
  const db = tx ?? prisma
  const row = await db.errorEvent.findUnique({ where: { id } })
  if (!row) throw notFound()

  const before = { resolvedAt: row.resolvedAt }
  const after = { resolvedAt: new Date() }
  if (!dryRun) await db.errorEvent.update({ where: { id }, data: after })

  return {
    output: dryRun ? { before, after } : 'Erreur marquée résolue',
    target: `errorEvent:${id}`,
    before,
    after,
    reversible: true,
  }
}

const logs: NexusHandler = async ({ args }) => {
  const lines = OBSERVABILITY.logs.read({
    level: text(args.level),
    since: sinceOf(args)?.getTime(),
    grep: text(args.grep),
    requestId: text(args.request),
  })

  return {
    output: lines
      .slice(-NEXUS_COMMANDS.maxRows)
      .reverse()
      .map((line) => ({ at: new Date(line.at), label: `${line.level} ${line.text}` })),
  }
}

const userErrors: NexusHandler = async ({ args }) => {
  const key = String(args.user)
  const account = await prisma.account.findFirst({
    where: { OR: [{ id: key }, { discordId: key }] },
    select: { id: true },
  })
  if (!account) throw notFound()

  const rows = await prisma.errorEvent.findMany({
    where: { accountId: account.id },
    orderBy: { lastAt: 'desc' },
    take: NEXUS_COMMANDS.pageSize,
  })

  return { output: rows.map(summary) }
}

const trace: NexusHandler = async ({ args }) => {
  const requestId = String(args.request)
  const [events, audits, lines] = await Promise.all([
    prisma.errorEvent.findMany({ where: { requestId }, take: NEXUS_COMMANDS.maxRows }),
    prisma.nexusAudit.findMany({ where: { requestId }, take: NEXUS_COMMANDS.maxRows }),
    prisma.activityLog.findMany({ where: { requestId }, take: NEXUS_COMMANDS.maxRows }),
  ])

  return {
    output: {
      errors: events.map(summary),
      audit: audits.map((row) => ({
        commandId: row.commandId,
        status: row.status,
        at: row.createdAt,
      })),
      journal: lines.map((row) => ({
        eventType: row.eventType,
        summary: row.summary,
        at: row.createdAt,
      })),
      logs: OBSERVABILITY.logs.read({ requestId }).map((line) => `${line.level} ${line.text}`),
    },
  }
}

/**
 * Handlers of the error journal and logs
 * @type {Record<string, NexusHandler>}
 */

export const ERROR_HANDLERS: Record<string, NexusHandler> = {
  'memora.errors': errors,
  'memora.error': error,
  'memora.errorResolve': resolve,
  'memora.logs': logs,
  'memora.userErrors': userErrors,
  'memora.trace': trace,
}
