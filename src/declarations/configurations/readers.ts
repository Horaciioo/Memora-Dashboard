interface NumberContext {
  path: string
  fallback: number
  min?: number
  max?: number
}

interface StringContext {
  path: string
  fallback: string
}

interface BooleanContext {
  path: string
  fallback: boolean
}

export interface Bounds {
  min: number
  max: number
}

interface BoundsContext {
  path: string
  fallback: Bounds
}

interface StringListContext {
  path: string
  fallback: string[]
  allowed?: readonly string[]
}

interface ChoiceContext<TValue extends string> {
  path: string
  fallback: TValue
  allowed: readonly TValue[]
}

/**
 * Reject invalid value
 * @param {string} path - Path
 * @param {string} reason - Reason
 * @param {unknown} value - Value
 * @param {T} fallback - Fallback
 * @return {T}
 */

const reject = <T>(path: string, reason: string, value: unknown, fallback: T): T => {
  console.warn(
    `[config] ${path} ${reason} (got ${JSON.stringify(value)}), falling back to ${JSON.stringify(fallback)}`
  )
  return fallback
}

/**
 * Read number
 * @param {unknown} value - Value
 * @param {NumberContext} context - Context
 * @return {number}
 */

export const readNumber = (value: unknown, context: NumberContext): number => {
  const { path, fallback, min, max } = context
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return reject(path, 'is not a number', value, fallback)
  }
  if (typeof min === 'number' && value < min) {
    return reject(path, `is under the minimum of ${min}`, value, fallback)
  }
  if (typeof max === 'number' && value > max) {
    return reject(path, `is over the maximum of ${max}`, value, fallback)
  }
  return value
}

/**
 * Read integer
 * @param {unknown} value - Value
 * @param {NumberContext} context - Context
 * @return {number}
 */

export const readInteger = (value: unknown, context: NumberContext): number => {
  if (typeof value === 'number' && !Number.isInteger(value)) {
    return reject(context.path, 'is not an integer', value, context.fallback)
  }
  return readNumber(value, context)
}

/**
 * Read string
 * @param {unknown} value - Value
 * @param {StringContext} context - Context
 * @return {string}
 */

export const readString = (value: unknown, context: StringContext): string => {
  if (typeof value !== 'string' || value.length === 0) {
    return reject(context.path, 'is not a non-empty string', value, context.fallback)
  }
  return value
}

/**
 * Read boolean
 * @param {unknown} value - Value
 * @param {BooleanContext} context - Context
 * @return {boolean}
 */

export const readBoolean = (value: unknown, context: BooleanContext): boolean => {
  if (typeof value !== 'boolean') {
    return reject(context.path, 'is not a boolean', value, context.fallback)
  }
  return value
}

/**
 * Read bounds pair
 * @param {unknown} value - Value
 * @param {BoundsContext} context - Context
 * @return {Bounds}
 */

export const readBounds = (value: unknown, context: BoundsContext): Bounds => {
  if (typeof value !== 'object' || value === null) {
    return reject(context.path, 'is not an object', value, context.fallback)
  }
  const candidate = value as Record<string, unknown>
  const min = readNumber(candidate.min, {
    path: `${context.path}.min`,
    fallback: context.fallback.min,
  })
  const max = readNumber(candidate.max, {
    path: `${context.path}.max`,
    fallback: context.fallback.max,
  })
  if (min > max) {
    return reject(context.path, 'has a minimum greater than its maximum', value, context.fallback)
  }
  return { min, max }
}

/**
 * Read optional bounds
 * @param {unknown} value - Value
 * @param {string} path - Path
 * @return {Bounds | undefined}
 */

export const readOptionalBounds = (value: unknown, path: string): Bounds | undefined => {
  if (value === undefined || value === null) return undefined
  if (typeof value !== 'object') {
    console.warn(`[config] ${path} is not an object (got ${JSON.stringify(value)}), ignoring`)
    return undefined
  }
  const candidate = value as Record<string, unknown>
  if (typeof candidate.min !== 'number' || typeof candidate.max !== 'number') {
    console.warn(`[config] ${path} is missing min/max, ignoring`)
    return undefined
  }
  return { min: candidate.min, max: candidate.max }
}

/**
 * Read configuration node
 * @param {unknown} value - Value
 * @param {string} path - Path
 * @return {Record<string, unknown>}
 */

export const readNode = (value: unknown, path: string): Record<string, unknown> => {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return reject(path, 'is not a configuration node', value, {})
  }
  return value as Record<string, unknown>
}

/**
 * Read string list
 * @param {unknown} value - Value
 * @param {StringListContext} context - Context
 * @return {string[]}
 */

export const readStringList = (value: unknown, context: StringListContext): string[] => {
  if (!Array.isArray(value)) {
    return reject(context.path, 'is not an array', value, context.fallback)
  }
  const invalid = value.filter((entry) => typeof entry !== 'string')
  if (invalid.length > 0) {
    return reject(context.path, 'holds non-string entries', value, context.fallback)
  }
  if (context.allowed) {
    const allowed = context.allowed
    const unknownEntries = (value as string[]).filter((entry) => !allowed.includes(entry))
    if (unknownEntries.length > 0) {
      return reject(
        context.path,
        `holds unknown entries (${unknownEntries.join(', ')})`,
        value,
        context.fallback
      )
    }
  }
  return value as string[]
}

/**
 * Read allowed value
 * @param {unknown} value - Value
 * @param {ChoiceContext<TValue>} context - Context
 * @return {TValue}
 */

export const readChoice = <TValue extends string>(
  value: unknown,
  context: ChoiceContext<TValue>
): TValue => {
  if (typeof value !== 'string' || !context.allowed.includes(value as TValue)) {
    return reject(
      context.path,
      `is not one of ${context.allowed.join(', ')}`,
      value,
      context.fallback
    )
  }
  return value as TValue
}

/**
 * Read nullable string
 * @param {unknown} value - Value
 * @param {string} path - Path
 * @return {string | null}
 */

export const readOptionalString = (value: unknown, path: string): string | null => {
  if (value === null || value === undefined) return null
  if (typeof value !== 'string' || value.length === 0) {
    return reject(path, 'is not a non-empty string or null', value, null)
  }
  return value
}
