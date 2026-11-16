import { legTicks } from '@/core/lib/play/concordat/air/path'
import { noteAttack } from '@/core/lib/play/concordat/diplomacy/actions'
import { emit } from '@/core/lib/play/concordat/sim/emit'
import { ticksOf } from '@/core/lib/play/concordat/sim/tables'
import { buildingById } from '@/core/lib/play/concordat/buildings/rules'
import { CONCORDAT } from '@/declarations/play/concordat/rules'
import type { ConcordatIntent, ConcordatState } from '@/types/concordat'
import { ConcordatAirKinds } from '@/utils/constants/concordat'

const { air } = CONCORDAT

/**
 * Send an aircraft up: paid at once, it flies out, circles, then comes home
 * @param {ConcordatState} state - Game
 * @param {Extract<ConcordatIntent, { kind: 'sortie' }>} intent - Sortie
 * @return {void}
 */

export const launchSortie = (
  state: ConcordatState,
  intent: Extract<ConcordatIntent, { kind: 'sortie' }>
): void => {
  const me = state.players[intent.playerId - 1]
  const base = buildingById(state, intent.base)
  if (!base) return

  const kind = intent.air
  const spec = air[kind]
  const leg = legTicks(kind, base.tile, intent.tile, state.map.width)
  const holder = state.owner[intent.tile]
  me.gold -= spec.cost
  state.aircraft.push({
    id: state.nextId++,
    owner: me.id,
    kind,
    base: base.tile,
    tile: intent.tile,
    launchedAt: state.tick,
    until: state.tick + 2 * leg + ticksOf(spec.stay),
    hp: spec.hp,
    shotAt: 0,
    shotFrom: -1,
  })
  state.isSystemsDirty = true

  // A raid on a nation not at open war costs the credit of the shooter
  if (kind !== ConcordatAirKinds.Fighter || !holder || holder === me.id) return
  noteAttack(state, me.id, holder)
  emit(state, { tick: state.tick, kind: 'sortie', actor: me.id, victim: holder, tile: intent.tile })
}
