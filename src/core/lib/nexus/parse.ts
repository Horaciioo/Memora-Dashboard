/**
 * Argument values as typed
 * @type {Record<string, string | string[] | true>}
 */

export type ParsedArgs = Record<string, string | string[] | true>

/**
 * Command split into its path and arguments
 * @typedef {Object} ParsedCommand
 * @property {string[]} path - Dotted segments
 * @property {ParsedArgs} args - Arguments by name
 */

export interface ParsedCommand {
  path: string[]
  args: ParsedArgs
}

/**
 * Syntax error with its place
 * @typedef {Object} ParseFailure
 * @property {string} message - What is wrong
 * @property {number} column - Zero based position
 */

export interface ParseFailure {
  message: string
  column: number
}

export type ParseResult = { ok: true; value: ParsedCommand } | { ok: false; error: ParseFailure }

/**
 * Bounds of a command text
 * @typedef {Object} ParseLimits
 * @property {number} maxLength - Longest text
 * @property {number} maxArguments - Most arguments
 */

export interface ParseLimits {
  maxLength: number
  maxArguments: number
}

// Argument name
const NAME_PATTERN = /^[a-z][a-zA-Z0-9-]*$/

// Path segment, a trailing name may start in capitals
const SEGMENT_PATTERN = /^[a-zA-Z][a-zA-Z0-9-]*$/

// Control characters, line breaks included
const CONTROL_PATTERN = /[\u0000-\u001f\u007f]/

const fail = (message: string, column: number): ParseResult => ({
  ok: false,
  error: { message, column },
})

/**
 * Read one double quoted value
 * @param {string} text - Whole command
 * @param {number} start - Index of the opening quote
 * @return {{ value: string, end: number } | null} - Value and index after the closing quote
 */

const readQuoted = (text: string, start: number): { value: string; end: number } | null => {
  let value = ''

  for (let index = start + 1; index < text.length; index++) {
    const char = text[index]

    if (char === '\\' && (text[index + 1] === '"' || text[index + 1] === '\\')) {
      value += text[++index]
    } else if (char === '"') {
      return { value, end: index + 1 }
    } else {
      value += char
    }
  }

  return null
}

/**
 * Store a value, a repeated name becomes a list
 * @param {ParsedArgs} args - Arguments so far
 * @param {string} name - Argument name
 * @param {string | true} value - Argument value
 * @return {void}
 */

const store = (args: ParsedArgs, name: string, value: string | true): void => {
  const known = args[name]
  if (known === undefined) args[name] = value
  else args[name] = [...(Array.isArray(known) ? known : [String(known)]), String(value)]
}

/**
 * Read the arguments after the path
 * @param {string} text - Whole command
 * @param {number} from - Index after the path
 * @param {number} maxArguments - Most arguments
 * @return {ParseResult} - Arguments or failure
 */

const readArguments = (text: string, from: number, maxArguments: number): ParseResult => {
  const args: ParsedArgs = {}
  let index = from
  let count = 0

  while (index < text.length) {
    if (text[index] === ' ') {
      index++
      continue
    }

    if (!text.startsWith('--', index)) return fail('Argument attendu après un espace', index)
    if (++count > maxArguments) return fail('Trop d’arguments', index)

    // Name up to = or a space
    const nameStart = index + 2
    let nameEnd = nameStart
    while (nameEnd < text.length && text[nameEnd] !== '=' && text[nameEnd] !== ' ') nameEnd++

    const name = text.slice(nameStart, nameEnd)
    if (!NAME_PATTERN.test(name)) return fail('Nom d’argument invalide', nameStart)

    // A bare name is a flag
    if (text[nameEnd] !== '=') {
      store(args, name, true)
      index = nameEnd
      continue
    }

    const valueStart = nameEnd + 1
    if (text[valueStart] === '"') {
      const quoted = readQuoted(text, valueStart)
      if (!quoted) return fail('Guillemet non fermé', valueStart)
      store(args, name, quoted.value)
      index = quoted.end
    } else {
      let valueEnd = valueStart
      while (valueEnd < text.length && text[valueEnd] !== ' ') valueEnd++
      store(args, name, text.slice(valueStart, valueEnd))
      index = valueEnd
    }

    // A quote must end on a space
    if (index < text.length && text[index] !== ' ') return fail('Espace attendu', index)
  }

  return { ok: true, value: { path: [], args } }
}

/**
 * Split a typed command, nothing is ever evaluated
 * @param {string} input - Typed text
 * @param {ParseLimits} limits - Text bounds
 * @return {ParseResult} - Command or positioned failure
 */

export const parseCommand = (input: string, limits: ParseLimits): ParseResult => {
  const text = input.normalize('NFC').trim()

  if (text.length > limits.maxLength) return fail('Commande trop longue', limits.maxLength)
  if (CONTROL_PATTERN.test(text)) return fail('Caractère interdit', text.search(CONTROL_PATTERN))
  if (!text.startsWith('$')) return fail('Une commande commence par $', 0)

  // Path ends at the first space
  const spaceAt = text.indexOf(' ')
  const pathEnd = spaceAt === -1 ? text.length : spaceAt
  const path = text.slice(1, pathEnd).split('.')

  const bad = path.findIndex((segment) => !SEGMENT_PATTERN.test(segment))
  if (bad !== -1) return fail('Segment invalide', text.indexOf(path[bad]))

  const parsed = readArguments(text, pathEnd, limits.maxArguments)
  if (!parsed.ok) return parsed

  return { ok: true, value: { path, args: parsed.value.args } }
}
