import 'server-only'

import { conflict, forbidden, notFound } from '@/core/lib/errors'
import { prisma } from '@/core/lib/db'
import { convertColumnValue } from '@/core/lib/nexus/args'
import type { ColumnInfo } from '@/core/lib/nexus/args'
import { NEXUS_ARG_CONTEXT } from '@/core/lib/nexus/context'
import type { DataField, DataModel } from '@/core/lib/nexus/datamodel'
import { isMaskedColumn } from '@/core/lib/nexus/redact'
import { columnsOfModel, detailsOf } from '@/core/lib/nexus/schema'
import { ENTITY_INVENTORY } from '@/declarations/nexus/inventory'
import type { EntityEntry } from '@/declarations/nexus/inventory'
import { SEEDED_ENTITIES, SERVICE_OWNED } from '@/declarations/nexus/inventory/references'
import { DB_COPY } from '@/declarations/nexus/modulesCopy'
import type { Prisma } from '@prisma/client'

export type Row = Record<string, unknown>

export type DbClient = Prisma.TransactionClient | typeof prisma

/**
 * Prisma delegate as the console uses it
 * @typedef {Object} Delegate
 */

export interface Delegate {
  findMany: (args: Row) => Promise<Row[]>
  findUnique: (args: Row) => Promise<Row | null>
  count: (args?: Row) => Promise<number>
  create: (args: Row) => Promise<Row>
  update: (args: Row) => Promise<Row>
  updateMany: (args: Row) => Promise<{ count: number }>
  delete: (args: Row) => Promise<Row>
}

/**
 * One exposed entity, ready to query
 * @typedef {Object} EntityHandle
 * @property {string} key - camelCase key
 * @property {EntityEntry} entry - Inventory decision
 * @property {DataModel} model - Parsed model
 * @property {DataField[]} columns - Scalar columns
 * @property {string[]} readable - Columns that may be read
 * @property {string[]} masked - Columns never read
 */

export interface EntityHandle {
  key: string
  entry: EntityEntry
  model: DataModel
  columns: DataField[]
  readable: string[]
  masked: string[]
}

// Only exposed entities have a delegate
const DELEGATE_KEYS = new Set(
  Object.entries(ENTITY_INVENTORY)
    .filter(([, entry]) => entry.exposure !== 'excluded')
    .map(([key]) => key)
)

/**
 * Prisma delegate of an exposed entity
 * @param {DbClient} client - Client or transaction
 * @param {string} key - camelCase key
 * @return {Delegate} - Delegate
 */

export const delegateOf = (client: DbClient, key: string): Delegate => {
  if (!DELEGATE_KEYS.has(key)) throw notFound()

  return (client as unknown as Record<string, Delegate>)[key]
}

/**
 * Entity prepared for a command
 * @param {string} key - camelCase key
 * @return {EntityHandle} - Handle, throws when hidden
 */

export const entityOf = (key: string): EntityHandle => {
  const model = detailsOf(key)
  if (!DELEGATE_KEYS.has(key) || !model) throw notFound()

  const entry = ENTITY_INVENTORY[key]
  const columns = columnsOfModel(model)
  const masked = columns
    .filter((column) => isMaskedColumn(column.name, entry.hidden))
    .map((column) => column.name)

  return {
    key,
    entry,
    model,
    columns,
    masked,
    readable: columns.map((column) => column.name).filter((name) => !masked.includes(name)),
  }
}

/**
 * Select object of readable columns
 * @param {EntityHandle} handle - Entity
 * @return {Record<string, true>} - Prisma select
 */

export const selectOf = (handle: EntityHandle): Record<string, true> =>
  Object.fromEntries(handle.readable.map((name) => [name, true as const]))

/**
 * Column description for conversions
 * @param {EntityHandle} handle - Entity
 * @param {string} name - Column name
 * @return {ColumnInfo | null} - Column or null
 */

export const columnInfo = (handle: EntityHandle, name: string): ColumnInfo | null =>
  NEXUS_ARG_CONTEXT.columnsOf(handle.key)?.[name] ?? null

/**
 * Identifier typed as the id column
 * @param {EntityHandle} handle - Entity
 * @param {string} raw - Typed identifier
 * @return {string | number | bigint} - Converted value
 */

export const idValue = (handle: EntityHandle, raw: string): string | number | bigint => {
  const column = columnInfo(handle, 'id')
  if (!column) throw conflict(DB_COPY.noId)

  const converted = convertColumnValue({ ...column, editable: true }, raw)
  if ('error' in converted) throw conflict(converted.error)

  return converted.value as string | number | bigint
}

/**
 * Refuse a change the entity does not allow
 * @param {EntityHandle} handle - Entity
 * @param {boolean} force - Seeded override
 * @return {void} - Throws when refused
 */

export const assertWritable = (handle: EntityHandle, force: boolean): void => {
  if (handle.entry.exposure !== 'full') throw forbidden(DB_COPY.readOnly)
  if (handle.key in SERVICE_OWNED) {
    throw forbidden(`${DB_COPY.serviceOwned} (${SERVICE_OWNED[handle.key]})`)
  }
  if ((SEEDED_ENTITIES as readonly string[]).includes(handle.key) && !force) {
    throw forbidden(DB_COPY.seeded)
  }
  if (!handle.columns.some((column) => column.name === 'id')) throw conflict(DB_COPY.noId)
}

/**
 * Row as the screen and the audit may see it
 * @param {Row} row - Raw row
 * @return {Row} - Bigint as text, dates as ISO
 */

export const plain = (row: Row): Row =>
  JSON.parse(JSON.stringify(row, (_, v) => (typeof v === 'bigint' ? v.toString() : v)))
