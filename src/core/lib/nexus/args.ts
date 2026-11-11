import type { ParsedArgs } from '@/core/lib/nexus/parse'

/**
 * Argument kinds a command may declare
 * @type {readonly string[]}
 */

export const ARG_TYPES = [
  'string',
  'integer',
  'boolean',
  'enum',
  'id',
  'entity',
  'field',
  'pairs',
  'duration',
  'date',
] as const

export type ArgType = (typeof ARG_TYPES)[number]

/**
 * One declared argument
 * @typedef {Object} ArgSpec
 * @property {string} name - Argument name
 * @property {ArgType} type - Value kind
 * @property {boolean} [required] - Must be given
 * @property {number} [min] - Lowest integer, shortest string
 * @property {number} [max] - Highest integer, longest string
 * @property {readonly string[]} [values] - Allowed enum values
 * @property {string} [entity] - Argument naming the entity a field or pairs belong to
 * @property {boolean} [links] - Pairs may also set foreign keys
 * @property {string | number | boolean} [fallback] - Value when absent
 */

export interface ArgSpec {
  name: string
  type: ArgType
  required?: boolean
  min?: number
  max?: number
  values?: readonly string[]
  entity?: string
  links?: boolean
  fallback?: string | number | boolean
}

/**
 * Column of an entity as an argument sees it
 * @typedef {Object} ColumnInfo
 * @property {string} type - Prisma scalar or enum name
 * @property {boolean} editable - A command may set it
 * @property {boolean} [linkable] - A foreign key a creation may set
 * @property {readonly string[]} [enumValues] - Values when an enum
 */

export interface ColumnInfo {
  type: string
  editable: boolean
  linkable?: boolean
  enumValues?: readonly string[]
}

/**
 * What an argument may be checked against
 * @typedef {Object} ArgContext
 * @property {(key: string) => boolean} hasEntity - Entity is exposed
 * @property {(entity: string) => Record<string, ColumnInfo> | null} columnsOf - Columns of an exposed entity
 */

export interface ArgContext {
  hasEntity: (key: string) => boolean
  columnsOf: (entity: string) => Record<string, ColumnInfo> | null
}

export type ArgValue = string | number | boolean | Date | bigint | Record<string, unknown>

export type ArgResult =
  { ok: true; values: Record<string, ArgValue> } | { ok: false; errors: Record<string, string> }

// Identifier shapes
const ID_PATTERN = /^[A-Za-z0-9_-]{1,64}$/

// 1h30m, 45s, 2d
const DURATION_PATTERN = /^(\d+)([smhd])$/

const DURATION_SECONDS: Record<string, number> = { s: 1, m: 60, h: 3600, d: 86400 }

/**
 * Convert a duration text to seconds
 * @param {string} raw - Text such as 15m
 * @return {number | null} - Seconds or null
 */

export const parseDuration = (raw: string): number | null => {
  const match = DURATION_PATTERN.exec(raw)

  return match ? Number(match[1]) * DURATION_SECONDS[match[2]] : null
}

/**
 * Convert a text to the Prisma type of a column
 * @param {ColumnInfo} column - Column description
 * @param {string} raw - Typed value
 * @return {{ value: ArgValue } | { error: string }} - Converted value or reason
 */

export const convertColumnValue = (
  column: ColumnInfo,
  raw: string
): { value: ArgValue } | { error: string } => {
  switch (column.type) {
    case 'Int':
    case 'Float':
      return /^-?\d+(\.\d+)?$/.test(raw) && (column.type === 'Float' || !raw.includes('.'))
        ? { value: Number(raw) }
        : { error: 'nombre attendu' }
    case 'BigInt':
      return /^-?\d+$/.test(raw) ? { value: BigInt(raw) } : { error: 'entier attendu' }
    case 'Boolean':
      return raw === 'true' || raw === 'false'
        ? { value: raw === 'true' }
        : { error: 'true ou false attendu' }
    case 'DateTime': {
      const date = new Date(raw)
      return Number.isNaN(date.getTime()) ? { error: 'date attendue' } : { value: date }
    }
    case 'String':
      return { value: raw }
    case 'Json':
      return { error: 'champ Json non modifiable' }
    default:
      return column.enumValues?.includes(raw)
        ? { value: raw }
        : { error: `valeur parmi ${column.enumValues?.join(', ') ?? 'aucune'}` }
  }
}

/**
 * Check one argument against its spec
 * @param {ArgSpec} spec - Declared argument
 * @param {ParsedArgs[string]} raw - Typed value
 * @param {Record<string, ArgValue>} done - Values already read
 * @param {ArgContext} context - Entity lookups
 * @return {{ value: ArgValue } | { error: string }} - Value or reason
 */

const checkOne = (
  spec: ArgSpec,
  raw: string | string[] | true,
  done: Record<string, ArgValue>,
  context: ArgContext
): { value: ArgValue } | { error: string } => {
  // Only pairs may repeat
  if (Array.isArray(raw) && spec.type !== 'pairs') return { error: 'donné plusieurs fois' }

  if (spec.type === 'boolean') {
    return raw === true || raw === 'true'
      ? { value: true }
      : raw === 'false'
        ? { value: false }
        : { error: 'true ou false attendu' }
  }
  if (spec.type === 'pairs')
    return checkPairs(spec, Array.isArray(raw) ? raw : [String(raw)], done, context)
  if (typeof raw !== 'string') return { error: 'valeur attendue' }

  const length = raw.length
  switch (spec.type) {
    case 'string':
      if (length < (spec.min ?? 1) || length > (spec.max ?? 500))
        return { error: 'longueur hors bornes' }
      return { value: raw }
    case 'integer': {
      const number = Number(raw)
      const inRange =
        Number.isInteger(number) &&
        number >= (spec.min ?? -Infinity) &&
        number <= (spec.max ?? Infinity)
      return /^-?\d+$/.test(raw) && inRange ? { value: number } : { error: 'entier hors bornes' }
    }
    case 'enum':
      return spec.values?.includes(raw)
        ? { value: raw }
        : { error: `valeur parmi ${spec.values?.join(', ')}` }
    case 'id':
      return ID_PATTERN.test(raw) ? { value: raw } : { error: 'identifiant invalide' }
    case 'entity':
      return context.hasEntity(raw) ? { value: raw } : { error: 'entité introuvable' }
    case 'field':
      return checkField(spec, raw, done, context)
    case 'duration': {
      const seconds = parseDuration(raw)
      return seconds === null || seconds < (spec.min ?? 0) || seconds > (spec.max ?? Infinity)
        ? { error: 'durée hors bornes' }
        : { value: seconds }
    }
    default: {
      const date = new Date(raw)
      return Number.isNaN(date.getTime()) ? { error: 'date attendue' } : { value: date }
    }
  }
}

/**
 * Column named by a field argument
 * @param {ArgSpec} spec - Declared argument
 * @param {string} raw - Column name
 * @param {Record<string, ArgValue>} done - Values already read
 * @param {ArgContext} context - Entity lookups
 * @return {{ value: ArgValue } | { error: string }} - Column name or reason
 */

const checkField = (
  spec: ArgSpec,
  raw: string,
  done: Record<string, ArgValue>,
  context: ArgContext
): { value: ArgValue } | { error: string } => {
  const columns = context.columnsOf(String(done[spec.entity ?? 'entity']))
  const column = columns?.[raw]

  return column?.editable ? { value: raw } : { error: 'colonne introuvable ou protégée' }
}

/**
 * Convert every field,value pair of a repeated argument
 * @param {ArgSpec} spec - Declared argument
 * @param {string[]} raws - Typed pairs
 * @param {Record<string, ArgValue>} done - Values already read
 * @param {ArgContext} context - Entity lookups
 * @return {{ value: ArgValue } | { error: string }} - Converted pairs or reason
 */

const checkPairs = (
  spec: ArgSpec,
  raws: string[],
  done: Record<string, ArgValue>,
  context: ArgContext
): { value: ArgValue } | { error: string } => {
  const columns = context.columnsOf(String(done[spec.entity ?? 'entity']))
  const pairs: Record<string, unknown> = {}

  for (const raw of raws) {
    const comma = raw.indexOf(',')
    const name = comma === -1 ? raw : raw.slice(0, comma)
    const column = columns?.[name]

    const settable = column?.editable || (spec.links && column?.linkable)
    if (comma === -1 || !settable) return { error: `colonne ${name} introuvable ou protégée` }
    if (name in pairs) return { error: `colonne ${name} donnée deux fois` }

    const converted = convertColumnValue(column, raw.slice(comma + 1))
    if ('error' in converted) return { error: `${name} : ${converted.error}` }
    pairs[name] = converted.value
  }

  return { value: pairs }
}

/**
 * Validate typed arguments, unknown ones are refused
 * @param {ArgSpec[]} specs - Declared arguments
 * @param {ParsedArgs} args - Typed arguments
 * @param {ArgContext} context - Entity lookups
 * @return {ArgResult} - Values or one error per argument
 */

export const validateArgs = (
  specs: ArgSpec[],
  args: ParsedArgs,
  context: ArgContext
): ArgResult => {
  const errors: Record<string, string> = {}
  const values: Record<string, ArgValue> = {}

  // Names nobody declared
  for (const name of Object.keys(args)) {
    if (!specs.some((spec) => spec.name === name)) errors[name] = 'argument inconnu'
  }

  // Entities first so fields can lean on them
  const ordered = [
    ...specs.filter((spec) => spec.type === 'entity'),
    ...specs.filter((spec) => spec.type !== 'entity'),
  ]

  for (const spec of ordered) {
    const raw = args[spec.name]

    if (raw === undefined) {
      if (spec.fallback !== undefined) values[spec.name] = spec.fallback
      else if (spec.required) errors[spec.name] = 'argument requis'
      continue
    }

    const checked = checkOne(spec, raw, values, context)
    if ('error' in checked) errors[spec.name] = checked.error
    else values[spec.name] = checked.value
  }

  return Object.keys(errors).length > 0 ? { ok: false, errors } : { ok: true, values }
}
