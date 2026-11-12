import type { ChaosSeat, LudoGhost, LudoLine } from '@/core/lib/play/ludo/effects'
import type { LudoPlan } from '@/core/lib/play/ludo/rules'
import { isOnTrack, squareOf } from '@/core/lib/play/ludo/track'
import { LUDO_CHAOS } from '@/declarations/play/ludo/chaos'

type Role = 'real' | 'decoy'

/**
 * Tag of a line about a phantom pawn
 * @param {Role} role - Real or decoy
 * @param {LudoGhost} ghost - Phantom
 * @return {string} - Tag
 */

export const ghostTag = (role: Role, ghost: LudoGhost): string =>
  `ghost:${role}:${ghost.swap}:${ghost.pawn}`

/**
 * Role and pawn read back from a tag
 * @param {string | null | undefined} tag - Line tag
 * @return {Object | null} - Role, swap and real pawn
 */

export const readGhostTag = (tag: string | null | undefined) => {
  const [head, role, swap, pawn] = (tag ?? '').split(':')
  if (head !== 'ghost') return null

  return { role: role as Role, swap: Number(swap) as 0 | 1, pawn: Number(pawn) }
}

/**
 * Line making the decoy vanish
 * @param {string} accountId - Owner
 * @param {LudoGhost} ghost - Phantom
 * @param {number} count - Pawns per colour
 * @return {LudoLine} - Line
 */

export const fadeLine = (accountId: string, ghost: LudoGhost, count: number): LudoLine => ({
  kind: 'FADE',
  accountId,
  pawn: count,
  from: ghost.step,
  effect: ghostTag('decoy', ghost),
})

/**
 * Pair born where a pawn stands, one of the two jumps ahead
 * @param {Object} input - Pawn
 * @param {ChaosSeat[]} input.seats - Board
 * @param {string} input.moverId - Owner
 * @param {number} input.pawn - Pawn index
 * @param {() => number} input.random - Random source
 * @return {Object} - Phantom and its split line
 */

export const spawnGhost = ({
  seats,
  moverId,
  pawn,
  random,
}: {
  seats: ChaosSeat[]
  moverId: string
  pawn: number
  random: () => number
}) => {
  const mover = seats.find((seat) => seat.accountId === moverId)!
  const count = mover.pawns.length
  const step = mover.pawns[pawn]
  const swap = (random() < 0.5 ? 0 : 1) as 0 | 1
  const gaps = Array.from({ length: LUDO_CHAOS.ghostGap }, (_, index) => index + 1).filter((gap) =>
    isOnTrack(step + gap)
  )

  // The real pawn only jumps onto a free square
  const taken = (landing: number) =>
    mover.pawns.some((other, index) => index !== pawn && other === landing) ||
    seats.some(
      (seat) =>
        seat.accountId !== moverId &&
        seat.pawns.some(
          (other) =>
            isOnTrack(other) && squareOf(seat.corner, other) === squareOf(mover.corner, landing)
        )
    )
  const free = gaps.filter((gap) => !taken(step + gap))
  const isReal = random() < 0.5 && free.length > 0
  const pool = isReal ? free : gaps
  const gap = pool.length ? pool[Math.floor(random() * pool.length)] : 0
  const ghost: LudoGhost = {
    pawn,
    step: isReal ? step : step + gap,
    swap,
    turns: LUDO_CHAOS.ghostTurns,
  }
  const line: LudoLine = {
    kind: 'SPLIT',
    accountId: moverId,
    pawn: isReal ? pawn : count,
    from: step,
    to: step + gap,
    effect: ghostTag(isReal ? 'real' : 'decoy', ghost),
  }

  return { ghost, line, real: isReal ? step + gap : step }
}

/**
 * Decoy walking beside the real pawn
 * @param {Object} input - Move
 * @param {LudoGhost} input.ghost - Phantom
 * @param {LudoPlan} input.plan - Real move
 * @param {number} input.dice - Die face
 * @param {string} input.accountId - Owner
 * @param {number} input.count - Pawns per colour
 * @return {Object} - Lines around the real move, phantom left
 */

export const followGhost = ({
  ghost,
  plan,
  dice,
  accountId,
  count,
}: {
  ghost: LudoGhost
  plan: LudoPlan
  dice: number
  accountId: string
  count: number
}) => {
  const decoyTo = ghost.step + dice
  const isGone = !isOnTrack(plan.to) || !isOnTrack(decoyTo)
  const walk: LudoLine = {
    kind: 'MOVE',
    accountId,
    pawn: count,
    from: ghost.step,
    to: decoyTo,
    dice,
    effect: ghostTag('decoy', ghost),
  }
  const next = { ...ghost, step: decoyTo }
  // Real one goes first on a coin toss, so the order tells nothing
  const lines = isGone ? [] : [walk]

  return {
    lines,
    isFirst: ghost.swap === 1,
    fade: isGone ? fadeLine(accountId, ghost, count) : null,
    ghost: isGone ? undefined : next,
  }
}

/**
 * Phantoms touched by a move: followed, eaten or dispelled
 * @param {Object} input - Move
 * @param {T[]} input.seats - Board after the move
 * @param {string} input.moverId - Player moving
 * @param {LudoPlan} input.plan - Move
 * @param {number} input.dice - Die face
 * @param {number} input.count - Pawns per colour
 * @return {Object} - Board, tags and lines around the move
 */

export const ghostsAfter = <T extends ChaosSeat>({
  seats,
  moverId,
  plan,
  dice,
  count,
}: {
  seats: T[]
  moverId: string
  plan: LudoPlan
  dice: number
  count: number
}) => {
  const fades: LudoLine[] = []
  const eaten = new Map<string, string>()
  let moveTag: string | undefined
  let walk: LudoLine | null = null
  let isFirst = false
  const clear = (list: T[], accountId: string) =>
    list.map((seat) =>
      seat.accountId === accountId
        ? { ...seat, effects: { ...seat.effects, ghost: undefined } }
        : seat
    )
  let next = seats

  // The decoy walks beside its pawn
  const own = seats.find((seat) => seat.accountId === moverId)?.effects.ghost
  if (own && own.pawn === plan.pawn) {
    const follow = followGhost({ ghost: own, plan, dice, accountId: moverId, count })
    moveTag = ghostTag('real', own)
    walk = follow.lines[0] ?? null
    isFirst = follow.isFirst
    if (follow.fade) fades.push(follow.fade)
    next = next.map((seat) =>
      seat.accountId === moverId
        ? { ...seat, effects: { ...seat.effects, ghost: follow.ghost } }
        : seat
    )
  }

  // A phantom's real pawn eaten takes the decoy with it
  for (const taken of plan.captures) {
    const ghost = next.find((seat) => seat.accountId === taken.accountId)?.effects.ghost
    if (!ghost || ghost.pawn !== taken.pawn) continue
    eaten.set(`${taken.accountId}:${taken.pawn}`, ghostTag('real', ghost))
    fades.push(fadeLine(taken.accountId, ghost, count))
    next = clear(next, taken.accountId)
  }

  // Landing on a decoy dispels it
  const mover = next.find((seat) => seat.accountId === moverId)!
  for (const seat of next) {
    const ghost = seat.effects.ghost
    const isHit =
      ghost &&
      seat.accountId !== moverId &&
      isOnTrack(plan.to) &&
      squareOf(seat.corner, ghost.step) === squareOf(mover.corner, plan.to)
    if (!isHit) continue
    fades.push(fadeLine(seat.accountId, ghost, count))
    next = clear(next, seat.accountId)
  }

  return { seats: next, moveTag, walk, isFirst, eaten, fades }
}
