import type { RegistryView } from '@/core/lib/nexus/terminal/complete'
import { NEXUS_TERMINAL_COPY } from '@/declarations/nexus/terminal'
import type { NexusReply } from '@/types/nexus'

/**
 * Commands answered by the screen itself
 * @type {readonly string[]}
 */

export const LOCAL_COMMANDS = ['help', 'clear', 'history'] as const

export type LocalCommand = (typeof LOCAL_COMMANDS)[number]

// Reply built on the screen
const reply = (form: NexusReply['output']['form'], value: unknown): NexusReply => ({
  status: 'ok',
  level: 'info',
  output: { form, value },
  data: null,
  durationMs: 0,
  requestId: 'local',
})

/**
 * Local command named by a text
 * @param {string} input - Typed text
 * @return {{ name: LocalCommand, rest: string } | null} - Command or null
 */

export const readLocal = (input: string): { name: LocalCommand; rest: string } | null => {
  const [head, ...rest] = input.trim().split(/\s+/)
  const name = head.slice(1)

  return head.startsWith('$') && (LOCAL_COMMANDS as readonly string[]).includes(name)
    ? { name: name as LocalCommand, rest: rest.join(' ') }
    : null
}

/**
 * Answer of $help
 * @param {RegistryView} view - Known commands
 * @param {string} name - Command asked about, empty for all
 * @return {NexusReply} - Reply
 */

export const helpReply = (view: RegistryView, name: string): NexusReply => {
  const wanted = name.replace(/^\$/, '')
  const found = wanted
    ? view.commands.filter(
        (command) => command.id === wanted || command.id.startsWith(`${wanted}.`)
      )
    : view.commands

  if (found.length === 0) return reply('text', NEXUS_TERMINAL_COPY.helpEmpty)

  // One command in full, many as a list
  if (wanted && found.length === 1) {
    const [command] = found

    return reply('record', {
      syntaxe: command.syntax,
      description: command.description,
      niveau: command.level,
      famille: command.category,
      arguments: command.options
        .map((option) => `--${option.name}${option.required ? '*' : ''}`)
        .join(' '),
    })
  }

  return reply(
    'table',
    found.map((command) => ({
      commande: command.syntax,
      niveau: command.level,
      description: command.description,
    }))
  )
}

/**
 * Answer of $history
 * @param {string[]} entries - Typed commands
 * @return {NexusReply} - Reply
 */

export const historyReply = (entries: string[]): NexusReply =>
  entries.length === 0
    ? reply('text', NEXUS_TERMINAL_COPY.historyEmpty)
    : reply('table', entries.map((input, index) => ({ n: index + 1, commande: input })).reverse())
