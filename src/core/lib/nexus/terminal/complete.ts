import type { CommandProjection } from '@/core/lib/nexus/registry'

/**
 * Registry as the screen receives it
 * @typedef {Object} RegistryView
 * @property {CommandProjection[]} commands - Listing
 * @property {Record<string, string[]>} values - Known values of variable segments
 */

export interface RegistryView {
  commands: CommandProjection[]
  values: Record<string, string[]>
}

/**
 * Result of a completion
 * @typedef {Object} Completion
 * @property {string} text - Text with the common part filled
 * @property {string[]} options - Possible next words
 */

export interface Completion {
  text: string
  options: string[]
}

// Variable segment such as <entity>
const VARIABLE = /^<([a-zA-Z]+)>$/

// Longest shared start
const commonStart = (words: string[]): string =>
  words.reduce((common, word) => {
    let at = 0
    while (at < common.length && common[at] === word[at]) at += 1

    return common.slice(0, at)
  })

// Choices for the path segment under the cursor
const segmentOptions = (view: RegistryView, typed: string[], partial: string): string[] => {
  const found = new Set<string>()

  for (const command of view.commands) {
    if (command.pattern.length <= typed.length) continue
    const fits = typed.every((word, at) => {
      const segment = command.pattern[at]
      const variable = VARIABLE.exec(segment)

      return variable ? (view.values[variable[1]] ?? []).includes(word) : segment === word
    })
    if (!fits) continue

    const next = command.pattern[typed.length]
    const variable = VARIABLE.exec(next)
    const candidates = variable ? (view.values[variable[1]] ?? []) : [next]
    for (const candidate of candidates) if (candidate.startsWith(partial)) found.add(candidate)
  }

  return [...found].sort()
}

// Commands whose path is exactly the typed words
const matchPath = (view: RegistryView, words: string[]): CommandProjection | undefined =>
  view.commands.find(
    (command) =>
      command.pattern.length === words.length &&
      command.pattern.every((segment, at) => {
        const variable = VARIABLE.exec(segment)

        return variable
          ? (view.values[variable[1]] ?? []).includes(words[at])
          : segment === words[at]
      })
  )

/**
 * Complete the text up to the cursor at its end
 * @param {string} input - Typed text
 * @param {RegistryView} view - Known commands and values
 * @return {Completion} - Filled text and choices
 */

export const completeInput = (input: string, view: RegistryView): Completion => {
  if (!input.startsWith('$')) return { text: input, options: [] }

  const [head, ...rest] = input.split(/\s+/)
  const hasArguments = input.includes(' ')

  // Still typing the path
  if (!hasArguments) {
    const words = head.slice(1).split('.')
    const partial = words.pop() ?? ''
    const options = segmentOptions(view, words, partial)
    if (options.length === 0) return { text: input, options: [] }

    const filled = commonStart(options)
    const prefix = `$${words.map((word) => `${word}.`).join('')}`

    // A lone choice with deeper segments invites the next dot
    const isDeeper =
      options.length === 1 &&
      view.commands.some(
        (command) =>
          command.pattern.length > words.length + 1 &&
          (command.pattern[words.length] === filled || VARIABLE.test(command.pattern[words.length]))
      )

    return { text: prefix + filled + (isDeeper ? '.' : ''), options }
  }

  // Argument names, values are never completed for identifiers
  const command = matchPath(view, head.slice(1).split('.'))
  if (!command) return { text: input, options: [] }

  const last = rest.at(-1) ?? ''
  const used = new Set(rest.map((word) => word.split('=')[0]))
  const enumMatch = /^--([a-zA-Z-]+)=(.*)$/.exec(last)

  if (enumMatch) {
    const values = command.options.find((option) => option.name === enumMatch[1])?.values ?? []
    const options = values.filter((value) => value.startsWith(enumMatch[2]))
    if (options.length === 0) return { text: input, options: [] }

    return {
      text: input.slice(0, input.length - enumMatch[2].length) + commonStart(options),
      options,
    }
  }

  const options = command.options
    .map((option) => `--${option.name}`)
    .filter((name) => name.startsWith(last) && !used.has(name))
  if (options.length === 0) return { text: input, options: [] }

  const filled = commonStart(options)
  const only = options.length === 1

  return {
    text: input.slice(0, input.length - last.length) + filled + (only ? '=' : ''),
    options,
  }
}
