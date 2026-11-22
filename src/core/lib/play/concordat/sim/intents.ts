import {
  placeBuilding,
  placeRefusal,
  placeTileOf,
  upgradeBuilding,
  upgradeRefusal,
} from '@/core/lib/play/concordat/buildings'
import {
  answerOffer,
  answerRefusal,
  breakRefusal,
  breakTie,
  embargoRefusal,
  emojiRefusal,
  markTarget,
  sendEmoji,
  targetRefusal,
  layEmbargo,
  liftEmbargo,
  aidRefusal,
  giftRefusal,
  noteAttack,
  propose,
  proposeRefusal,
  sendAid,
  sendGift,
} from '@/core/lib/play/concordat/diplomacy'
import { landmassesOf, neighborsOf, NEIGHBOR_SLOTS } from '@/core/lib/play/concordat/map'
import { startRefusal } from '@/core/lib/play/concordat/sim/create'
import {
  buildShip,
  buildShipRefusal,
  moveShip,
  moveShipRefusal,
  aimTileOf,
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
import { ConcordatPhases, ConcordatTerrains } from '@/utils/constants/concordat'

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

// The clicked tile lies on a landmass none of my border touches, only a boat gets there
const isOverseas = (state: ConcordatState, playerId: number, tile: number): boolean => {
  const lands = landmassesOf(state.map)
  for (const edge of state.players[playerId - 1].front)
    if (lands[edge] === lands[tile]) return false

  return true
}

// The push crosses the water: no border with the target, or a tile named on another landmass
const isByWater = (
  state: ConcordatState,
  intent: Extract<ConcordatIntent, { kind: 'engage' }>
): boolean =>
  !touches(state, intent.playerId, intent.target) ||
  (intent.tile !== undefined && isOverseas(state, intent.playerId, intent.tile))

// Landing order of a push over the water, aimed at the tile named or at the nation
const landingMove = (
  state: ConcordatState,
  intent: Extract<ConcordatIntent, { kind: 'engage' }>
): Extract<ConcordatIntent, { kind: 'sail' }> => ({
  kind: 'sail',
  playerId: intent.playerId,
  tile: intent.tile ?? aimTileOf(state, intent.playerId, intent.target),
  percent: intent.percent,
})

// Reason a landing is refused
const landingRefusal = (
  state: ConcordatState,
  intent: Extract<ConcordatIntent, { kind: 'engage' }>
): string | null => {
  const move = landingMove(state, intent)
  if (move.tile < 0) return 'noContact'

  return isTileBlocked(state, move.tile, 'blocksSea') ? 'storm' : sailRefusal(state, move)
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
  if (target && state.tick < target.protectedUntil) return 'protected'
  if (target && areTeamMates(state, me.id, target.id)) return 'teamMate'
  if (Math.floor((me.troops * intent.percent) / 100) < sim.minEngage) return 'tooFew'
  if (isByWater(state, intent)) {
    // Same landmass but no common border: nothing to sail, say so
    const aim = intent.tile ?? (intent.target ? aimTileOf(state, intent.playerId, intent.target) : -1)
    const reachable = aim >= 0 && !isOverseas(state, intent.playerId, aim)
    return intent.target && reachable && !touches(state, me.id, intent.target)
      ? 'noContact'
      : landingRefusal(state, intent)
  }

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
  if (!touches(state, intent.playerId, intent.target)) return 'noContact'
  if (state.corps.filter((corps) => corps.owner === intent.playerId).length >= sim.maxCorps)
    return 'tooManyCorps'

  return engageRefusal(state, { ...intent, kind: 'engage' })
}

// Reason a defence is refused
const defendRefusal = (
  state: ConcordatState,
  intent: Extract<ConcordatIntent, { kind: 'defend' }>
): string | null => {
  const me = state.players[intent.playerId - 1]
  if (!Number.isInteger(intent.percent) || intent.percent < 1 || intent.percent > 100)
    return 'badPercent'
  if (!state.corps.some((corps) => corps.owner === intent.target && corps.target === me.id))
    return 'noAttack'

  return Math.floor((me.troops * intent.percent) / 100) < 1 ? 'tooFew' : null
}

// Put a share of the reserve against the pushes of one attacker, split by their troops
const defend = (
  state: ConcordatState,
  intent: Extract<ConcordatIntent, { kind: 'defend' }>
): void => {
  const me = state.players[intent.playerId - 1]
  const pushes = state.corps.filter(
    (corps) => corps.owner === intent.target && corps.target === me.id
  )
  const amount = Math.floor((me.troops * intent.percent) / 100)
  const total = pushes.reduce((sum, corps) => sum + corps.troops, 0) || 1
  me.troops -= amount
  for (const corps of pushes) corps.guard = (corps.guard ?? 0) + (amount * corps.troops) / total
}

// Send troops out
const engage = (
  state: ConcordatState,
  intent: Extract<ConcordatIntent, { kind: 'engage' }>
): void => {
  const me = state.players[intent.playerId - 1]
  const drive = Math.min(1, Math.max(0, intent.percent / 100))
  let amount = Math.floor(me.troops * drive)
  me.troops -= amount
  noteAttack(state, me.id, intent.target)

  // Two pushes head on cancel each other troop for troop, the bigger one carries on
  const opposing = intent.target
    ? state.corps.find(
        (other) => other.owner === intent.target && other.target === me.id && !other.feint
      )
    : undefined
  if (opposing) {
    const clash = Math.min(amount, opposing.troops)
    amount -= clash
    opposing.troops -= clash
    if (opposing.troops < 1) disband(state, opposing, 0)
    if (amount < 1) return
  }

  // Reinforce the corps already pushing
  const corps = state.corps.find(
    (other) => other.owner === me.id && other.target === intent.target && !other.feint
  )
  if (corps) {
    corps.drive =
      ((corps.drive ?? drive) * corps.troops + drive * amount) / (corps.troops + amount || 1)
    corps.troops += amount
    corps.aim = intent.tile ?? corps.aim
    corps.zone = undefined
  } else {
    state.corps.push({
      id: state.nextCorpsId++,
      owner: me.id,
      target: intent.target,
      troops: amount,
      progress: 0,
      drive,
      aim: intent.tile,
    })
  }
}

// Buildings, navy, diplomacy and trade
const systemRefusal = (state: ConcordatState, intent: ConcordatIntent): string | null => {
  switch (intent.kind) {
    case 'build':
      return placeRefusal(state, intent.playerId, intent.building, placeTileOf(state, intent))
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
    case 'embargo':
      return embargoRefusal(state, intent.playerId, intent.with)
    case 'target':
      return targetRefusal(state, intent)
    case 'emoji':
      return emojiRefusal(state, intent)
    default:
      return 'unknown'
  }
}

// Apply a system command, already checked
const applySystem = (state: ConcordatState, intent: ConcordatIntent): void => {
  switch (intent.kind) {
    case 'build':
      return placeBuilding(state, intent.playerId, intent.building, placeTileOf(state, intent))
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
      break
    case 'embargo':
      if (intent.on) layEmbargo(state, intent.playerId, intent.with, 0)
      else liftEmbargo(state, intent.playerId, intent.with)
      break
    case 'target':
      return markTarget(state, intent)
    case 'emoji':
      return sendEmoji(state, intent)
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
  if (intent.kind === 'defend') return defendRefusal(state, intent)
  if (intent.kind === 'retreat') {
    return state.corps.some((corps) => corps.owner === me.id && corps.target === intent.target)
      ? null
      : 'noCorps'
  }

  return systemRefusal(state, intent)
}

// A push with no way by land crosses the water instead, from the nearest own coast
const landing = (state: ConcordatState, intent: ConcordatIntent): string | null => {
  if (intent.kind !== 'engage') return 'noContact'

  const move = landingMove(state, intent)
  const refusal = landingRefusal(state, intent)
  if (refusal) return refusal
  applySystem(state, move)

  return null
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
  if (intent.kind === 'engage' && isByWater(state, intent)) {
    return landing(state, intent)
  }

  // One handler per kind
  if (intent.kind === 'placeStart') state.players[intent.playerId - 1].start = intent.tile
  else if (intent.kind === 'engage') engage(state, intent)
  else if (intent.kind === 'feint') sendFeint(state, intent.playerId, intent.target, intent.percent)
  else if (intent.kind === 'defend') defend(state, intent)
  else if (intent.kind !== 'retreat') applySystem(state, intent)
  else {
    const corps = state.corps.find(
      (other) => other.owner === intent.playerId && other.target === intent.target
    )
    if (corps) disband(state, corps, corps.target ? sim.retreatLoss : 0)
  }

  return null
}
