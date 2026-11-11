import 'server-only'

import { conflict, invalidInput, notFound } from '@/core/lib/errors'
import { prisma } from '@/core/lib/db'
import type { ColumnInfo } from '@/core/lib/nexus/args'
import { buildOrder, buildWhere } from '@/core/lib/nexus/filter'
import { redactRecord } from '@/core/lib/nexus/redact'
import { boundedRead, takeOf } from '@/core/services/nexus/bounds'
import {
  columnInfo,
  delegateOf,
  entityOf,
  idValue,
  plain,
  selectOf,
} from '@/core/services/nexus/handlers/db/access'
import type { EntityHandle, Row } from '@/core/services/nexus/handlers/db/access'
import type { NexusHandler } from '@/core/services/nexus/handlers/types'
import { ENTITY_INVENTORY } from '@/declarations/nexus/inventory'
import { DB_COPY } from '@/declarations/nexus/modulesCopy'
import { NEXUS_DB } from '@/declarations/nexus/modulesSettings'
import { NEXUS_COMMANDS } from '@/declarations/nexus/settings'

// Readable columns with their types
const readableColumns = (handle: EntityHandle): Record<string, ColumnInfo> =>
  Object.fromEntries(
    handle.columns
      .filter((column) => handle.readable.includes(column.name))
      .map((column) => [column.name, columnInfo(handle, column.name) as ColumnInfo])
  )

// Table name to estimated rows
const estimatedRows = async (): Promise<Map<string, number>> => {
  const rows = await prisma.$queryRaw<{ relname: string; rows: bigint }[]>`
    SELECT relname, reltuples::bigint AS rows FROM pg_class
    WHERE relkind = 'r' AND relnamespace = 'public'::regnamespace`

  return new Map(rows.map((row) => [row.relname, Math.max(0, Number(row.rows))]))
}

const entities: NexusHandler = async () => {
  const estimates = await estimatedRows()

  return {
    output: Object.entries(ENTITY_INVENTORY)
      .filter(([, entry]) => entry.exposure !== 'excluded')
      .map(([key, entry]) => {
        const table = entityOf(key).model.table

        return { entity: key, exposure: entry.exposure, rows: estimates.get(table) ?? 0 }
      }),
  }
}

const list: NexusHandler = async (context) => {
  const handle = entityOf(context.params.entity)
  const take = takeOf(context.args.take, NEXUS_COMMANDS.maxRows)
  const columns = readableColumns(handle)

  // Filter and order
  const filter = context.args.where ? buildWhere(String(context.args.where), columns) : null
  if (filter && 'error' in filter) throw invalidInput([{ field: 'where', message: filter.error }])
  const order = context.args.order ? buildOrder(String(context.args.order), handle.readable) : null
  if (context.args.order && !order) {
    throw invalidInput([{ field: 'order', message: DB_COPY.badColumn }])
  }

  // Page with a cursor on the identifier
  const cursor = context.args.cursor ? idValue(handle, String(context.args.cursor)) : null
  const rows = await boundedRead((tx) =>
    delegateOf(tx, handle.key).findMany({
      where: filter?.where,
      select: selectOf(handle),
      orderBy: [...(order ? [order] : []), { id: 'asc' }],
      take: take + 1,
      ...(cursor === null ? {} : { cursor: { id: cursor }, skip: 1 }),
    })
  )

  const page = rows.slice(0, take)
  const nextCursor = rows.length > take ? String(page[page.length - 1].id) : null

  return {
    output: page.map((row) => redactRecord(plain(row))),
    data: { nextCursor, next: nextCursor && `$db.list.${handle.key} --cursor=${nextCursor}` },
  }
}

const get: NexusHandler = async (context) => {
  const handle = entityOf(context.params.entity)
  const row = await boundedRead((tx) =>
    delegateOf(tx, handle.key).findUnique({
      where: { id: idValue(handle, String(context.args.id)) },
      select: selectOf(handle),
    })
  )
  if (!row) throw notFound(DB_COPY.rowMissing)

  return {
    output: redactRecord(plain(row), handle.entry.hidden),
    data: { masked: handle.masked },
    target: `${handle.key}:${context.args.id}`,
  }
}

const search: NexusHandler = async (context) => {
  const handle = entityOf(context.params.entity)
  const query = String(context.args.query)
  if (query.length < NEXUS_DB.searchMinLength) throw conflict(DB_COPY.searchShort)
  if (handle.entry.search.length === 0) throw conflict(DB_COPY.searchNone)

  const rows = await boundedRead((tx) =>
    delegateOf(tx, handle.key).findMany({
      where: {
        OR: handle.entry.search.map((column) => ({
          [column]: { contains: query, mode: 'insensitive' },
        })),
      },
      select: selectOf(handle),
      orderBy: { id: 'asc' },
      take: takeOf(context.args.take, NEXUS_COMMANDS.maxRows),
    })
  )

  return { output: rows.map((row: Row) => redactRecord(plain(row))) }
}

/**
 * Reads of the database module
 * @type {Record<string, NexusHandler>}
 */

export const DB_READ_HANDLERS: Record<string, NexusHandler> = {
  'db.entities': entities,
  'db.list': list,
  'db.get': get,
  'db.search': search,
}
