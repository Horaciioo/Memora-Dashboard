import { emit } from '@/core/lib/play/concordat/sim/emit'
import { fortressBonus } from '@/core/lib/play/concordat/buildings/effects'
import { attackFactor } from '@/core/lib/play/concordat/diplomacy/actions'
import { neighborsOf, NEIGHBOR_SLOTS } from '@/core/lib/play/concordat/map'
import { defenseDensity } from '@/core/lib/play/concordat/sim/defense'
import { tileNoise } from '@/core/lib/play/concordat/sim/rng'
import { TERRAIN_DEFENSE, TICK_SECONDS } from '@/core/lib/play/concordat/sim/tables'
import { transferTile } from '@/core/lib/play/concordat/sim/tiles'
import { CONCORDAT } from '@/declarations/play/concordat/rules'
import type { ConcordatCorps, ConcordatState } from '@/types/concordat'
import { ConcordatPowers, ConcordatTerrains } from '@/utils/constants/concordat'

const { sim, front } = CONCORDAT
const near = new Int32Array(NEIGHBOR_SLOTS)
// Apart from near: ownAround reads it while the walk still holds this one
const around = new Int32Array(NEIGHBOR_SLOTS)

/**
 * Corps troops back to the reserve
 * @param {ConcordatState} state - Game
 * @param {ConcordatCorps} corps - Corps
 * @param {number} lossShare - Share lost on the way
 * @return {void}
 */

export const disband = (state: ConcordatState, corps: ConcordatCorps, lossShare: number): void => {
  state.players[corps.owner - 1].troops += corps.troops * (1 - lossShare)
  state.corps = state.corps.filter((other) => other !== corps)
}

// Own neighbours of a tile
const ownAround = (state: ConcordatState, tile: number, owner: number): number => {
  const count = neighborsOf(tile, state.map.width, state.map.height, near)
  let mine = 0
  for (let slot = 0; slot < count; slot++) if (state.owner[near[slot]] === owner) mine++

  return mine
}

// Enemy tiles touching the owner front, with the owner neighbours of each, a hole of another zone is still taken
const gatherContact = (
  state: ConcordatState,
  corps: ConcordatCorps
): { tiles: number[]; own: number[] } => {
  const { width, height } = state.map
  const seen = new Set<number>()
  const tiles: number[] = []
  const own: number[] = []

  // Walk the border of the pusher, a huge one is sampled from a start that moves each tick
  const edges = state.players[corps.owner - 1].front
  const stride = Math.max(1, Math.ceil(edges.size / front.maxContact))
  const shift = (state.tick + corps.id) % stride
  let position = 0
  for (const edge of edges) {
    if (position++ % stride !== shift) continue
    const count = neighborsOf(edge, width, height, around)
    for (let slot = 0; slot < count; slot++) {
      const next = around[slot]
      if (
        state.owner[next] !== corps.target ||
        state.map.terrain[next] === ConcordatTerrains.Sea ||
        seen.has(next)
      )
        continue
      seen.add(next)

      const mine = ownAround(state, next, corps.owner)
      if (corps.zone && state.map.province[next] !== corps.zone && mine < sim.enclaveNeighbors)
        continue
      tiles.push(next)
      own.push(mine)
    }
  }

  return { tiles, own }
}

// Share of the giant bonus of a territory, 0 to 1
const giantShare = (tiles: number): number => Math.min(1, tiles / front.giantTiles)

// Troops the defenders spend per tile of this kind
const tileCost = (
  state: ConcordatState,
  corps: ConcordatCorps,
  tile: number,
  mine: number
): number => {
  const density = defenseDensity(state, corps.owner, corps.target)
  let cost = density * TERRAIN_DEFENSE[state.map.terrain[tile]]
  cost *=
    (1 + fortressBonus(state, corps.target, tile)) * attackFactor(state, corps.owner, corps.target)
  if (corps.target && state.players[corps.target - 1].capital === tile) cost *= sim.capitalDefense
  if (mine >= sim.enclaveNeighbors) cost *= sim.enclaveFactor

  // A giant defends worse
  if (corps.target) {
    cost *= 1 - (1 - front.giantDefense) * giantShare(state.players[corps.target - 1].tiles)
  }

  return cost
}

// Share of a tile cost the attacker pays
const lossScale = (state: ConcordatState, corps: ConcordatCorps): number => {
  const attacker = state.players[corps.owner - 1]
  const target = corps.target ? state.players[corps.target - 1] : null
  const tribe = CONCORDAT.powers.tribe
  let scale = 1 - (1 - front.giantLoss) * giantShare(attacker.tiles)

  // Wild land and wild tribes are cheap to take, wild tribes are cheap to fight
  if (!target && attacker.kind === ConcordatPowers.Tribe) scale *= tribe.freeLoss
  if (target?.kind === ConcordatPowers.Tribe && attacker.kind !== ConcordatPowers.Tribe) {
    scale *= tribe.hitLoss
  }

  return scale
}

// Tiles between a tile and the aim, straight line
const gapTo = (state: ConcordatState, tile: number, aim: number): number => {
  const { width } = state.map

  return Math.hypot(
    (tile % width) - (aim % width),
    Math.floor(tile / width) - Math.floor(aim / width)
  )
}

// Province the push works on: the one under the aim, else the one the nation holds most of
const focusProvince = (
  state: ConcordatState,
  corps: ConcordatCorps,
  contact: { tiles: number[] }
): number => {
  const { province, provinces } = state.map
  const stride = provinces.length + 1
  const wanted = corps.aim === undefined ? 0 : province[corps.aim]
  let best = 0
  let bestShare = -1

  // Aimed province first when the front touches it
  for (const tile of contact.tiles) {
    const id = province[tile]
    if (!id) continue
    if (id === wanted) return id

    const share = state.provinceCounts[corps.owner * stride + id] / provinces[id - 1].tiles
    if (share > bestShare || (share === bestShare && id < best)) {
      bestShare = share
      best = id
    }
  }

  return best
}

// Contact tiles in the order the front takes them: the focus province whole, holes first, then smooth, noisy, drawn to the aim
const rankContact = (
  state: ConcordatState,
  corps: ConcordatCorps,
  contact: { tiles: number[]; own: number[] }
): number[] => {
  const focus = focusProvince(state, corps, contact)
  const scores = new Float64Array(contact.tiles.length)
  const leads = new Float64Array(contact.tiles.length)
  let nearest = Infinity

  // Distance to the aim, when the push heads somewhere
  if (corps.aim !== undefined) {
    for (let index = 0; index < scores.length; index++) {
      leads[index] = gapTo(state, contact.tiles[index], corps.aim)
      nearest = Math.min(nearest, leads[index])
    }
  }

  // Score of each tile, lowest goes first
  for (let index = 0; index < scores.length; index++) {
    const own = Math.min(contact.own[index], sim.enclaveNeighbors)
    const noise =
      front.noiseBase +
      front.noiseSpread * tileNoise(contact.tiles[index], corps.id * 7919 + state.tick)
    const pull =
      corps.aim === undefined
        ? 0
        : Math.min(front.aimCap, (leads[index] - nearest) * front.aimWeight)
    const isFocus = focus > 0 && state.map.province[contact.tiles[index]] === focus
    scores[index] = noise * (1 - front.holeBonus * own) + pull - (isFocus ? front.provinceFirst : 0)
  }

  return Array.from(scores.keys()).sort(
    (first, second) =>
      scores[first] - scores[second] || contact.tiles[first] - contact.tiles[second]
  )
}

// Capture effects on both nations
const capture = (
  state: ConcordatState,
  corps: ConcordatCorps,
  tile: number,
  cost: number,
  scale: number
): void => {
  const attacker = state.players[corps.owner - 1]
  corps.troops -= cost * sim.attackerLoss * scale * (corps.feint ? CONCORDAT.tech.feintLoss : 1)
  transferTile(state, tile, corps.owner)
  if (!corps.target) return

  // Defender bleeds, calm drops
  const defender = state.players[corps.target - 1]
  defender.troops = Math.max(0, defender.troops - cost * sim.defenderLoss)
  attacker.stability = Math.max(0, attacker.stability - sim.stabilityConquest)
  if (defender.capital === tile) {
    defender.capital = -1
    defender.stability = Math.max(0, defender.stability - sim.stabilityCapital)
    const loot = defender.gold * sim.capitalLootShare
    defender.gold -= loot
    attacker.gold += loot
    emit(state, {
      tick: state.tick,
      kind: 'capitalTaken',
      actor: attacker.id,
      victim: defender.id,
      tile,
    })
  }
}

// One corps for one tick: the whole contact advances, faster the longer it is
const push = (state: ConcordatState, corps: ConcordatCorps): void => {
  const contact = gatherContact(state, corps)
  if (!contact.tiles.length) return disband(state, corps, 0)

  // Budget follows the length of the front
  const density = Math.max(0.01, defenseDensity(state, corps.owner, corps.target))
  const frontage = Math.max(1, Math.min(contact.tiles.length, corps.troops / density))
  const pace = front.driveMin + (front.driveMax - front.driveMin) * (corps.drive ?? 0.5)
  corps.progress += contact.tiles.length * front.speed * pace * TICK_SECONDS * state.speed
  const scale = lossScale(state, corps)

  // Take tiles while budget and troops allow
  let taken = 0
  let blocked = 0
  for (const index of rankContact(state, corps, contact)) {
    if (taken >= sim.maxTilesPerTick || corps.troops < 1) break

    const isEnclave = contact.own[index] >= sim.enclaveNeighbors
    if (!isEnclave && corps.progress < 1) break

    const tile = contact.tiles[index]
    if (state.owner[tile] !== corps.target) continue

    const cost = tileCost(state, corps, tile, contact.own[index])
    const isThin = corps.target > 0 && corps.troops / frontage < cost
    if (isThin || corps.troops < cost * sim.attackerLoss * scale) {
      blocked++
      continue
    }

    capture(state, corps, tile, cost, scale)
    if (!isEnclave) corps.progress -= 1
    taken++
  }

  // A stalled push bleeds
  if (!taken && blocked) {
    corps.progress = Math.min(corps.progress, 1)
    corps.troops -= corps.troops * sim.stallLoss * TICK_SECONDS * state.speed
  }
  if (corps.troops < 1) state.corps = state.corps.filter((other) => other !== corps)
}

/**
 * Combat phase of a tick
 * @param {ConcordatState} state - Game
 * @return {void}
 */

export const runCombat = (state: ConcordatState): void => {
  for (const corps of [...state.corps]) {
    if (!state.corps.includes(corps)) continue
    const target = corps.target ? state.players[corps.target - 1] : null
    if (target && !target.alive) disband(state, corps, 0)
    else push(state, corps)
  }
}
