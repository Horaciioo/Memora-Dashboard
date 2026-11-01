import { commandMeasure, nextRung, writeRungCommand } from '@/core/lib/modview/commands'
import type { PanelMemory } from '@/core/lib/modview/commands'
import { offenseByKeywords, offenseByText } from '@/core/lib/modview/detection'
import type { Chatter, ModAct } from '@/types/modview'
import type {
  SanctionMeasureView,
  SanctionOffenseCard,
  SanctionPanelView,
  SanctionRungView,
} from '@/types/sanctions'
import { SanctionGravities, SanctionKinds } from '@/utils/constants/moderation'
import type { SanctionGravityName } from '@/utils/constants/moderation'

/**
 * Something the AutoMod or a flag points at
 * @typedef {Object} SuggestionSource
 * @property {string} id - Held or chat message identifier
 * @property {'automod' | 'chat'} origin - Where it comes from
 * @property {Chatter} chatter - Author
 * @property {string} text - Message
 * @property {string[]} flagged - Words caught
 * @property {string} categoryKey - Platform key of the category
 * @property {string} category - Category said
 * @property {string} at - Moment
 */

export interface SuggestionSource {
  id: string
  origin: 'automod' | 'chat'
  chatter: Chatter
  text: string
  flagged: string[]
  categoryKey: string
  category: string
  at: string
}

/**
 * Command ready to paste
 * @typedef {Object} Suggestion
 * @property {SuggestionSource} source - What triggered it
 * @property {SanctionOffenseCard | null} offense - Offence of the panel
 * @property {number | null} rung - Rung proposed
 * @property {number} rungCount - Rungs of the ladder
 * @property {SanctionMeasureView | null} measure - Heaviest command measure
 * @property {boolean} hasAction - The rung asks for a moderation act
 * @property {string | null} command - Line to paste
 */

export interface Suggestion {
  source: SuggestionSource
  offense: SanctionOffenseCard | null
  rung: number | null
  rungCount: number
  measure: SanctionMeasureView | null
  hasAction: boolean
  command: string | null
}

export { offenseByKeywords, offenseByText }

// Weight of the lightest gesture each gravity deserves: warning, then timeout
const GRAVITY_FLOOR: Record<SanctionGravityName, number> = {
  [SanctionGravities.Low]: 0,
  [SanctionGravities.Medium]: 1,
  [SanctionGravities.High]: 2,
}

// A removal already counts, so a viewer back after one never gets a bare removal again
const REMOVAL_WEIGHT = 0.5

// A ban outweighs any timeout
const BAN_WEIGHT = 100

/**
 * How heavy a sanction is: removal, warning, timeouts by length, ban
 * @param {string} kind - Sanction kind
 * @param {number} seconds - Timeout length
 * @return {number} - Weight
 */

const weightOf = (kind: string, seconds: number): number => {
  if (kind === 'ban' || kind === SanctionKinds.Ban) return BAN_WEIGHT
  if (kind === 'timeout' || kind === SanctionKinds.Timeout)
    return 2 + Math.log10(Math.max(seconds, 1)) / 10
  if (kind === 'warn' || kind === SanctionKinds.Warn) return 1
  if (kind === 'delete' || kind === 'automodDeny' || kind === SanctionKinds.Delete)
    return REMOVAL_WEIGHT

  return 0
}

/**
 * Heaviest sanction a viewer already got before a message
 * @param {ModAct[]} acts - Moderator actions of the live
 * @param {Chatter} chatter - Viewer
 * @param {string} before - Moment of the message
 * @return {number} - Weight, 0 when clean
 */

const priorWeight = (acts: ModAct[], chatter: Chatter, before: string): number => {
  const keys = [chatter.id, chatter.login.toLowerCase(), chatter.name.toLowerCase()]
  const limit = Date.parse(before)

  return acts.reduce((heaviest, act) => {
    const isViewer =
      (act.targetId && keys.includes(act.targetId)) ||
      (act.target && keys.includes(act.target.toLowerCase()))
    if (!isViewer || Date.parse(act.at) > limit) return heaviest

    return Math.max(heaviest, weightOf(act.kind, act.durationSeconds ?? 0))
  }, 0)
}

// Weight a rung carries, through its heaviest measure
const rungWeight = (step: SanctionRungView): number =>
  step.measures.reduce(
    (heaviest, measure) =>
      Math.max(
        heaviest,
        weightOf(measure.kind, measure.permanent ? Infinity : (measure.durationMinutes ?? 0) * 60)
      ),
    0
  )

/**
 * Rung to propose: the one after those applied, never lighter than the gravity or the viewer's past
 * @param {SanctionOffenseCard} offense - Offence
 * @param {number} next - Rung that follows the applied ones
 * @param {number} prior - Heaviest sanction already received
 * @return {number} - Rung
 */

const fitRung = (offense: SanctionOffenseCard, next: number, prior: number): number => {
  const floor = Math.max(GRAVITY_FLOOR[offense.gravity] ?? 0, prior)
  const fit = offense.rungs.findIndex((step, index) => index >= next && rungWeight(step) >= floor)

  // Nothing heavy enough: the heaviest the ladder holds
  return fit === -1 ? offense.rungs.length - 1 : fit
}

/**
 * Write the suggestion of one source: viewer, command of the rung they come to, reason
 * @param {SuggestionSource} source - What triggered it
 * @param {SanctionPanelView | null} panel - Panel at the level in force
 * @param {PanelMemory} memory - Rungs already applied
 * @param {ModAct[]} acts - Moderator actions of the live
 * @return {Suggestion} - Suggestion
 */

export const suggestFor = (
  source: SuggestionSource,
  panel: SanctionPanelView | null,
  memory: PanelMemory,
  acts: ModAct[] = []
): Suggestion => {
  const offense = offenseByKeywords(panel, source) ?? offenseByText(panel, source)
  if (!offense)
    return {
      source,
      offense: null,
      rung: null,
      rungCount: 0,
      measure: null,
      hasAction: false,
      command: null,
    }

  // The rung after the ones already applied
  const applied = memory[source.chatter.id]?.[offense.id] ?? []
  const next = nextRung(applied, offense.rungs.length)
  const rung =
    next === null ? null : fitRung(offense, next, priorWeight(acts, source.chatter, source.at))
  const step = rung === null ? undefined : offense.rungs[rung]

  return {
    source,
    offense,
    rung,
    rungCount: offense.rungs.length,
    measure: step ? commandMeasure(step) : null,
    hasAction: (step?.measures.length ?? 0) > 0,
    command: step ? writeRungCommand(step, source.chatter.login, offense.name) : null,
  }
}

/**
 * Whether a suggestion carries something to do: an offence, a rung, a measure
 * @param {Suggestion} suggestion - Suggestion written
 * @return {boolean} - False when nothing should be proposed
 */

export const isActionable = (suggestion: Suggestion): boolean =>
  suggestion.offense !== null && suggestion.rung !== null && suggestion.hasAction
