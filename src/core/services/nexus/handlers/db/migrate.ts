import 'server-only'

import { conflict, forbidden, notFound } from '@/core/lib/errors'
import { prisma } from '@/core/lib/db'
import { assertWritable, delegateOf, entityOf } from '@/core/services/nexus/handlers/db/access'
import type { DbClient, EntityHandle } from '@/core/services/nexus/handlers/db/access'
import { dependentsOf } from '@/core/services/nexus/handlers/db/links'
import type { NexusHandler } from '@/core/services/nexus/handlers/types'
import { MIGRATABLE_ENTITIES } from '@/declarations/nexus/inventory/references'
import { DB_COPY } from '@/declarations/nexus/modulesCopy'

// Lowercase cuid style stays so
const LOWER_ID = /^[a-z0-9]+$/

/**
 * Counts a migration will touch
 * @typedef {Object} MigrationScope
 * @property {number} followed - Rows the database rewrites
 * @property {number} rewritten - Loose references to rewrite
 */

export interface MigrationScope {
  followed: number
  rewritten: number
}

/**
 * Check an identifier change is allowed
 * @param {DbClient} client - Client or transaction
 * @param {EntityHandle} handle - Entity
 * @param {string} oldId - Current identifier
 * @param {string} newId - New identifier
 * @return {Promise<void>} - Throws when refused
 */

export const assertMigratable = async (
  client: DbClient,
  handle: EntityHandle,
  oldId: string,
  newId: string
): Promise<void> => {
  if (!(handle.key in MIGRATABLE_ENTITIES)) throw forbidden(DB_COPY.notMigratable)
  assertWritable(handle, true)
  if (oldId === newId) throw conflict(DB_COPY.idSame)
  if (LOWER_ID.test(oldId) !== LOWER_ID.test(newId))
    throw conflict('Format d’identifiant différent')

  const delegate = delegateOf(client, handle.key)
  if (!(await delegate.findUnique({ where: { id: oldId }, select: { id: true } }))) {
    throw notFound(DB_COPY.rowMissing)
  }
  if (await delegate.findUnique({ where: { id: newId }, select: { id: true } })) {
    throw conflict(DB_COPY.idTaken)
  }
}

/**
 * Rewrite an identifier and its loose references
 * @param {DbClient} client - Client or transaction
 * @param {EntityHandle} handle - Entity
 * @param {string} oldId - Current identifier
 * @param {string} newId - New identifier
 * @param {boolean} apply - Write or only count
 * @return {Promise<MigrationScope>} - Rows touched
 */

export const migrateIdentifier = async (
  client: DbClient,
  handle: EntityHandle,
  oldId: string,
  newId: string,
  apply: boolean
): Promise<MigrationScope> => {
  const references = MIGRATABLE_ENTITIES[handle.key] ?? []
  const followed = (await dependentsOf(handle.key, oldId)).reduce((sum, item) => sum + item.rows, 0)

  // Key columns follow through ON UPDATE CASCADE
  if (apply)
    await delegateOf(client, handle.key).update({ where: { id: oldId }, data: { id: newId } })

  // Loose values follow by hand
  let rewritten = 0
  for (const reference of references) {
    const delegate = delegateOf(client, reference.entity)
    const where = { [reference.column]: oldId }
    rewritten += apply
      ? (await delegate.updateMany({ where, data: { [reference.column]: newId } })).count
      : await delegate.count({ where })
  }

  return { followed, rewritten }
}

const migrate: NexusHandler = async (context) => {
  const handle = entityOf(String(context.args.entity))
  const oldId = String(context.args.old)
  const newId = String(context.args.new)
  const client = context.tx ?? prisma

  await assertMigratable(client, handle, oldId, newId)
  const scope = await migrateIdentifier(client, handle, oldId, newId, !context.dryRun)
  const before = { id: oldId }
  const after = { id: newId, ...scope }

  return {
    output: { before, after },
    target: `${handle.key}:${newId}`,
    before,
    after: context.dryRun ? after : { id: newId },
    reversible: !context.dryRun,
  }
}

/**
 * Identifier migration of the database module
 * @type {Record<string, NexusHandler>}
 */

export const DB_MIGRATE_HANDLERS: Record<string, NexusHandler> = { 'db.migrateId': migrate }
