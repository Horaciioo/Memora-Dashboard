import 'server-only'

import { Prisma } from '@prisma/client'

/**
 * Column read from the Prisma data model
 * @typedef {Object} NexusField
 * @property {string} name - Column name
 * @property {string} type - Prisma type or related model
 * @property {'scalar' | 'enum' | 'object'} kind - Field kind
 * @property {boolean} isRelation - Points to another model
 */

export interface NexusField {
  name: string
  type: string
  kind: 'scalar' | 'enum' | 'object'
  isRelation: boolean
}

/**
 * Model read from the Prisma data model
 * @typedef {Object} NexusModel
 * @property {string} name - Model name
 * @property {string} key - camelCase key
 * @property {NexusField[]} fields - Columns and relations
 */

export interface NexusModel {
  name: string
  key: string
  fields: NexusField[]
}

/**
 * Lowercase the first letter
 * @param {string} name - Model name
 * @return {string} - camelCase key
 */

export const entityKey = (name: string): string => name.charAt(0).toLowerCase() + name.slice(1)

/**
 * Models of the data schema
 * @return {NexusModel[]} - Every model
 */

export const readModels = (): NexusModel[] =>
  Prisma.dmmf.datamodel.models.map((model) => ({
    name: model.name,
    key: entityKey(model.name),
    fields: model.fields.map((field) => ({
      name: field.name,
      type: field.type,
      kind: field.kind === 'unsupported' ? 'scalar' : field.kind,
      isRelation: field.kind === 'object',
    })),
  }))
