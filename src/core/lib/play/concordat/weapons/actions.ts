import { adjustTrust } from '@/core/lib/play/concordat/diplomacy/trust'
import { noteAttack } from '@/core/lib/play/concordat/diplomacy/actions'
import { tieKindOf } from '@/core/lib/play/concordat/diplomacy/ties'
import { buildingById } from '@/core/lib/play/concordat/buildings/rules'
import { reachOf } from '@/core/lib/play/concordat/sim/area'
import { ticksOf } from '@/core/lib/play/concordat/sim/tables'
import { emit } from '@/core/lib/play/concordat/sim/emit'
import { flightTicks } from '@/core/lib/play/concordat/weapons/rules'
import { CONCORDAT } from '@/declarations/play/concordat/rules'
import type { ConcordatIntent, ConcordatState } from '@/types/concordat'
import { ConcordatTies } from '@/utils/constants/concordat'

const { weapons, air } = CONCORDAT

/**
 * Fire a missile: paid, public at once, landing after its flight
 * @param {ConcordatState} state - Game
 * @param {Extract<ConcordatIntent, { kind: 'launch' }>} intent - Launch
 * @return {void}
 */

export const launchStrike = (
  state: ConcordatState,
  intent: Extract<ConcordatIntent, { kind: 'launch' }>
): void => {
  const me = state.players[intent.playerId - 1]
  const arms = state.arms[me.id - 1]
  const silo = buildingById(state, intent.silo)
  if (!silo) return

  const kind = intent.weapon ?? (intent.heavy ? 'heavy' : 'missile')
  const isGun = kind === 'shell' || kind === 'rocket'
  const holder = state.owner[intent.tile]
  const isWar = !holder || tieKindOf(state, me.id, holder) === ConcordatTies.Hostile

  // Pay and use the stock
  if (isGun) {
    me.gold -= kind === 'shell' ? air.battery.shellCost : air.battery.rocketCost
    const cooldown = air.battery.cooldown[Math.min(silo.level, air.battery.cooldown.length) - 1]
    silo.coolAt = state.tick + ticksOf(cooldown)
  } else {
    me.gold -= intent.heavy ? weapons.heavyCost : weapons.missileCost
    if (intent.heavy) arms.heavy++
    else arms.missiles--
  }

  // A strike on a nation not at open war costs the credit of the shooter
  noteAttack(state, me.id, holder)
  if (!isWar)
    adjustTrust(state, me.id, -(kind === 'heavy' ? weapons.heavyTrust : weapons.strikeTrust))

  state.strikes.push({
    id: state.nextId++,
    owner: me.id,
    kind,
    tile: intent.tile,
    from: silo.tile,
    launchedAt: state.tick,
    impactAt:
      state.tick + flightTicks(state, kind, reachOf(silo.tile, intent.tile, state.map.width)),
    by: -1,
    shotAt: 0,
    killAt: 0,
  })
  state.isSystemsDirty = true
  emit(state, {
    tick: state.tick,
    kind: 'launched',
    actor: me.id,
    victim: holder,
    tile: intent.tile,
  })
}
