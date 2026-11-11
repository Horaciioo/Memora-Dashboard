/**
 * Relation held by a foreign key
 * @typedef {Object} DataRelation
 * @property {string[]} fields - Local key columns
 * @property {string[]} references - Target columns
 * @property {string} onDelete - Action on delete
 */

export interface DataRelation {
  fields: string[]
  references: string[]
  onDelete: 'Cascade' | 'SetNull' | 'Restrict' | 'NoAction' | 'SetDefault'
}

/**
 * Column or relation of a model
 * @typedef {Object} DataField
 * @property {string} name - Field name
 * @property {string} type - Scalar, enum or model
 * @property {boolean} list - Array field
 * @property {boolean} optional - Nullable
 * @property {boolean} id - Primary key
 * @property {boolean} unique - Single column unique
 * @property {boolean} updatedAt - Maintained by Prisma
 * @property {boolean} hasDefault - Has a default value
 * @property {DataRelation} [relation] - Set on the side holding the key
 */

export interface DataField {
  name: string
  type: string
  list: boolean
  optional: boolean
  id: boolean
  unique: boolean
  updatedAt: boolean
  hasDefault: boolean
  relation?: DataRelation
}

/**
 * Model of the schema file
 * @typedef {Object} DataModel
 * @property {string} name - Model name
 * @property {string} table - Table name
 * @property {DataField[]} fields - Fields in order
 * @property {string[][]} uniques - Composite unique sets
 * @property {string[][]} indexes - Index column sets
 * @property {string[]} primary - Composite primary key
 */

export interface DataModel {
  name: string
  table: string
  fields: DataField[]
  uniques: string[][]
  indexes: string[][]
  primary: string[]
}

// Names inside brackets
const names = (text: string): string[] =>
  text
    .split(',')
    .map((part) => part.trim().replace(/\(.*$/, ''))
    .filter(Boolean)

// Bracket list of a named argument
const listOf = (source: string, key: string): string[] => {
  const match = new RegExp(`${key}:\\s*\\[([^\\]]*)\\]`).exec(source)

  return match ? names(match[1]) : []
}

const DELETE_ACTIONS = ['Cascade', 'SetNull', 'Restrict', 'NoAction', 'SetDefault'] as const

// Relation attribute to its parts
const readRelation = (attributes: string, optional: boolean): DataRelation | undefined => {
  const match = /@relation\(([^)]*)\)/.exec(attributes)
  if (!match) return undefined

  const fields = listOf(match[1], 'fields')
  if (fields.length === 0) return undefined

  const action = /onDelete:\s*(\w+)/.exec(match[1])?.[1]
  const declared = DELETE_ACTIONS.find((name) => name === action)

  return {
    fields,
    references: listOf(match[1], 'references'),
    onDelete: declared ?? (optional ? 'SetNull' : 'Restrict'),
  }
}

// One field line
const readField = (line: string): DataField | null => {
  const match = /^(\w+)\s+(\w+)(\[\])?(\?)?\s*(.*)$/.exec(line)
  if (!match) return null

  const [, name, type, list, optional, attributes] = match

  return {
    name,
    type,
    list: Boolean(list),
    optional: Boolean(optional),
    id: /@id\b/.test(attributes),
    unique: /@unique\b/.test(attributes),
    updatedAt: /@updatedAt\b/.test(attributes),
    hasDefault: /@default\(/.test(attributes),
    relation: readRelation(attributes, Boolean(optional)),
  }
}

// Block attribute such as @@index([a, b])
const readBlock = (line: string, kind: string): string[] | null => {
  const match = new RegExp(`^@@${kind}\\(\\[([^\\]]*)\\]`).exec(line)

  return match ? names(match[1]) : null
}

// Lines of one model body
const readModel = (name: string, body: string[]): DataModel => {
  const model: DataModel = { name, table: name, fields: [], uniques: [], indexes: [], primary: [] }

  for (const raw of body) {
    const line = raw.replace(/\/\/.*$/, '').trim()
    if (!line) continue

    if (line.startsWith('@@')) {
      const table = /^@@map\("([^"]+)"\)/.exec(line)
      if (table) model.table = table[1]
      const unique = readBlock(line, 'unique')
      if (unique) model.uniques.push(unique)
      const index = readBlock(line, 'index')
      if (index) model.indexes.push(index)
      const primary = readBlock(line, 'id')
      if (primary) model.primary = primary
      continue
    }

    const field = readField(line)
    if (field) model.fields.push(field)
  }

  return model
}

/**
 * Read the models of a schema text
 * @param {string} text - Schema file content
 * @return {DataModel[]} - Models in file order
 */

export const parseDatamodel = (text: string): DataModel[] => {
  const models: DataModel[] = []
  const pattern = /^model\s+(\w+)\s*\{([\s\S]*?)^\}/gm

  for (const match of text.matchAll(pattern)) models.push(readModel(match[1], match[2].split('\n')))

  return models
}

/**
 * Primary key columns of a model
 * @param {DataModel} model - Parsed model
 * @return {string[]} - Key columns
 */

export const primaryOf = (model: DataModel): string[] =>
  model.primary.length > 0 ? model.primary : model.fields.filter((f) => f.id).map((f) => f.name)

/**
 * Foreign keys other models hold towards one model
 * @param {DataModel[]} models - Every model
 * @param {string} target - Model name
 * @return {{ model: DataModel, field: DataField }[]} - Incoming keys
 */

export const incomingKeys = (
  models: DataModel[],
  target: string
): { model: DataModel; field: DataField }[] =>
  models.flatMap((model) =>
    model.fields
      .filter((field) => field.relation && field.type === target)
      .map((field) => ({ model, field }))
  )
