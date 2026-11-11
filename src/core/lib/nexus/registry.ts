import type { NexusCommand } from '@/declarations/nexus/commands/types'

/**
 * Command matched against a typed path
 * @typedef {Object} ResolvedCommand
 * @property {NexusCommand} command - Declared command
 * @property {Record<string, string>} params - Variable segments by name
 */

export interface ResolvedCommand {
  command: NexusCommand
  params: Record<string, string>
}

/**
 * What the owner's screen may know of a command
 * @typedef {Object} CommandProjection
 * @property {string} id - Name
 * @property {string} syntax - Usage
 * @property {string} description - One line
 * @property {string} category - Family
 * @property {string} level - Mode it needs
 * @property {string[]} args - Argument names
 */

export interface CommandProjection {
  id: string
  syntax: string
  description: string
  category: string
  level: string
  args: string[]
}

/**
 * Checks a variable segment against the inventory
 * @type {Record<string, (value: string) => boolean>}
 */

export type VariableCheckers = Record<string, (value: string) => boolean>

/**
 * Loaded set of commands
 * @typedef {Object} CommandRegistry
 * @property {NexusCommand[]} commands - Every command
 * @property {(path: string[]) => ResolvedCommand | null} resolve - Find by typed path
 * @property {() => CommandProjection[]} project - Client safe listing
 */

export interface CommandRegistry {
  commands: NexusCommand[]
  resolve: (path: string[]) => ResolvedCommand | null
  project: () => CommandProjection[]
}

// Variable segment such as <entity>
const VARIABLE = /^<([a-zA-Z]+)>$/

// Two segments that could match the same text
const overlaps = (left: string, right: string): boolean =>
  left === right || VARIABLE.test(left) || VARIABLE.test(right)

/**
 * Refuse a declaration that breaks the rules
 * @param {NexusCommand[]} commands - Declared commands
 * @param {string[]} handlers - Keys of the available handlers
 * @return {void} - Throws on the first problem
 */

const assertValid = (commands: NexusCommand[], handlers: string[]): void => {
  commands.forEach((command, index) => {
    if (!handlers.includes(command.handler)) throw new Error(`${command.id}: no handler`)

    // A change always leaves a full trace and asks twice
    const changes = command.level === 'write' || command.level === 'dangerous'
    if (changes && (command.audit !== 'full' || command.confirm === 'none')) {
      throw new Error(`${command.id}: a change needs a full audit and a confirmation`)
    }

    for (const other of commands.slice(index + 1)) {
      const sameShape =
        other.pattern.length === command.pattern.length &&
        other.pattern.every((segment, at) => overlaps(segment, command.pattern[at]))
      if (other.id === command.id || sameShape)
        throw new Error(`${command.id}: clashes with ${other.id}`)
    }
  })
}

/**
 * Load commands, a broken declaration stops the loading
 * @param {NexusCommand[]} commands - Declared commands
 * @param {string[]} handlers - Keys of the available handlers
 * @param {VariableCheckers} checkers - Variable segment checks
 * @return {CommandRegistry} - Registry
 */

export const buildCommandRegistry = (
  commands: NexusCommand[],
  handlers: string[],
  checkers: VariableCheckers
): CommandRegistry => {
  assertValid(commands, handlers)

  const resolve = (path: string[]): ResolvedCommand | null => {
    for (const command of commands) {
      if (command.pattern.length !== path.length) continue

      const params: Record<string, string> = {}
      const matches = command.pattern.every((segment, index) => {
        const variable = VARIABLE.exec(segment)
        if (!variable) return segment === path[index]
        if (!checkers[variable[1]]?.(path[index])) return false
        params[variable[1]] = path[index]

        return true
      })

      if (matches) return { command, params }
    }

    return null
  }

  const project = (): CommandProjection[] =>
    commands.map((command) => ({
      id: command.id,
      syntax: command.syntax,
      description: command.description,
      category: command.category,
      level: command.level,
      args: command.args.map((arg) => arg.name),
    }))

  return { commands, resolve, project }
}
