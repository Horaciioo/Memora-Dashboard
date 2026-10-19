import { commandMeasure, nextRung, writeRungCommand } from '@/core/lib/modview/commands'
import type { PanelMemory } from '@/core/lib/modview/commands'
import { AUTOMOD_OFFENSES, CHAT_FLAG_CATEGORY } from '@/declarations/modview/suggestions'
import type { Chatter } from '@/types/modview'
import type { SanctionMeasureView, SanctionOffenseCard, SanctionPanelView } from '@/types/sanctions'

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

/**
 * Offence of the panel an AutoMod category points at
 * @param {SanctionPanelView | null} panel - Panel at the level in force
 * @param {string} categoryKey - Platform key
 * @return {SanctionOffenseCard | null} - Offence
 */

export const offenseForCategory = (
  panel: SanctionPanelView | null,
  categoryKey: string
): SanctionOffenseCard | null => {
  if (!panel) return null
  const wanted = AUTOMOD_OFFENSES[categoryKey] ?? AUTOMOD_OFFENSES[CHAT_FLAG_CATEGORY] ?? []

  for (const name of wanted) {
    const exact = panel.offenses.find((offense) => plain(offense.name) === plain(name))
    if (exact) return exact
  }

  return null
}

/**
 * Offence whose examples the message looks like
 * @param {SanctionPanelView | null} panel - Panel at the level in force
 * @param {SuggestionSource} source - What triggered it
 * @return {SanctionOffenseCard | null} - Offence, none when no example fits
 */

export const offenseByExamples = (
  panel: SanctionPanelView | null,
  source: SuggestionSource
): SanctionOffenseCard | null => {
  if (!panel) return null
  const text = plain(source.text)
  const words = source.flagged.map(plain).filter((word) => word.length > 1)
  let best: { offense: SanctionOffenseCard; score: number } | null = null

  for (const offense of panel.offenses) {
    let score = 0
    for (const example of offense.examples.map(plain)) {
      if (example.length < 2) continue
      // The whole example said again weighs more than a shared word
      if (example.length >= 4 && text.includes(example)) score += 3
      else if (words.some((word) => example.includes(word) || word.includes(example))) score += 2
    }
    if (score > 0 && (!best || score > best.score)) best = { offense, score }
  }

  return best?.offense ?? null
}

/**
 * Offence a source stands for: the AutoMod category when it names one, else the examples
 * @param {SanctionPanelView | null} panel - Panel at the level in force
 * @param {SuggestionSource} source - What triggered it
 * @return {SanctionOffenseCard | null} - Offence
 */

const offenseOf = (
  panel: SanctionPanelView | null,
  source: SuggestionSource
): SanctionOffenseCard | null => {
  const isNamed = source.categoryKey !== CHAT_FLAG_CATEGORY

  return isNamed
    ? (offenseForCategory(panel, source.categoryKey) ?? offenseByExamples(panel, source))
    : (offenseByExamples(panel, source) ?? offenseForCategory(panel, source.categoryKey))
}

/**
 * Write the suggestion of one source: viewer, command of the rung they come to, reason
 * @param {SuggestionSource} source - What triggered it
 * @param {SanctionPanelView | null} panel - Panel at the level in force
 * @param {PanelMemory} memory - Rungs already applied
 * @return {Suggestion} - Suggestion
 */

export const suggestFor = (
  source: SuggestionSource,
  panel: SanctionPanelView | null,
  memory: PanelMemory
): Suggestion => {
  const offense = offenseOf(panel, source)
  if (!offense)
    return { source, offense: null, rung: null, rungCount: 0, measure: null, command: null }

  // The rung after the ones already applied
  const applied = memory[source.chatter.id]?.[offense.id] ?? []
  const rung = nextRung(applied, offense.rungs.length)
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
