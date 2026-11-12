import 'server-only'

import { primaryOf } from '@/core/lib/nexus/datamodel'
import { readDetails } from '@/core/lib/nexus/schema'
import { entityOf } from '@/core/services/nexus/handlers/db/access'
import type { NexusHandler } from '@/core/services/nexus/handlers/types'

const schema: NexusHandler = async (context) => {
  const handle = entityOf(context.params.entity)
  const models = new Set(readDetails().map((model) => model.name))

  return {
    output: handle.model.fields.map((field) => ({
      field: field.name,
      type: `${field.type}${field.list ? '[]' : ''}`,
      nullable: field.optional,
      key: field.id ? 'id' : field.unique ? 'unique' : '',
      relation: models.has(field.type)
        ? `${field.type}${field.relation ? ` (${field.relation.onDelete})` : ''}`
        : '',
      updatedAt: field.updatedAt,
      hasDefault: field.hasDefault,
      masked: handle.masked.includes(field.name),
    })),
    data: { table: handle.model.table },
  }
}

const constraints: NexusHandler = async (context) => {
  const handle = entityOf(context.params.entity)
  const { model } = handle

  return {
    output: [
      { kind: 'primary', columns: primaryOf(model).join(', ') },
      ...model.fields
        .filter((field) => field.unique)
        .map((field) => ({ kind: 'unique', columns: field.name })),
      ...model.uniques.map((columns) => ({ kind: 'unique', columns: columns.join(', ') })),
      ...model.fields
        .filter((field) => field.relation)
        .map((field) => ({
          kind: 'foreign key',
          columns: field.relation?.fields.join(', '),
          target: `${field.type}.${field.relation?.references.join(', ')}`,
          onDelete: field.relation?.onDelete,
        })),
      ...model.indexes.map((columns) => ({ kind: 'index', columns: columns.join(', ') })),
    ],
  }
}

/**
 * Structure reads of the database module
 * @type {Record<string, NexusHandler>}
 */

export const DB_STRUCTURE_HANDLERS: Record<string, NexusHandler> = {
  'db.schema': schema,
  'db.constraints': constraints,
}
