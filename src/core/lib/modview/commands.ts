import type { SanctionMeasureView, SanctionRungView } from '@/types/sanctions'
import type { Chatter, ModViewIntent } from '@/types/modview'
import { SanctionKinds } from '@/utils/constants/moderation'

// Seconds per duration unit, the way Twitch writes them
const UNITS: Record<string, number> = { s: 1, m: 60, h: 3600, d: 86_400, w: 604_800 }

// Largest unit first, so 3600 reads 1h
const UNITS_DESC = Object.entries(UNITS).sort(([, a], [, b]) => b - a)

/**
 * Read a Twitch duration, plain seconds or with a unit
 * @param {string} raw - Duration as typed
 * @return {number | null} - Seconds, none when unreadable
 */

export const parseDuration = (raw: string): number | null => {
  const match = /^(\d+)([smhdw]?)$/i.exec(raw.trim())
  if (!match) return null

  const amount = Number(match[1])
  const unit = UNITS[(match[2] || 's').toLowerCase()] ?? 1
  const seconds = amount * unit

  return seconds > 0 ? seconds : null
}

/**
 * Write seconds the short way Twitch reads them
 * @param {number} seconds - Duration
 * @return {string} - Duration, 10m or 1h or 45s
 */

export const formatDuration = (seconds: number): string => {
  const fit = UNITS_DESC.find(([, size]) => seconds % size === 0)
  if (!fit) return `${seconds}s`

  return `${seconds / fit[1]}${fit[0]}`
}

/**
 * What the chat input turned out to be
 * @typedef {Object} ChatCommandResult
 */

export type ChatCommandResult =
  | { kind: 'say'; text: string }
  | { kind: 'intent'; intent: ModViewIntent; target: Chatter }
  | { kind: 'error'; reason: 'unknownCommand' | 'unknownUser' | 'badDuration' | 'missingUser' }

// Commands the Mod View understands
const COMMANDS = ['timeout', 'ban', 'unban', 'warn'] as const

/**
 * Read a chat line, a slash command turning into a gesture
 * @param {string} text - Line typed
 * @param {(name: string) => Chatter | null} findChatter - Viewer lookup by login or name
 * @return {ChatCommandResult} - Message, gesture or error
 */

export const parseChatCommand = (
  text: string,
  findChatter: (name: string) => Chatter | null
): ChatCommandResult => {
  const line = text.trim()
  if (!line.startsWith('/')) return { kind: 'say', text: line }

  // Command, user, then the rest
  const [head = '', user = '', ...rest] = line.slice(1).split(/\s+/)
  const command = head.toLowerCase()
  if (!(COMMANDS as readonly string[]).includes(command))
    return { kind: 'error', reason: 'unknownCommand' }
  if (!user) return { kind: 'error', reason: 'missingUser' }

  const target = findChatter(user.replace(/^@/, ''))
  if (!target) return { kind: 'error', reason: 'unknownUser' }

  if (command === 'timeout') {
    const [duration = '', ...words] = rest
    const seconds = parseDuration(duration)
    if (seconds === null) return { kind: 'error', reason: 'badDuration' }

    return {
      kind: 'intent',
      target,
      intent: { kind: 'timeout', chatterId: target.id, seconds, reason: words.join(' ') || null },
    }
  }

  const reason = rest.join(' ')
  if (command === 'ban') {
    return {
      kind: 'intent',
      target,
      intent: { kind: 'ban', chatterId: target.id, reason: reason || null },
    }
  }
  if (command === 'warn') {
    return { kind: 'intent', target, intent: { kind: 'warn', chatterId: target.id, reason } }
  }

  return { kind: 'intent', target, intent: { kind: 'unban', chatterId: target.id } }
}

// Measures that read as a chat command, heaviest kept
const COMMAND_KINDS: string[] = [SanctionKinds.Ban, SanctionKinds.Timeout, SanctionKinds.Warn]

/**
 * Heaviest measure of a rung a command can carry
 * @param {SanctionRungView} rung - Panel rung
 * @return {SanctionMeasureView | null} - Measure, none for notes only
 */

export const commandMeasure = (rung: SanctionRungView): SanctionMeasureView | null =>
  [...rung.measures]
    .filter((measure) => COMMAND_KINDS.includes(measure.kind))
    .sort((left, right) => right.weight - left.weight)[0] ?? null

/**
 * Write the command a rung stands for, ready to reread then send
 * @param {SanctionRungView} rung - Panel rung
 * @param {string} login - Viewer login
 * @param {string} reason - Offence name kept as reason
 * @return {string | null} - Command, none when the rung holds no gesture
 */

export const writeRungCommand = (
  rung: SanctionRungView,
  login: string,
  reason: string
): string | null => {
  const measure = commandMeasure(rung)
  if (!measure) return null

  if (measure.kind === SanctionKinds.Warn) return `/warn ${login} ${reason}`
  if (measure.kind === SanctionKinds.Ban || measure.permanent) return `/ban ${login} ${reason}`

  return `/timeout ${login} ${formatDuration((measure.durationMinutes ?? 1) * 60)} ${reason}`
}

/**
 * Rungs already applied, per viewer then per offence
 * @typedef {Record<string, Record<string, number[]>>} PanelMemory
 */

export type PanelMemory = Record<string, Record<string, number[]>>

/**
 * Remember a rung applied to a viewer
 * @param {PanelMemory} memory - Current memory
 * @param {string} chatterId - Viewer
 * @param {string} offenseId - Offence
 * @param {number} rung - Rung index
 * @return {PanelMemory} - New memory
 */

export const rememberRung = (
  memory: PanelMemory,
  chatterId: string,
  offenseId: string,
  rung: number
): PanelMemory => {
  const viewer = memory[chatterId] ?? {}
  const applied = viewer[offenseId] ?? []
  if (applied.includes(rung)) return memory

  return { ...memory, [chatterId]: { ...viewer, [offenseId]: [...applied, rung] } }
}

/**
 * Rung that comes next for a viewer on one offence
 * @param {number[]} applied - Rungs already applied
 * @param {number} count - Rungs of the ladder
 * @return {number | null} - Next rung, none on an empty ladder
 */

export const nextRung = (applied: number[], count: number): number | null => {
  if (count === 0) return null
  if (applied.length === 0) return 0

  return Math.min(Math.max(...applied) + 1, count - 1)
}

/**
 * Third rung of a ladder, its last when shorter
 * @param {number} count - Rungs of the ladder
 * @return {number | null} - Rung, none on an empty ladder
 */

export const thirdRung = (count: number): number | null =>
  count === 0 ? null : Math.min(2, count - 1)
