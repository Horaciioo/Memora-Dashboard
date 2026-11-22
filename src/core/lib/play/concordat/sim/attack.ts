import { emit } from '@/core/lib/play/concordat/sim/emit'
import { drop } from '@/core/lib/play/concordat/sim/fall'
import { claimPocket, collapseNation } from '@/core/lib/play/concordat/sim/pockets'
import { fortressBonus } from '@/core/lib/play/concordat/buildings/effects'
import { attackFactor } from '@/core/lib/play/concordat/diplomacy/actions'
import { isTraitor } from '@/core/lib/play/concordat/diplomacy/embargo'
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
  drop(state, corps)
}

// Ticks between two turns of a corps, the front work is the heaviest of the game
const COMBAT_STRIDE = 1

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
  mine: number,
  factor: number
): number => {
  const density = defenseDensity(state, corps.owner, corps.target, corps.guard)
  let cost = density * TERRAIN_DEFENSE[state.map.terrain[tile]]
  cost *= (1 + fortressBonus(state, corps.target, tile)) * factor
  if (corps.target && state.players[corps.target - 1].capital === tile) cost *= sim.capitalDefense
  if (mine >= sim.enclaveNeighbors) cost *= sim.enclaveFactor

  // A traitor defends worse for a while
  if (corps.target && isTraitor(state, corps.target)) cost *= CONCORDAT.diplomacy.traitorDefense

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
  // A seat claims free land cheaply so a small start still spreads
  if (!target && attacker.kind === ConcordatPowers.Human) scale *= sim.humanFreeLoss
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
  let farthest = 0

  // Distance to the aim, when the push heads somewhere
  if (corps.aim !== undefined) {
    for (let index = 0; index < scores.length; index++) {
      leads[index] = gapTo(state, contact.tiles[index], corps.aim)
      nearest = Math.min(nearest, leads[index])
      farthest = Math.max(farthest, leads[index])
    }
  }
  const spread = Math.max(1, farthest - nearest)

  // Score of each tile, lowest goes first
  for (let index = 0; index < scores.length; index++) {
    const own = Math.min(contact.own[index], sim.enclaveNeighbors)
    const noise =
      front.noiseBase +
      front.noiseSpread * tileNoise(contact.tiles[index], corps.id * 7919 + state.tick)
    const pull = corps.aim === undefined ? 0 : (front.aimCap * (leads[index] - nearest)) / spread
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
  const bleed = cost * sim.defenderLoss
  const guarded = Math.min(corps.guard ?? 0, bleed)
  corps.guard = (corps.guard ?? 0) - guarded
  defender.troops = Math.max(0, defender.troops - (bleed - guarded))
  attacker.stability = Math.max(0, attacker.stability - sim.stabilityConquest)

  // Spoils of war: a share of the purse per tile and a part of the blood spilled comes back
  const loot = (defender.gold / (defender.tiles + 1)) * sim.plunderGold
  defender.gold -= loot
  attacker.gold += loot
  corps.troops += bleed * sim.plunderTroops
  if (defender.capital === tile) {
    defender.capital = -1
    defender.stability = Math.max(0, defender.stability - sim.stabilityCapital)
    const treasure = defender.gold * sim.capitalLootShare
    defender.gold -= treasure
    attacker.gold += treasure
    emit(state, {
      tick: state.tick,
      kind: 'capitalTaken',
      actor: attacker.id,
      victim: defender.id,
      tile,
    })
  }
  if (defender.alive && defender.tiles < sim.collapseTiles) {
    collapseNation(state, attacker.id, defender.id)
  }
}

// Pockets of the target touching a tile just taken
const claimAround = (state: ConcordatState, corps: ConcordatCorps, tile: number): void => {
  if (!corps.target || !state.players[corps.target - 1].alive) return

  const count = neighborsOf(tile, state.map.width, state.map.height, near)
  for (let slot = 0; slot < count; slot++) {
    const next = near[slot]
    if (state.owner[next] === corps.target) claimPocket(state, corps.owner, corps.target, next)
  }
}

// Tiles the front counts for the pace: a long front gains less than its length, an old game less than a young one, a country catches up
const reach = (state: ConcordatState, corps: ConcordatCorps, length: number): number => {
  const base = Math.max(length, front.minFront)
  const long = front.minFront * (base / front.minFront) ** front.frontPower
  const minutes = (state.tick * TICK_SECONDS * state.speed) / 60
  const age = Math.max(front.slowFloor, 1 / (1 + minutes / front.slowMinutes))
  const boost = state.players[corps.owner - 1].kind === ConcordatPowers.Country ? front.botBoost : 1

  return long * age * boost
}

// One corps for one tick: the whole contact advances, faster the longer it is
const push = (state: ConcordatState, corps: ConcordatCorps): void => {
  // A corps acts every other tick, with the time of both
  const seconds = TICK_SECONDS * state.speed * COMBAT_STRIDE
  const contact = gatherContact(state, corps)
  if (!contact.tiles.length) return disband(state, corps, 0)

  // Budget follows the length of the front
  const density = Math.max(0.01, defenseDensity(state, corps.owner, corps.target, corps.guard))
  const frontage = Math.max(1, Math.min(contact.tiles.length, corps.troops / density))
  const pace = (front.driveMin + (front.driveMax - front.driveMin) * (corps.drive ?? 0.5)) / 1.5
  // Tired corps slow down little by little instead of stopping dead
  const fade = Math.min(1, Math.max(front.fadeFloor, corps.troops / front.fadeTroops))
  const shame = isTraitor(state, corps.owner) ? CONCORDAT.diplomacy.traitorSpeed : 1
  // Like OpenFront: free land goes in bursts, a nation holds the faster the more it outnumbers the push
  let rate = front.freeSpeed
  if (corps.target) {
    const defenders = state.players[corps.target - 1].troops + (corps.guard ?? 0) * sim.guardWeight
    const outnumbered = defenders / Math.max(1, corps.troops)
    const clamped = Math.min(front.ratioMax, Math.max(front.ratioMin, outnumbered))
    const hopeless = Math.min(50, Math.max(1, outnumbered / front.hopeless))
    rate = front.speed / (clamped * hopeless)
  }
  // A clicked spot draws more troops, the front still spreads everywhere
  if (corps.aim !== undefined && state.owner[corps.aim] === corps.owner) corps.aim = undefined
  const lead = corps.aim === undefined ? 1 : 1 + front.aimBoost
  corps.progress +=
    reach(state, corps, contact.tiles.length) * rate * pace * fade * shame * lead * seconds

  // Not enough progress for a tile and no hole to fill: skip the ranking sort
  if (corps.progress < 1 && !contact.own.some((mine) => mine >= sim.enclaveNeighbors)) return

  const scale = lossScale(state, corps)
  const factor = attackFactor(state, corps.owner, corps.target)

  // Take tiles while budget and troops allow
  let taken = 0
  let blocked = 0
  const sealed: number[] = []
  for (const index of rankContact(state, corps, contact)) {
    if (taken >= sim.maxTilesPerTick || corps.troops < 1) break

    const isEnclave = contact.own[index] >= sim.enclaveNeighbors
    if (!isEnclave && corps.progress < 1) break

    const tile = contact.tiles[index]
    if (state.owner[tile] !== corps.target) continue

    const cost = tileCost(state, corps, tile, contact.own[index], factor)
    const isThin = corps.target > 0 && corps.troops / frontage < cost
    if (isThin || corps.troops < cost * sim.attackerLoss * scale) {
      blocked++
      continue
    }

    capture(state, corps, tile, cost, scale)
    if (!isEnclave) corps.progress -= 1
    taken++
    if (corps.target && taken <= sim.pocketChecks) sealed.push(tile)
  }

  // Land walled in by the tiles just taken falls with them
  for (const tile of sealed) claimAround(state, corps, tile)

  // A stalled push bleeds
  if (!taken && blocked) {
    corps.progress = Math.min(corps.progress, 1)
    corps.troops -= corps.troops * sim.stallLoss * seconds
  }
  if (corps.troops < 1) drop(state, corps)
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
    else if ((state.tick + corps.id) % COMBAT_STRIDE === 0) push(state, corps)
  }
}
