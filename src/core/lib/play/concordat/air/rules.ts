import { buildingById, isWorking } from '@/core/lib/play/concordat/buildings/rules'
import { tieKindOf } from '@/core/lib/play/concordat/diplomacy/ties'
import { modeRules } from '@/core/lib/play/concordat/modes/rules'
import { reachOf } from '@/core/lib/play/concordat/sim/area'
import { ticksOf } from '@/core/lib/play/concordat/sim/tables'
import { weaponsOn } from '@/core/lib/play/concordat/weapons/rules'
import { CONCORDAT } from '@/declarations/play/concordat/rules'
import type { ConcordatIntent, ConcordatState } from '@/types/concordat'
import {
  ConcordatAirKinds,
  ConcordatBuildingKinds,
  ConcordatTerrains,
  ConcordatTies,
} from '@/utils/constants/concordat'

const { air } = CONCORDAT

/**
 * Two nations fire on each other's aircraft
 * @param {ConcordatState} state - Game
 * @param {number} first - Nation
 * @param {number} second - Nation
 * @return {boolean} - Hostile
 */

export const areHostile = (state: ConcordatState, first: number, second: number): boolean => {
  if (first === second) return false
  const tie = tieKindOf(state, first, second)

  return tie !== ConcordatTies.Peace && tie !== ConcordatTies.Alliance
}

/**
 * Aircraft a nation may keep in the sky, one per airbase level
 * @param {ConcordatState} state - Game
 * @param {number} playerId - Nation
 * @return {number} - Slots
 */

export const airSlots = (state: ConcordatState, playerId: number): number =>
  state.buildings
    .filter(
      (building) =>
        building.owner === playerId &&
        building.kind === ConcordatBuildingKinds.Airbase &&
        isWorking(building, state.tick)
    )
    .reduce((sum, building) => sum + building.level * air.slotsPerLevel, 0)

/**
 * Why a sortie is refused, null when it takes off
 * @param {ConcordatState} state - Game
 * @param {Extract<ConcordatIntent, { kind: 'sortie' }>} intent - Sortie
 * @return {string | null} - Reason
 */

export const sortieRefusal = (
  state: ConcordatState,
  intent: Extract<ConcordatIntent, { kind: 'sortie' }>
): string | null => {
  if (!weaponsOn(state)) return 'featureOff'
  if (!state.weapons.includes(intent.air)) return 'weaponOff'
  if (state.tick < state.pickEnd + ticksOf(air.unlockMinutes * 60)) return 'tooEarly'
  if (!Number.isInteger(intent.tile) || intent.tile < 0 || intent.tile >= state.owner.length)
    return 'badTile'
  if (state.map.terrain[intent.tile] === ConcordatTerrains.Sea && intent.air === 'heli')
    return 'badTerrain'

  const base = buildingById(state, intent.base)
  if (
    !base ||
    base.owner !== intent.playerId ||
    base.kind !== ConcordatBuildingKinds.Airbase ||
    !isWorking(base, state.tick)
  )
    return 'noBase'
  if (reachOf(base.tile, intent.tile, state.map.width) > air.range) return 'outOfRange'

  const mine = state.aircraft.filter((aircraft) => aircraft.owner === intent.playerId)
  if (mine.length >= airSlots(state, intent.playerId)) return 'noSlot'

  const holder = state.owner[intent.tile]
  if (intent.air === ConcordatAirKinds.Heli) {
    if (holder !== intent.playerId) return 'notYours'
    if (mine.filter((aircraft) => aircraft.kind === 'heli').length >= air.heli.max) return 'heliMax'
  } else if (holder !== intent.playerId && holder) {
    const target = state.players[holder - 1]
    if (state.tick < target.protectedUntil) return 'protected'
    if (tieKindOf(state, intent.playerId, holder) === ConcordatTies.Peace) return 'treaty'
  }
  if (!modeRules(state.mode).weapons) return 'featureOff'

  const cost = intent.air === ConcordatAirKinds.Heli ? air.heli.cost : air.fighter.cost

  return state.players[intent.playerId - 1].gold < cost ? 'noGold' : null
}
