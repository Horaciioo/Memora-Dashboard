import { emit } from '@/core/lib/play/concordat/sim/emit'
import { refreshEffects } from '@/core/lib/play/concordat/buildings/effects'
import { runWorld, applyWorldEffects } from '@/core/lib/play/concordat/events'
import { runRotation } from '@/core/lib/play/concordat/modes'
import { applyTechEffects, endFeints, finishResearch } from '@/core/lib/play/concordat/tech'
import { endReason, runDomination } from '@/core/lib/play/concordat/victory'
import { applyAirGuards, runAir } from '@/core/lib/play/concordat/air'
import { applyWeaponUpkeep, runWeapons } from '@/core/lib/play/concordat/weapons'
import { runEmbargoes } from '@/core/lib/play/concordat/diplomacy/embargo'
import { runSignals } from '@/core/lib/play/concordat/diplomacy/signals'
import { runDiplomacy } from '@/core/lib/play/concordat/diplomacy/step'
import { runNavy } from '@/core/lib/play/concordat/navy/step'
import { runTrade } from '@/core/lib/play/concordat/trade/step'
import { runCombat } from '@/core/lib/play/concordat/sim/attack'
import { eliminate } from '@/core/lib/play/concordat/sim/fall'
import { beginPlay } from '@/core/lib/play/concordat/sim/create'
import { runSpawns } from '@/core/lib/play/concordat/sim/spawn'
import { runEconomy } from '@/core/lib/play/concordat/sim/economy'
import { applyIntent } from '@/core/lib/play/concordat/sim/intents'
import type { ConcordatIntent, ConcordatState } from '@/types/concordat'
import { CONCORDAT, CONCORDAT_TICKS_PER_SECOND } from '@/declarations/play/concordat/rules'
import { ConcordatPhases } from '@/utils/constants/concordat'

// Samples kept before the oldest are thinned
const HISTORY_LIMIT = 400

// Nations without land fall
const eliminateEmpty = (state: ConcordatState): void => {
  for (const player of state.players) {
    if (player.alive && player.tiles <= 0 && !player.spawnAt) eliminate(state, player, 0)
  }
}

// Last side standing, domination held or time up
const checkEnd = (state: ConcordatState): void => {
  if (!endReason(state)) return

  state.phase = ConcordatPhases.Ended
  emit(state, { tick: state.tick, kind: 'ended', actor: 0, victim: 0, tile: -1 })
}

// Territory of every nation, kept for the timeline
const sampleHistory = (state: ConcordatState): void => {
  if (state.tick % CONCORDAT.history.everyTicks !== 0 && state.phase !== ConcordatPhases.Ended)
    return

  state.history.push({ tick: state.tick, tiles: state.players.map((player) => player.tiles) })
  // An old game thins its first samples instead of growing
  if (state.history.length > HISTORY_LIMIT) {
    state.history = state.history.filter((_, index) => index % 2 === 0)
  }
}

/**
 * Advance one tick: commands, economy, combat, falls, end
 * @param {ConcordatState} state - Game
 * @param {ConcordatIntent[]} intents - Commands of this tick
 * @return {Map<ConcordatIntent, string>} - Refusals by command
 */

export const stepTick = (
  state: ConcordatState,
  intents: ConcordatIntent[]
): Map<ConcordatIntent, string> => {
  const refused = new Map<ConcordatIntent, string>()
  if (state.phase === ConcordatPhases.Ended) return refused

  // Commands first, in arrival order
  for (const intent of intents) {
    const reason = applyIntent(state, intent)
    if (reason) refused.set(intent, reason)
  }
  state.tick++

  // Picking ends on its tick
  if (state.phase === ConcordatPhases.Picking) {
    if (state.tick >= state.pickEnd) beginPlay(state)

    return refused
  }

  refreshEffects(state)
  applyAirGuards(state)
  applyTechEffects(state)
  applyWeaponUpkeep(state)
  applyWorldEffects(state)
  finishResearch(state)
  endFeints(state)
  runRotation(state)
  runWeapons(state)
  runAir(state)
  runWorld(state)
  runDiplomacy(state)
  runNavy(state)
  runEmbargoes(state)
  runSignals(state)
  runTrade(state)
  runEconomy(state)
  runSpawns(state)
  runCombat(state)
  eliminateEmpty(state)
  runDomination(state)
  checkEnd(state)
  sampleHistory(state)
  // Economy figures drift all the time, the screens get them every few seconds
  if (state.tick % (CONCORDAT_TICKS_PER_SECOND * 5) === 0) state.isSystemsDirty = true

  return refused
}

/**
 * Take the journal lines gathered so far
 * @param {ConcordatState} state - Game
 * @return {ConcordatState['events']} - Events
 */

export const drainEvents = (state: ConcordatState): ConcordatState['events'] =>
  state.events.splice(0, state.events.length)

/**
 * Take the tiles changed since the last call
 * @param {ConcordatState} state - Game
 * @return {number[]} - Tiles
 */

export const drainChanges = (state: ConcordatState): number[] =>
  state.changed.splice(0, state.changed.length)
