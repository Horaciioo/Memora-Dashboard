import {
  placeBuilding,
  placeRefusal,
  upgradeBuilding,
  upgradeRefusal,
} from '@/core/lib/play/concordat/buildings'
import {
  answerOffer,
  answerRefusal,
  breakRefusal,
  breakTie,
  aidRefusal,
  giftRefusal,
  noteAttack,
  propose,
  proposeRefusal,
  sendAid,
  sendGift,
} from '@/core/lib/play/concordat/diplomacy'
import { tieKindOf } from '@/core/lib/play/concordat/diplomacy/ties'
import { neighborsOf, NEIGHBOR_SLOTS } from '@/core/lib/play/concordat/map'
import { startRefusal } from '@/core/lib/play/concordat/sim/create'
import {
  buildShip,
  buildShipRefusal,
  moveShip,
  moveShipRefusal,
  sail,
  sailRefusal,
} from '@/core/lib/play/concordat/navy'
import { areTeamMates } from '@/core/lib/play/concordat/modes/rules'
import { disband } from '@/core/lib/play/concordat/sim/attack'
import { researchRefusal, sendFeint, startResearch } from '@/core/lib/play/concordat/tech'
import { launchSortie, sortieRefusal } from '@/core/lib/play/concordat/air'
import { launchRefusal, launchStrike } from '@/core/lib/play/concordat/weapons'
import { isTileBlocked } from '@/core/lib/play/concordat/zones'
import { closeTrade } from '@/core/lib/play/concordat/trade'
import { CONCORDAT } from '@/declarations/play/concordat/rules'
import type { ConcordatIntent, ConcordatState } from '@/types/concordat'
import { ConcordatPhases, ConcordatTerrains, ConcordatTies } from '@/utils/constants/concordat'

const { sim } = CONCORDAT
const near = new Int32Array(NEIGHBOR_SLOTS)

// Own border touches the target
const touches = (state: ConcordatState, playerId: number, target: number): boolean => {
  const { width, height, terrain } = state.map

  for (const edge of state.players[playerId - 1].front) {
    const count = neighborsOf(edge, width, height, near)
    for (let slot = 0; slot < count; slot++) {
      const next = near[slot]
      if (state.owner[next] === target && terrain[next] !== ConcordatTerrains.Sea) return true
    }
  }

  return false
}

// A zone is a neighbour when land of the target in it touches the own border
const zoneTouches = (
  state: ConcordatState,
  playerId: number,
  target: number,
  zone: number
): boolean => {
  const { width, height, terrain, province } = state.map

  for (const edge of state.players[playerId - 1].front) {
    const count = neighborsOf(edge, width, height, near)
    for (let slot = 0; slot < count; slot++) {
      const next = near[slot]
      if (
        province[next] === zone &&
        state.owner[next] === target &&
        terrain[next] !== ConcordatTerrains.Sea
      )
        return true
    }
  }

  return false
}

// Reason an engagement is refused
const engageRefusal = (
  state: ConcordatState,
  intent: Extract<ConcordatIntent, { kind: 'engage' }>
): string | null => {
  const me = state.players[intent.playerId - 1]
  const target = intent.target ? state.players[intent.target - 1] : null

  if (!Number.isInteger(intent.percent) || intent.percent < 1 || intent.percent > 100)
    return 'badPercent'
  if (intent.tile !== undefined && (intent.tile < 0 || intent.tile >= state.owner.length))
    return 'badTile'
  if (intent.target === intent.playerId) return 'self'
  if (intent.target && (!target || !target.alive)) return 'badTarget'
  if (target && (state.tick < me.protectedUntil || state.tick < target.protectedUntil))
    return 'protected'
  if (target && areTeamMates(state, me.id, target.id)) return 'teamMate'
  if (target && tieKindOf(state, me.id, target.id) === ConcordatTies.Peace) return 'treaty'
  if (Math.floor((me.troops * intent.percent) / 100) < sim.minEngage) return 'tooFew'
  if (!touches(state, intent.playerId, intent.target)) return 'noContact'

  // Only a neighbouring zone, a far one is reached by sea
  const zone = intent.tile === undefined ? 0 : state.map.province[intent.tile]
  if (zone && !zoneTouches(state, intent.playerId, intent.target, zone)) return 'farZone'

  const existing = state.corps.some(
    (corps) => corps.owner === me.id && corps.target === intent.target && !corps.feint
  )

  return !existing && state.corps.filter((corps) => corps.owner === me.id).length >= sim.maxCorps
    ? 'tooManyCorps'
    : null
}

// A feint is an engagement for a nation that learnt it
const feintRefusal = (
  state: ConcordatState,
  intent: Extract<ConcordatIntent, { kind: 'feint' }>
): string | null => {
  if (!state.effects[intent.playerId - 1].canFeint) return 'noFeint'
  if (!intent.target) return 'badTarget'
  if (state.corps.filter((corps) => corps.owner === intent.playerId).length >= sim.maxCorps)
    return 'tooManyCorps'

  return engageRefusal(state, { ...intent, kind: 'engage' })
}

// Send troops out
const engage = (
  state: ConcordatState,
  intent: Extract<ConcordatIntent, { kind: 'engage' }>
): void => {
  const me = state.players[intent.playerId - 1]
  const drive = Math.min(1, Math.max(0, intent.percent / 100))
  const amount = Math.floor(me.troops * drive)
  me.troops -= amount
  noteAttack(state, me.id, intent.target)

  // Reinforce the corps already pushing
  const corps = state.corps.find(
    (other) => other.owner === me.id && other.target === intent.target && !other.feint
  )
  const aim = !intent.target && intent.tile !== undefined ? intent.tile : undefined
  const zone = intent.tile === undefined ? 0 : state.map.province[intent.tile] || undefined
  if (corps) {
    corps.drive =
      ((corps.drive ?? drive) * corps.troops + drive * amount) / (corps.troops + amount || 1)
    corps.troops += amount
    if (aim !== undefined) corps.aim = aim
    if (zone) corps.zone = zone
  } else {
    state.corps.push({
      id: state.nextCorpsId++,
      owner: me.id,
      target: intent.target,
      troops: amount,
      progress: 0,
      drive,
      aim,
      zone,
    })
  }
}

// Buildings, navy, diplomacy and trade
const systemRefusal = (state: ConcordatState, intent: ConcordatIntent): string | null => {
  switch (intent.kind) {
    case 'build':
      return placeRefusal(state, intent.playerId, intent.building, intent.tile)
    case 'upgrade':
      return upgradeRefusal(state, intent.playerId, intent.id)
    case 'buildShip':
      return buildShipRefusal(state, intent)
    case 'moveShip':
      return isTileBlocked(state, intent.tile, 'blocksSea')
        ? 'storm'
        : moveShipRefusal(state, intent)
    case 'sail':
      return isTileBlocked(state, intent.tile, 'blocksSea') ? 'storm' : sailRefusal(state, intent)
    case 'research':
      return researchRefusal(state, intent.playerId, intent.path)
    case 'launch':
      return launchRefusal(state, intent)
    case 'sortie':
      return sortieRefusal(state, intent)
    case 'propose':
      return proposeRefusal(state, intent)
    case 'accept':
    case 'refuse':
      return answerRefusal(state, intent.playerId, intent.offer)
    case 'break':
      return breakRefusal(state, intent.playerId, intent.with)
    case 'gift':
      return giftRefusal(state, intent)
    case 'aid':
      return aidRefusal(state, intent)
    case 'closeTrade':
      return null
    default:
      return 'unknown'
  }
}

// Apply a system command, already checked
const applySystem = (state: ConcordatState, intent: ConcordatIntent): void => {
  switch (intent.kind) {
    case 'build':
      return placeBuilding(state, intent.playerId, intent.building, intent.tile)
    case 'upgrade':
      return upgradeBuilding(state, intent.playerId, intent.id)
    case 'buildShip':
      return buildShip(state, intent)
    case 'moveShip':
      return moveShip(state, intent)
    case 'sail':
      return sail(state, intent)
    case 'propose':
      return propose(state, intent)
    case 'accept':
      return answerOffer(state, intent.offer, true)
    case 'refuse':
      return answerOffer(state, intent.offer, false)
    case 'break':
      return breakTie(state, intent.playerId, intent.with)
    case 'gift':
      return sendGift(state, intent)
    case 'aid':
      return sendAid(state, intent)
    case 'research':
      return startResearch(state, intent.playerId, intent.path)
    case 'launch':
      return launchStrike(state, intent)
    case 'sortie':
      return launchSortie(state, intent)
    case 'closeTrade':
      closeTrade(state, intent.playerId, intent.with)
  }
}

/**
 * Why a command is refused, null when it holds
 * @param {ConcordatState} state - Game
 * @param {ConcordatIntent} intent - Command
 * @return {string | null} - Reason
 */

export const intentRefusal = (state: ConcordatState, intent: ConcordatIntent): string | null => {
  const me = state.players[intent.playerId - 1]
  if (!me || !me.alive) return 'notInGame'
  if (state.phase === ConcordatPhases.Ended) return 'ended'
  if (intent.kind === 'placeStart') return startRefusal(state, intent.playerId, intent.tile)
  if (state.phase !== ConcordatPhases.Playing) return 'notPlaying'
  if (intent.kind === 'engage') return engageRefusal(state, intent)
  if (intent.kind === 'feint') return feintRefusal(state, intent)
  if (intent.kind === 'retreat') {
    return state.corps.some((corps) => corps.owner === me.id && corps.target === intent.target)
      ? null
      : 'noCorps'
  }

  return systemRefusal(state, intent)
}

/**
 * Apply a command, refused ones change nothing
 * @param {ConcordatState} state - Game
 * @param {ConcordatIntent} intent - Command
 * @return {string | null} - Refusal reason
 */

export const applyIntent = (state: ConcordatState, intent: ConcordatIntent): string | null => {
  const refusal = intentRefusal(state, intent)
  if (refusal) return refusal

  // One handler per kind
  if (intent.kind === 'placeStart') state.players[intent.playerId - 1].start = intent.tile
  else if (intent.kind === 'engage') engage(state, intent)
  else if (intent.kind === 'feint') sendFeint(state, intent.playerId, intent.target, intent.percent)
  else if (intent.kind !== 'retreat') applySystem(state, intent)
  else {
    const corps = state.corps.find(
      (other) => other.owner === intent.playerId && other.target === intent.target
    )
    if (corps) disband(state, corps, sim.retreatLoss)
  }

  return null
}
