import { tiersOf } from '@/core/lib/play/concordat/tech/rules'
import type { ConcordatState } from '@/types/concordat'
import { CONCORDAT_TECH_ORDER } from '@/utils/constants/concordat'

/**
 * Add what the tiers reached give to the effects of each nation
 * @param {ConcordatState} state - Game
 * @return {void}
 */

export const applyTechEffects = (state: ConcordatState): void => {
  for (const player of state.players) {
    const effects = state.effects[player.id - 1]
    const levels = state.techs[player.id - 1].levels

    CONCORDAT_TECH_ORDER.forEach((path, index) => {
      // Tiers add up
      for (const tier of tiersOf(path).slice(0, levels[index])) {
        effects.income += tier.income ?? 0
        effects.cap += tier.cap ?? 0
        effects.growth += tier.growth ?? 0
        effects.defense += tier.defense ?? 0
        effects.intercept += tier.intercept ?? 0
        effects.shipSpeed += tier.shipSpeed ?? 0
        effects.ships += tier.ships ?? 0
        effects.calm += tier.calm ?? 0
        effects.trustGain += tier.trustGain ?? 0
        effects.peace += tier.peace ?? 0
        effects.blockade += tier.blockade ?? 0
        effects.upkeepCut += tier.upkeepCut ?? 0
        if (tier.feint) effects.canFeint = true
      }
    })
  }
}
