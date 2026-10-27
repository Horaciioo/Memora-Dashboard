import { commandMeasure, nextRung, writeRungCommand } from '@/core/lib/modview/commands'
import type { PanelMemory } from '@/core/lib/modview/commands'
import {
  COMMON_WORDS,
  NAME_WEIGHT,
  PHRASE_WEIGHT,
  WORD_STEM,
} from '@/declarations/modview/suggestions'
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
 * @property {string | null} command - Line to paste
 */

export interface Suggestion {
  source: SuggestionSource
  offense: SanctionOffenseCard | null
  rung: number | null
  rungCount: number
  measure: SanctionMeasureView | null
  command: string | null
}

// Name without accents or case
const plain = (name: string): string =>
  name
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim()

const escapeRegex = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

// Words of a text, the common ones dropped
const wordsOf = (text: string): string[] =>
  plain(text)
    .split(/[^\p{L}\p{N}]+/u)
    .filter((word) => word.length >= 3 && !COMMON_WORDS.has(word))

// Same word, or same start for the long ones
const isSame = (left: string, right: string): boolean =>
  left === right ||
  (Math.min(left.length, right.length) >= WORD_STEM &&
    left.slice(0, WORD_STEM) === right.slice(0, WORD_STEM))

/**
 * Offence whose detection words the message holds, the one with the most words first
 * @param {SanctionPanelView | null} panel - Panel at the level in force
 * @param {SuggestionSource} source - What triggered it
 * @return {SanctionOffenseCard | null} - Offence, none when no detection word appears
 */

export const offenseByKeywords = (
  panel: SanctionPanelView | null,
  source: SuggestionSource
): SanctionOffenseCard | null => {
  if (!panel) return null

  const text = plain(`${source.text} ${source.flagged.join(' ')}`)
  let best: { offense: SanctionOffenseCard; hits: number } | null = null

  for (const offense of panel.offenses) {
    const hits = offense.keywords.filter((keyword) => {
      const word = plain(keyword)
      if (!word) return false

      // A whole word or phrase, plural tolerated
      const edge = '[^\\p{L}\\p{N}]'
      return new RegExp(`(^|${edge})${escapeRegex(word)}s?(${edge}|$)`, 'u').test(text)
    }).length

    if (hits > 0 && (!best || hits > best.hits)) best = { offense, hits }
  }

  return best?.offense ?? null
}

/**
 * Offence of the panel the message reads like, from the names and examples written in it, for offences without detection words
 * A word only one offence uses weighs more than one they share
 * @param {SanctionPanelView | null} panel - Panel at the level in force
 * @param {SuggestionSource} source - What triggered it
 * @return {SanctionOffenseCard | null} - Offence, none when nothing in the panel resembles it
 */

export const offenseByText = (
  panel: SanctionPanelView | null,
  source: SuggestionSource
): SanctionOffenseCard | null => {
  if (!panel) return null

  const message = [...wordsOf(source.text), ...source.flagged.flatMap(wordsOf)]
  const text = plain(source.text)
  const vocabulary = panel.offenses.map((offense) => ({
    offense,
    name: wordsOf(offense.name),
    examples: offense.examples.flatMap(wordsOf),
  }))

  // Offences that use a word, to weigh it
  const spread = (word: string): number =>
    Math.max(
      1,
      vocabulary.filter((entry) =>
        [...entry.name, ...entry.examples].some((other) => isSame(other, word))
      ).length
    )

  let best: { offense: SanctionOffenseCard; score: number } | null = null

  for (const entry of vocabulary) {
    let score = 0
    for (const word of message) {
      if (entry.name.some((other) => isSame(other, word))) score += NAME_WEIGHT / spread(word)
      if (entry.examples.some((other) => isSame(other, word))) score += 1 / spread(word)
    }
    for (const example of entry.offense.examples.map(plain)) {
      if (example.length >= 4 && text.includes(example)) score += PHRASE_WEIGHT
    }
    if (score > 0 && (!best || score > best.score)) best = { offense: entry.offense, score }
  }

  return best?.offense ?? null
}

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
    return { source, offense: null, rung: null, rungCount: 0, measure: null, command: null }

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
    command: step ? writeRungCommand(step, source.chatter.login, offense.name) : null,
  }
}
