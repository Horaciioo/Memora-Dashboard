import 'server-only'

import { notFound } from '@/core/lib/errors'
import { prisma } from '@/core/lib/db'
import { incomingKeys } from '@/core/lib/nexus/datamodel'
import { entityKey, readDetails } from '@/core/lib/nexus/schema'
import { delegateOf, entityOf, idValue, selectOf } from '@/core/services/nexus/handlers/db/access'
import type { Delegate, Row } from '@/core/services/nexus/handlers/db/access'
import type { NexusHandler } from '@/core/services/nexus/handlers/types'
import { ENTITY_INVENTORY } from '@/declarations/nexus/inventory'
import { DB_COPY } from '@/declarations/nexus/modulesCopy'
import { NEXUS_DB } from '@/declarations/nexus/modulesSettings'

// Models are read from the schema file, never typed
const anyDelegate = (modelName: string): Delegate | null =>
  readDetails().some((model) => model.name === modelName)
    ? (prisma as unknown as Record<string, Delegate>)[entityKey(modelName)]
    : null

/**
 * Rows a deletion would touch
 * @typedef {Object} Dependent
 * @property {string} relation - Model and key column
 * @property {string} action - Cascade, SetNull or Restrict
 * @property {number} rows - Rows concerned
 */

export interface Dependent {
  relation: string
  action: string
  rows: number
}

// Count rows pointing at ids, going down along cascades
const walk = async (
  modelName: string,
  ids: unknown[],
  depth: number,
  found: Dependent[]
): Promise<void> => {
  for (const { model, field } of incomingKeys(readDetails(), modelName)) {
    const delegate = anyDelegate(model.name)
    const relation = field.relation
    if (!delegate || !relation || relation.fields.length !== 1) continue

    const where = { [relation.fields[0]]: { in: ids } }
    const rows = await delegate.count({ where })
    if (rows === 0) continue

    found.push({
      relation: `${model.name}.${relation.fields[0]}`,
      action: relation.onDelete,
      rows,
    })

    // Cascades carry on one level down
    const hasId = model.fields.some((candidate) => candidate.name === 'id')
    if (relation.onDelete === 'Cascade' && depth > 1 && hasId) {
      const children = await delegate.findMany({ where, select: { id: true }, take: 500 })
      await walk(
        model.name,
        children.map((child) => child.id),
        depth - 1,
        found
      )
    }
  }
}

/**
 * Lines a deletion would cascade, null or block
 * @param {string} key - Entity key
 * @param {string | number | bigint} id - Row identifier
 * @return {Promise<Dependent[]>} - Dependents by relation
 */

export const dependentsOf = async (
  key: string,
  id: string | number | bigint
): Promise<Dependent[]> => {
  const found: Dependent[] = []
  await walk(entityOf(key).model.name, [id], NEXUS_DB.dependentDepth, found)

  return found
}

const dependents: NexusHandler = async (context) => {
  const handle = entityOf(context.params.entity)
  const id = idValue(handle, String(context.args.id))

  return { output: await dependentsOf(handle.key, id) }
}

// Command that opens the neighbour
const opener = (modelName: string, column: string, id: string): string => {
  const key = entityKey(modelName)

  return key in ENTITY_INVENTORY && ENTITY_INVENTORY[key].exposure !== 'excluded'
    ? `$db.list.${key} --where=${column},eq,${id}`
    : '(entité non exposée)'
}

const relations: NexusHandler = async (context) => {
  const handle = entityOf(context.params.entity)
  const id = idValue(handle, String(context.args.id))
  const row = await delegateOf(prisma, handle.key).findUnique({
    where: { id },
    select: selectOf(handle),
  })
  if (!row) throw notFound(DB_COPY.rowMissing)

  // Keys this row holds
  const outgoing = Object.fromEntries(
    handle.model.fields.flatMap((field) => {
      const column = field.relation?.fields[0]
      const target = column ? (row as Row)[column] : null
      if (!target) return []

      return [[`${field.name} (${field.type})`, `$db.get.${entityKey(field.type)} --id=${target}`]]
    })
  )

  // Rows holding this one
  const incoming: Record<string, unknown> = {}
  for (const { model, field } of incomingKeys(readDetails(), handle.model.name)) {
    const delegate = anyDelegate(model.name)
    const column = field.relation?.fields[0]
    if (!delegate || !column) continue

    const rows = await delegate.count({ where: { [column]: id } })
    if (rows > 0) {
      incoming[`${model.name}.${column}`] = { rows, ouvrir: opener(model.name, column, String(id)) }
    }
  }

  return { output: { [`${handle.key}:${id}`]: { sortantes: outgoing, entrantes: incoming } } }
}

/**
 * Link reads of the database module
 * @type {Record<string, NexusHandler>}
 */

export const DB_LINK_HANDLERS: Record<string, NexusHandler> = {
  'db.dependents': dependents,
  'db.relations': relations,
}
