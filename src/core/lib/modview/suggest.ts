import { nextRung, writeRungCommand } from '@/core/lib/modview/commands'
import type { PanelMemory } from '@/core/lib/modview/commands'
import { AUTOMOD_OFFENSES, CHAT_FLAG_CATEGORY } from '@/declarations/modview/suggestions'
import type { Chatter } from '@/types/modview'
import type { SanctionOffenseCard, SanctionPanelView } from '@/types/sanctions'

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
 * @property {string | null} command - Line to paste
 */

export interface Suggestion {
  source: SuggestionSource
  offense: SanctionOffenseCard | null
  rung: number | null
  rungCount: number
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
  const offense = offenseForCategory(panel, source.categoryKey)
  if (!offense) return { source, offense: null, rung: null, rungCount: 0, command: null }

  // The rung after the ones already applied
  const applied = memory[source.chatter.id]?.[offense.id] ?? []
  const rung = nextRung(applied, offense.rungs.length)
  const step = rung === null ? undefined : offense.rungs[rung]

  return {
    source,
    offense,
    rung,
    rungCount: offense.rungs.length,
    command: step ? writeRungCommand(step, source.chatter.login, offense.name) : null,
  }
}
