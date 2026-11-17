import { emit } from '@/core/lib/play/concordat/sim/emit'
import { distanceBetween, startTerritory } from '@/core/lib/play/concordat/map'
import { modeRules, openMode } from '@/core/lib/play/concordat/modes'
import { difficultyOf, placePowers } from '@/core/lib/play/concordat/powers'
import type { ConcordatPowerSpec } from '@/core/lib/play/concordat/powers'
import { seededRng } from '@/core/lib/play/seeded'
import { freshSystems } from '@/core/lib/play/concordat/sim/fresh'
import { nextRandom } from '@/core/lib/play/concordat/sim/rng'
import { transferTile } from '@/core/lib/play/concordat/sim/tiles'
import { CONCORDAT, CONCORDAT_TICKS_PER_SECOND } from '@/declarations/play/concordat/rules'
import type { ConcordatMap, ConcordatPlayerState, ConcordatState } from '@/types/concordat'
import {
  CONCORDAT_WEAPONS,
  ConcordatModes,
  ConcordatPhases,
  ConcordatPowers,
  ConcordatTerrains,
} from '@/utils/constants/concordat'
import type {
  ConcordatDifficultyName,
  ConcordatModeName,
  ConcordatSizeName,
  ConcordatWeaponName,
} from '@/utils/constants/concordat'

/**
 * Game request
 * @typedef {Object} ConcordatGameRequest
 */

export interface ConcordatGameRequest {
  map: ConcordatMap
  // Account ids, null for a bot
  seats: (string | null)[]
  speed: number
  durationMinutes: number
  seed: number
  // Defaults to the configured protection
  protectionSeconds?: number
  // Format, free for all by default
  mode?: ConcordatModeName
  // Weapons allowed, all by default
  weapons?: ConcordatWeaponName[]
  // Teams of a team format
  teams?: number
  // Fill the map with countries and tribes
  populate?: { size: ConcordatSizeName; difficulty: ConcordatDifficultyName }
}

const toTicks = (seconds: number): number => Math.round(seconds * CONCORDAT_TICKS_PER_SECOND)

const newPlayer = (id: number, accountId: string | null, start: number): ConcordatPlayerState => ({
  id,
  accountId,
  alive: true,
  troops: 0,
  gold: 0,
  tiles: 0,
  income: 0,
  provincesHeld: 0,
  stability: 100,
  capital: -1,
  start,
  protectedUntil: 0,
  eliminatedAt: 0,
  front: new Set(),
  kind: ConcordatPowers.Human,
  name: '',
  color: 0,
  capShare: 1,
  growthShare: 1,
  goldShare: 1,
})

// Country or tribe, an AI power with no account
const newPower = (
  id: number,
  spec: ConcordatPowerSpec,
  difficulty: ConcordatDifficultyName
): ConcordatPlayerState => {
  const player = newPlayer(id, null, spec.tile)
  player.kind = spec.kind
  player.name = spec.name
  player.color = spec.color

  if (spec.kind === ConcordatPowers.Tribe) {
    const { tribe } = CONCORDAT.powers
    player.troops = tribe.troops
    player.capShare = tribe.cap
    player.growthShare = tribe.growth
    player.goldShare = tribe.gold

    return player
  }

  // A country grows with the difficulty
  const level = difficultyOf(difficulty)
  player.troops = level.troops
  player.capShare = level.cap
  player.growthShare = level.growth
  player.goldShare = CONCORDAT.powers.country.gold
  player.level = level.level as ConcordatPlayerState['level']

  return player
}

/**
 * Game in its start picking phase
 * @param {ConcordatGameRequest} request - Game request
 * @return {ConcordatState} - Game
 */

export const createGame = (request: ConcordatGameRequest): ConcordatState => {
  const { map, seats } = request
  const crowd = request.populate
    ? placePowers({
        map,
        humans: seats.length,
        size: request.populate.size,
        rng: seededRng(`concordat-powers:${request.seed}`),
      })
    : null
  const total = seats.length + (crowd?.powers.length ?? 0)
  const mode = request.mode ?? ConcordatModes.Free
  const rules = modeRules(mode)
  if (!request.populate && seats.length > map.starts.length)
    throw new Error('Not enough starts on the map')

  const state: ConcordatState = {
    map,
    phase: ConcordatPhases.Picking,
    tick: 0,
    speed: request.speed,
    pickEnd: toTicks(CONCORDAT.pickSeconds),
    endTick: 0,
    weapons: [],
    protectionTicks: toTicks(
      Math.max(
        request.protectionSeconds ?? CONCORDAT.protectionSeconds,
        rules.protectionMinutes * 60
      )
    ),
    rng: request.seed | 0,
    owner: new Uint8Array(map.width * map.height),
    players: [],
    corps: [],
    provinceCounts: new Uint16Array((total + 1) * (map.provinces.length + 1)),
    nextCorpsId: 1,
    events: [],
    changed: [],
    ...freshSystems(total),
  }
  state.mode = mode
  state.weapons = request.weapons ?? [...CONCORDAT_WEAPONS]
  state.temper = request.populate?.difficulty
  state.teamCount = request.teams ?? rules.teams
  // Zero length, no end by time
  state.endTick = request.durationMinutes
    ? state.pickEnd + toTicks(request.durationMinutes * rules.durationFactor * 60)
    : 0

  // Shuffled starts, one per seat
  const starts = crowd ? crowd.humanStarts : [...map.starts]
  for (let index = starts.length - 1; !crowd && index > 0; index--) {
    const swap = Math.floor(nextRandom(state) * (index + 1))
    ;[starts[index], starts[swap]] = [starts[swap], starts[index]]
  }
  seats.forEach((accountId, index) =>
    state.players.push(newPlayer(index + 1, accountId, starts[index]))
  )

  // Countries and tribes after the seats
  crowd?.powers.forEach((spec, index) =>
    state.players.push(newPower(seats.length + index + 1, spec, request.populate!.difficulty))
  )

  return state
}

/**
 * Why a start cannot go there
 * @param {ConcordatState} state - Game
 * @param {number} playerId - Player
 * @param {number} tile - Wanted tile
 * @return {string | null} - Reason, null when fine
 */

export const startRefusal = (
  state: ConcordatState,
  playerId: number,
  tile: number
): string | null => {
  const { map } = state
  if (state.phase !== ConcordatPhases.Picking) return 'notPicking'
  if (!Number.isInteger(tile) || tile < 0 || tile >= map.terrain.length) return 'badTile'

  const kind = map.terrain[tile]
  if (kind === ConcordatTerrains.Sea || kind === ConcordatTerrains.Mountain) return 'badTerrain'
  if (startTerritory(tile, map.terrain, map.width, map.height).length < CONCORDAT.map.start.tiles) {
    return 'tooSmall'
  }
  const crowded = state.players.some(
    (other) =>
      other.id !== playerId &&
      other.kind === ConcordatPowers.Human &&
      distanceBetween(other.start, tile, map.width) < CONCORDAT.map.start.placeGap
  )

  return crowded ? 'tooClose' : null
}

// Tiles of the first land of a power
const startTilesOf = (player: ConcordatPlayerState): number => {
  const { powers } = CONCORDAT
  if (player.kind === ConcordatPowers.Tribe) return powers.tribe.tiles
  if (player.kind === ConcordatPowers.Country) return powers.country.tiles

  return CONCORDAT.map.start.tiles
}

/**
 * Claim every start and open the game
 * @param {ConcordatState} state - Game
 * @return {void}
 */

export const beginPlay = (state: ConcordatState): void => {
  const { map } = state
  state.phase = ConcordatPhases.Playing

  // Claim in a fair random order
  const order = [...state.players]
  for (let index = order.length - 1; index > 0; index--) {
    const swap = Math.floor(nextRandom(state) * (index + 1))
    ;[order[index], order[swap]] = [order[swap], order[index]]
  }
  for (const player of order) {
    const area = startTerritory(
      player.start,
      map.terrain,
      map.width,
      map.height,
      // One zone only, the one under the start tile
      (tile) => !state.owner[tile] && map.province[tile] === map.province[player.start],
      startTilesOf(player)
    )
    for (const tile of area) transferTile(state, tile, player.id)
    player.capital = player.start
    player.gold = CONCORDAT.sim.startGold

    // A seat is shielded for the set time, striking a nation lifts the shield
    if (player.kind === ConcordatPowers.Human) {
      player.troops = CONCORDAT.sim.startTroops
      player.protectedUntil = state.tick + state.protectionTicks
    }
  }
  openMode(state, state.teamCount)
  state.isSystemsDirty = true
  emit(state, { tick: state.tick, kind: 'started', actor: 0, victim: 0, tile: -1 })
}
