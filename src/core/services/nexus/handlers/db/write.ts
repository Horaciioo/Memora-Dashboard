import 'server-only'

import { conflict, notFound } from '@/core/lib/errors'
import { prisma } from '@/core/lib/db'
import { pick } from '@/core/lib/nexus/diff'
import {
  assertWritable,
  delegateOf,
  entityOf,
  idValue,
  plain,
  selectOf,
} from '@/core/services/nexus/handlers/db/access'
import type { EntityHandle, Row } from '@/core/services/nexus/handlers/db/access'
import { dependentsOf } from '@/core/services/nexus/handlers/db/links'
import { assertUnmoved } from '@/core/services/nexus/handlers/db/preview'
import type { HandlerContext, NexusHandler } from '@/core/services/nexus/handlers/types'
import { DB_COPY } from '@/declarations/nexus/modulesCopy'

// Values typed by the argument checks
const valuesOf = (context: HandlerContext): Row => (context.args.set ?? {}) as Row

// Handle of a writable entity
const writableOf = (context: HandlerContext): EntityHandle => {
  const handle = entityOf(context.params.entity)
  assertWritable(handle, context.args['force-seeded'] === true)

  return handle
}

// Current row inside the change
const currentOf = async (context: HandlerContext, handle: EntityHandle, id: unknown) => {
  const row = await delegateOf(context.tx ?? prisma, handle.key).findUnique({
    where: { id },
    select: selectOf(handle),
  })
  if (!row) throw notFound(DB_COPY.rowMissing)

  return plain(row)
}

const update: NexusHandler = async (context) => {
  const handle = writableOf(context)
  const id = idValue(handle, String(context.args.id))
  const target = `${handle.key}:${id}`
  const values = valuesOf(context)
  if (Object.keys(values).length === 0) throw conflict(DB_COPY.nothingToSet)

  const current = await currentOf(context, handle, id)
  const before = pick(current, Object.keys(values))
  const after = plain(values)

  // Preview stops here
  if (context.dryRun) return { output: { before, after }, target, before, after }

  await assertUnmoved(context, target, before)
  await delegateOf(context.tx ?? prisma, handle.key).update({ where: { id }, data: values })

  return { output: { before, after }, target, before, after, reversible: true }
}

// Required columns the creation leaves empty
const missingRequired = (handle: EntityHandle, values: Row): string[] =>
  handle.columns
    .filter((column) => !column.optional && !column.hasDefault && !column.updatedAt)
    .map((column) => column.name)
    .filter((name) => !(name in values))

const create: NexusHandler = async (context) => {
  const handle = writableOf(context)
  const values = valuesOf(context)

  const missing = missingRequired(handle, values)
  if (missing.length > 0) throw conflict(`Colonnes requises : ${missing.join(', ')}`)

  const after = plain(values)
  if (context.dryRun) return { output: { before: {}, after }, target: handle.key, after }

  const row = await delegateOf(context.tx ?? prisma, handle.key).create({
    data: values,
    select: selectOf(handle),
  })
  const target = `${handle.key}:${String(row.id)}`

  return {
    output: { before: {}, after: plain(row) },
    target,
    before: {},
    after: plain(row),
    reversible: true,
  }
}

const remove: NexusHandler = async (context) => {
  const handle = writableOf(context)
  const id = idValue(handle, String(context.args.id))
  const target = `${handle.key}:${id}`
  const current = await currentOf(context, handle, id)

  // Anything depending on the row blocks
  const dependents = await dependentsOf(handle.key, id)
  if (dependents.length > 0) {
    const detail = dependents.map((item) => `${item.relation} ${item.action} ${item.rows}`)
    throw conflict(`${DB_COPY.hasDependents} : ${detail.join(', ')}`)
  }

  if (context.dryRun) return { output: { before: current, after: {} }, target, before: current }

  await assertUnmoved(context, target, current)
  await delegateOf(context.tx ?? prisma, handle.key).delete({ where: { id } })

  return {
    output: { before: current, after: {} },
    target,
    before: current,
    after: {},
    reversible: handle.masked.length === 0,
  }
}

/**
 * Changes of the database module
 * @type {Record<string, NexusHandler>}
 */

export const DB_WRITE_HANDLERS: Record<string, NexusHandler> = {
  'db.update': update,
  'db.create': create,
  'db.delete': remove,
}
