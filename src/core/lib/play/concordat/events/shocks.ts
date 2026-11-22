import { adjustTrust } from '@/core/lib/play/concordat/diplomacy/trust'
import { emit } from '@/core/lib/play/concordat/sim/emit'
import { nextRandom } from '@/core/lib/play/concordat/sim/rng'
import { ticksOf } from '@/core/lib/play/concordat/sim/tables'
import { transferTile } from '@/core/lib/play/concordat/sim/tiles'
import { largest, richest } from '@/core/lib/play/concordat/events/rules'
import { addZone } from '@/core/lib/play/concordat/zones'
import { CONCORDAT } from '@/declarations/play/concordat/rules'
import type { ConcordatShock, ConcordatState } from '@/types/concordat'
import {
  CONCORDAT_WORLD_ORDER,
  ConcordatTies,
  ConcordatWorldKinds,
  ConcordatZoneKinds,
} from '@/utils/constants/concordat'
import type { ConcordatWorldKind, ConcordatZoneKind } from '@/utils/constants/concordat'

const { events } = CONCORDAT
const DISASTERS: ConcordatZoneKind[] = [
  ConcordatZoneKinds.Quake,
  ConcordatZoneKinds.Flood,
  ConcordatZoneKinds.Storm,
]
// Tiles tried to find the centre of a disaster
const CENTRE_TRIES = 60

const shock = (kind: ConcordatWorldKind, state: ConcordatState, length: number): ConcordatShock => {
  const startsAt = state.tick + ticksOf(events.announceSeconds)

  return {
    kind,
    targets: [],
    province: 0,
    tile: -1,
    zone: ConcordatZoneKinds.Quake,
    startsAt,
    endsAt: startsAt + ticksOf(length),
    isApplied: false,
  }
}

// Province of the leader that can leave without costing it over the cap
const provinceToFree = (state: ConcordatState, holder: number): number => {
  const nation = state.players[holder - 1]
  const stride = state.map.provinces.length + 1
  let best = 0
  let bestHeld = 0

  for (const province of state.map.provinces) {
    const held = state.provinceCounts[holder * stride + province.id]
    if (held > bestHeld && held <= nation.tiles * events.maxLossShare) {
      best = province.id
      bestHeld = held
    }
  }

  return best
}

// Centre of a disaster inside the land of the leader
const centreIn = (state: ConcordatState, holder: number): number => {
  for (let attempt = 0; attempt < CENTRE_TRIES; attempt++) {
    const tile = Math.floor(nextRandom(state) * state.owner.length)
    if (state.owner[tile] === holder) return tile
  }

  return -1
}

/**
 * Draw the shock to come, null when nothing suits
 * @param {ConcordatState} state - Game
 * @return {ConcordatShock | null} - Shock
 */

export const drawShock = (state: ConcordatState): ConcordatShock | null => {
  const living = state.players.filter((player) => player.alive).length
  if (living < 2) return null

  const kind = CONCORDAT_WORLD_ORDER[Math.floor(nextRandom(state) * CONCORDAT_WORLD_ORDER.length)]
  const leader = largest(state)[0]

  if (kind === ConcordatWorldKinds.Crisis) {
    const draw = shock(kind, state, events.crisisSeconds)
    draw.targets = richest(state)
      .slice(0, events.crisisTargets)
      .map((player) => player.id)

    return draw
  }
  if (kind === ConcordatWorldKinds.Harvest) {
    const draw = shock(kind, state, events.harvestSeconds)
    const count = Math.max(1, Math.floor(living / 3))
    draw.targets = largest(state)
      .slice(-count)
      .map((player) => player.id)

    return draw
  }
  if (kind === ConcordatWorldKinds.Revolt) {
    const province = provinceToFree(state, leader.id)
    if (!province) return null

    const draw = shock(kind, state, 1)
    draw.targets = [leader.id]
    draw.province = province
    const spot = state.map.provinces[province - 1]
    draw.tile = spot.y * state.map.width + spot.x

    return draw
  }
  if (kind === ConcordatWorldKinds.Disaster) {
    const tile = centreIn(state, leader.id)
    if (tile < 0) return null

    const draw = shock(kind, state, events.disasterSeconds)
    draw.targets = [leader.id]
    draw.tile = tile
    draw.zone = DISASTERS[Math.floor(nextRandom(state) * DISASTERS.length)]

    return draw
  }

  const draw = shock(ConcordatWorldKinds.Tension, state, 1)
  draw.targets = [leader.id]

  return draw
}

/**
 * Tell the table what is coming
 * @param {ConcordatState} state - Game
 * @param {ConcordatShock} draw - Shock
 * @return {void}
 */

export const announceShock = (state: ConcordatState, draw: ConcordatShock): void => {
  emit(state, {
    tick: state.tick,
    kind: 'announce',
    actor: CONCORDAT_WORLD_ORDER.indexOf(draw.kind),
    victim: draw.targets[0] ?? 0,
    tile: draw.tile,
  })
}

// Treaty partners of a nation
const partnersOf = (state: ConcordatState, holder: number): number[] =>
  state.relations
    .filter(
      (tie) => (tie.a === holder || tie.b === holder) && tie.kind === ConcordatTies.Alliance
    )
    .map((tie) => (tie.a === holder ? tie.b : tie.a))

/**
 * Apply the one-off part of a shock when its time comes
 * @param {ConcordatState} state - Game
 * @param {ConcordatShock} active - Shock
 * @return {void}
 */

export const applyShock = (state: ConcordatState, active: ConcordatShock): void => {
  active.isApplied = true

  if (active.kind === ConcordatWorldKinds.Revolt) {
    // The province leaves, the rest of the nation stays
    for (let tile = 0; tile < state.owner.length; tile++) {
      if (state.map.province[tile] === active.province && state.owner[tile] === active.targets[0]) {
        transferTile(state, tile, 0)
      }
    }
    emit(state, {
      tick: state.tick,
      kind: 'revolt',
      actor: 0,
      victim: active.targets[0],
      tile: active.tile,
    })
  } else if (active.kind === ConcordatWorldKinds.Disaster) {
    addZone(state, {
      kind: active.zone,
      tile: active.tile,
      radius: events.disasterRadius,
      until: active.endsAt,
    })
  } else if (active.kind === ConcordatWorldKinds.Tension) {
    // The leader and its partners lose credit
    adjustTrust(state, active.targets[0], -events.tensionTrust)
    for (const partner of partnersOf(state, active.targets[0])) {
      adjustTrust(state, partner, -events.tensionTrust / 2)
    }
  }
}
