import 'server-only'

import * as client from '@prisma/client'

import type { ArgContext, ColumnInfo } from '@/core/lib/nexus/args'
import { isMaskedColumn } from '@/core/lib/nexus/redact'
import { columnsOfModel, detailsOf, readModels } from '@/core/lib/nexus/schema'
import { ENTITY_INVENTORY, GAME_INVENTORY } from '@/declarations/nexus/inventory'

// Columns no command rewrites
const FIXED_COLUMNS = ['id', 'createdAt', 'updatedAt']

/**
 * Values of a Prisma enum
 * @param {string} name - Enum name
 * @return {string[] | undefined} - Values when it is one
 */

const enumValuesOf = (name: string): string[] | undefined => {
  const candidate = (client as Record<string, unknown>)[name]

  return typeof candidate === 'object' && candidate !== null
    ? Object.values(candidate as Record<string, string>)
    : undefined
}

/**
 * Entities a command may name
 * @param {string} key - camelCase key
 * @return {boolean} - Exposed at least for reading
 */

const isExposed = (key: string): boolean =>
  key in ENTITY_INVENTORY && ENTITY_INVENTORY[key].exposure !== 'excluded'

/**
 * Columns of an exposed entity as arguments see them
 * @param {string} key - camelCase key
 * @return {Record<string, ColumnInfo> | null} - Columns or null
 */

const columnsOf = (key: string): Record<string, ColumnInfo> | null => {
  if (!isExposed(key)) return null

  const entry = ENTITY_INVENTORY[key]
  const model = readModels().find((candidate) => candidate.key === key)
  if (!model) return null

  const writable = entry.exposure === 'full'
  const details = detailsOf(key)
  const locked = new Set(
    (details ? columnsOfModel(details) : []).flatMap((field) =>
      field.id || field.updatedAt ? [field.name] : []
    )
  )
  const foreign = new Set(details?.fields.flatMap((field) => field.relation?.fields ?? []) ?? [])

  return Object.fromEntries(
    model.fields
      .filter((field) => !field.isRelation)
      .map((field) => [
        field.name,
        {
          type: field.type,
          editable:
            writable &&
            !FIXED_COLUMNS.includes(field.name) &&
            !locked.has(field.name) &&
            !foreign.has(field.name) &&
            !isMaskedColumn(field.name, entry.hidden),
          linkable:
            writable && foreign.has(field.name) && !isMaskedColumn(field.name, entry.hidden),
          enumValues: field.kind === 'enum' ? enumValuesOf(field.type) : undefined,
        },
      ])
  )
}

/**
 * Lookups the argument checks lean on
 * @type {ArgContext}
 */

export const NEXUS_ARG_CONTEXT: ArgContext = { hasEntity: isExposed, columnsOf }

/**
 * Values the screen may complete in variable segments
 * @type {Record<string, string[]>}
 */

export const NEXUS_VARIABLE_VALUES: Record<string, string[]> = {
  entity: Object.keys(ENTITY_INVENTORY).filter(isExposed),
  game: Object.keys(GAME_INVENTORY),
}
