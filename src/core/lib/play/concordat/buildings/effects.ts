import { isWorking, kindOf } from '@/core/lib/play/concordat/buildings/rules'
import { applyPactEffects } from '@/core/lib/play/concordat/diplomacy/aid'
import { CONCORDAT } from '@/declarations/play/concordat/rules'
import type { ConcordatState } from '@/types/concordat'
import { ConcordatShipKinds } from '@/utils/constants/concordat'

/**
 * Rebuild what the buildings give, their upkeep and the fleets
 * @param {ConcordatState} state - Game
 * @return {void}
 */

export const refreshEffects = (state: ConcordatState): void => {
  for (const effects of state.effects) {
    effects.gold = 0
    effects.cap = 0
    effects.growth = 0
    effects.calm = 0
    effects.upkeep = 0
    effects.ships = 0
    effects.fortresses.length = 0
    effects.income = 1
    effects.defense = 0
    effects.intercept = 0
    effects.shipSpeed = 0
    effects.trustGain = 0
    effects.blockade = 0
    effects.upkeepCut = 0
    effects.canFeint = false
    effects.malus = 0
  }

  // Buildings of a kind already counted per owner, each extra one yields less
  const rank = new Map<string, number>()

  for (const building of state.buildings) {
    const effects = state.effects[building.owner - 1]
    const level = kindOf(building.kind).levels[building.level - 1]
    effects.upkeep += level.upkeep
    // A building under work only costs
    if (!isWorking(building, state.tick)) continue

    const key = `${building.owner}:${building.kind}`
    const seen = rank.get(key) ?? 0
    rank.set(key, seen + 1)
    const yieldShare = CONCORDAT.buildings.yieldDecay ** seen

    effects.gold += level.gold * yieldShare
    effects.cap += level.cap * yieldShare
    effects.growth += level.growth * yieldShare
    effects.calm += level.calm
    effects.ships += level.ships
    if (level.defense) {
      effects.fortresses.push({
        tile: building.tile,
        radius: level.radius,
        defense: level.defense,
      })
    }
  }

  applyPactEffects(state)

  for (const ship of state.ships) {
    if (ship.kind === ConcordatShipKinds.War) {
      state.effects[ship.owner - 1].upkeep += CONCORDAT.navy.warUpkeep
    }
  }
}

/**
 * Defense a tile gets from the fortresses of its holder
 * @param {ConcordatState} state - Game
 * @param {number} holder - Defender
 * @param {number} tile - Tile attacked
 * @return {number} - Extra factor, zero when none near
 */

export const fortressBonus = (state: ConcordatState, holder: number, tile: number): number => {
  if (!holder) return 0

  const { width } = state.map
  const x = tile % width
  const y = Math.floor(tile / width)
  let bonus = state.effects[holder - 1].defense
  for (const fort of state.effects[holder - 1].fortresses) {
    const dx = (fort.tile % width) - x
    const dy = Math.floor(fort.tile / width) - y
    if (dx * dx + dy * dy <= fort.radius * fort.radius) bonus += fort.defense
  }

  return bonus
}
