import 'server-only'

import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { Prisma } from '@prisma/client'

import { parseDatamodel } from '@/core/lib/nexus/datamodel'
import type { DataField, DataModel } from '@/core/lib/nexus/datamodel'

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

// Parsed once per process
let details: DataModel[] | null = null

/**
 * Models with keys, uniques and relations
 * @return {DataModel[]} - Parsed schema file
 */

export const readDetails = (): DataModel[] => {
  details ??= parseDatamodel(readFileSync(join(process.cwd(), 'prisma', 'schema.prisma'), 'utf8'))

  return details
}

/**
 * Details of one entity
 * @param {string} key - camelCase key
 * @return {DataModel | undefined} - Parsed model
 */

export const detailsOf = (key: string): DataModel | undefined =>
  readDetails().find((model) => entityKey(model.name) === key)

/**
 * Columns of a model, relations left out
 * @param {DataModel} model - Parsed model
 * @return {DataField[]} - Scalar and enum fields
 */

export const columnsOfModel = (model: DataModel): DataField[] => {
  const names = new Set(readDetails().map((candidate) => candidate.name))

  return model.fields.filter((field) => !names.has(field.type))
}
