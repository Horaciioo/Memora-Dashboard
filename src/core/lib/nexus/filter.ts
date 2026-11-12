import { convertColumnValue } from '@/core/lib/nexus/args'
import type { ColumnInfo } from '@/core/lib/nexus/args'

/**
 * Operators a filter may use
 * @type {readonly string[]}
 */

export const FILTER_OPERATORS = ['eq', 'ne', 'lt', 'gt', 'in', 'contains', 'null'] as const

type Operator = (typeof FILTER_OPERATORS)[number]

type Built = { where: Record<string, unknown> } | { error: string }

// Typed value of one column
const convert = (column: ColumnInfo, raw: string): { value: unknown } | { error: string } =>
  convertColumnValue({ ...column, editable: true }, raw)

// Prisma condition of an operator
const condition = (operator: Operator, column: ColumnInfo, raw: string) => {
  if (operator === 'null') {
    return raw === 'true' || raw === 'false'
      ? { value: raw === 'true' ? null : { not: null } }
      : { error: 'true ou false attendu' }
  }
  if (operator === 'contains') {
    return column.type === 'String'
      ? { value: { contains: raw, mode: 'insensitive' } }
      : { error: 'texte attendu' }
  }
  if (operator === 'in') {
    const parts = raw.split('|').map((part) => convert(column, part))
    const failed = parts.find((part) => 'error' in part)

    return failed && 'error' in failed
      ? { error: failed.error }
      : { value: { in: parts.map((part) => ('value' in part ? part.value : null)) } }
  }

  const converted = convert(column, raw)
  if ('error' in converted) return converted
  if (operator === 'eq') return { value: converted.value }

  return { value: { [operator === 'ne' ? 'not' : operator]: converted.value } }
}

/**
 * Turn champ,op,valeur into a Prisma condition
 * @param {string} raw - Typed filter
 * @param {Record<string, ColumnInfo>} columns - Readable columns
 * @return {Built} - Where clause or reason
 */

export const buildWhere = (raw: string, columns: Record<string, ColumnInfo>): Built => {
  const first = raw.indexOf(',')
  const second = raw.indexOf(',', first + 1)
  if (first === -1 || second === -1) return { error: 'filtre incomplet' }

  const name = raw.slice(0, first)
  const operator = raw.slice(first + 1, second) as Operator
  const column = columns[name]

  if (!column || column.type === 'Json') return { error: 'colonne introuvable ou protégée' }
  if (!FILTER_OPERATORS.includes(operator)) return { error: 'opérateur inconnu' }

  const built = condition(operator, column, raw.slice(second + 1))

  return 'error' in built ? built : { where: { [name]: built.value } }
}

/**
 * Turn champ or champ:desc into an orderBy
 * @param {string} raw - Typed order
 * @param {string[]} readable - Readable columns
 * @return {Record<string, 'asc' | 'desc'> | null} - Order or null
 */

export const buildOrder = (
  raw: string,
  readable: string[]
): Record<string, 'asc' | 'desc'> | null => {
  const [name, direction = 'asc'] = raw.split(':')
  if (!readable.includes(name) || !['asc', 'desc'].includes(direction)) return null

  return { [name]: direction as 'asc' | 'desc' }
}
