import type { ConcordatEvent, ConcordatState } from '@/types/concordat'
import { ConcordatPowers } from '@/utils/constants/concordat'

// Lines nobody reads when only countries and tribes are in them
const AI_NOISE: readonly ConcordatEvent['kind'][] = [
  'built',
  'researched',
  'treaty',
  'broken',
  'zoneWon',
]

// Lines of countries and tribes nobody reads, the bulk of a big game's journal
const AI_SILENT: readonly ConcordatEvent['kind'][] = ['built', 'researched', 'zoneWon']

// Journal line kept for a seat, or a country at war, never for tribes alone
const isWorthKeeping = (state: ConcordatState, event: ConcordatEvent): boolean => {
  const parties = [event.actor, event.victim]
    .filter((id) => id > 0)
    .map((id) => state.players[id - 1]?.kind)
  if (parties.includes(ConcordatPowers.Human) || !parties.length) return true

  if (AI_SILENT.includes(event.kind)) return false

  return !parties.includes(ConcordatPowers.Tribe) && !AI_NOISE.includes(event.kind)
}

/**
 * Write a journal line, kept for the wire and for the timeline
 * @param {ConcordatState} state - Game
 * @param {ConcordatEvent} event - Line
 * @return {void}
 */

export const emit = (state: ConcordatState, event: ConcordatEvent): void => {
  if (!isWorthKeeping(state, event)) return

  state.events.push(event)
  state.log.push(event)
}
