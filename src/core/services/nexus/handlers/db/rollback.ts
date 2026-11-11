import 'server-only'

import { conflict, notFound } from '@/core/lib/errors'
import { prisma } from '@/core/lib/db'
import { pick, sameValue } from '@/core/lib/nexus/diff'
import { delegateOf, entityOf, plain, selectOf } from '@/core/services/nexus/handlers/db/access'
import type { DbClient, EntityHandle, Row } from '@/core/services/nexus/handlers/db/access'
import { dependentsOf } from '@/core/services/nexus/handlers/db/links'
import { assertMigratable, migrateIdentifier } from '@/core/services/nexus/handlers/db/migrate'
import type {
  HandlerContext,
  HandlerResult,
  NexusHandler,
} from '@/core/services/nexus/handlers/types'
import { DB_COPY } from '@/declarations/nexus/modulesCopy'
import { NEXUS_COPY } from '@/declarations/nexus/copy'

// Stored line as the rollback reads it
interface Line {
  id: string
  commandId: string | null
  target: string | null
  before: Row
  after: Row
}

// Json column back to a plain record
const asRow = (value: unknown): Row =>
  value && typeof value === 'object' && !Array.isArray(value) ? (value as Row) : {}

// Stored text back to the column type
const fromStored = (handle: EntityHandle, stored: Row): Row =>
  Object.fromEntries(
    Object.entries(stored).map(([name, value]) => {
      const type = handle.columns.find((column) => column.name === name)?.type
      if (typeof value !== 'string') return [name, value]
      if (type === 'DateTime') return [name, new Date(value)]

      return [name, type === 'BigInt' ? BigInt(value) : value]
    })
  )

// Audit line that may be undone
const loadLine = async (context: HandlerContext): Promise<Line> => {
  const row = await prisma.nexusAudit.findFirst({
    where: { id: String(context.args['audit-id']), accountId: context.accountId },
  })
  if (!row) throw notFound(DB_COPY.auditMissing)
  if (row.status !== 'OK' || !row.reversible || !row.target) throw conflict(DB_COPY.notReversible)
  if (row.revertedById) throw conflict(DB_COPY.alreadyReverted)

  const line = {
    id: row.id,
    commandId: row.commandId,
    target: row.target,
    before: asRow(row.before),
    after: asRow(row.after),
  }
  if (JSON.stringify([line.before, line.after]).includes(NEXUS_COPY.masked)) {
    throw conflict(DB_COPY.masked)
  }

  return line
}

// Row now, null when gone
const readNow = async (client: DbClient, handle: EntityHandle, id: string) => {
  const row = await delegateOf(client, handle.key).findUnique({
    where: { id },
    select: selectOf(handle),
  })

  return row ? plain(row) : null
}

// Current state must still be the audit's after
const assertStill = (current: Row | null, expected: Row): Row => {
  if (!current || !sameValue(pick(current, Object.keys(expected)), expected)) {
    throw conflict(DB_COPY.stateMoved)
  }

  return current
}

/**
 * Describe and optionally undo one audit line
 * @param {HandlerContext} context - Handler context
 * @param {boolean} apply - Write the undo
 * @return {Promise<HandlerResult>} - Undo description
 */

const undo = async (context: HandlerContext, apply: boolean): Promise<HandlerResult> => {
  const line = await loadLine(context)
  const [key, id] = (line.target as string).split(':')
  const handle = entityOf(key)
  const client = apply && context.tx ? context.tx : prisma
  const delegate = delegateOf(client, key)
  const current = await readNow(client, handle, id)
  let result: { before: Row; after: Row }

  if (line.commandId === 'db.update') {
    assertStill(current, line.after)
    result = { before: pick(current as Row, Object.keys(line.before)), after: line.before }
    if (apply) await delegate.update({ where: { id }, data: fromStored(handle, line.before) })
  } else if (line.commandId === 'db.create') {
    assertStill(current, line.after)
    if ((await dependentsOf(key, id)).length > 0) throw conflict(DB_COPY.hasDependents)
    result = { before: line.after, after: {} }
    if (apply) await delegate.delete({ where: { id } })
  } else if (line.commandId === 'db.delete') {
    if (current) throw conflict(DB_COPY.stateMoved)
    result = { before: {}, after: line.before }
    if (apply) await delegate.create({ data: fromStored(handle, line.before) })
  } else if (line.commandId === 'db.migrate-id') {
    const oldId = String(line.before.id)
    assertStill(current, { id })
    await assertMigratable(client, handle, id, oldId)
    await migrateIdentifier(client, handle, id, oldId, apply)
    result = { before: { id }, after: { id: oldId } }
  } else {
    throw conflict(DB_COPY.notReversible)
  }

  // Original line points at this one
  if (apply) {
    await (context.tx ?? prisma).nexusAudit.update({
      where: { id: line.id },
      data: { revertedById: context.requestId },
    })
  }

  return {
    output: result,
    target: line.target as string,
    before: result.before,
    after: result.after,
  }
}

const rollback: NexusHandler = (context) => undo(context, !context.dryRun)

const preview: NexusHandler = (context) => undo(context, false)

/**
 * Undo of the database module
 * @type {Record<string, NexusHandler>}
 */

export const DB_ROLLBACK_HANDLERS: Record<string, NexusHandler> = {
  'db.rollback': rollback,
  'db.rollbackPreview': preview,
}
