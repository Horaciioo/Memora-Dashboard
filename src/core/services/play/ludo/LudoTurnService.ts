import 'server-only'

import { Prisma } from '@prisma/client'

import { prisma } from '@/core/lib/db'
import { conflict } from '@/core/lib/errors'
import { after, countdownEnd } from '@/core/lib/play/clock'
import {
  applyMalus,
  autoMove,
  duelRecoil,
  faceOf,
  otherFaceOf,
  ghostsAfter,
  isBoardOver,
  isOnlyChoice,
  landOnSquare,
  legalMoves,
  ludoSettingsOf,
  nextTurn,
  pendingOf,
  rollDie,
  seatsAfter,
  standingScore,
  tickEffects,
  YARD_STEP,
} from '@/core/lib/play/ludo'
import type { LudoLine, LudoPending, LudoPlan } from '@/core/lib/play/ludo'
import { readBodyInteger } from '@/core/lib/play/parse'
import { IDLE_STEP } from '@/core/engines/play/steps'
import {
  boardOf,
  clockAfter,
  racing,
  saveSeats,
  storedPending,
  withTable,
  writeLines,
} from '@/core/services/play/ludo/LudoTable'
import type { LudoRow, LudoTable } from '@/core/services/play/ludo/LudoTable'
import { LUDO_SEATING } from '@/declarations/play/ludo/board'
import { LUDO_CHAOS } from '@/declarations/play/ludo/chaos'
import { LUDO_SETTINGS } from '@/declarations/play/ludo/settings'
import { PLAY_ERRORS } from '@/declarations/play/copy'
import type { EngineSession, EngineStep } from '@/types/play'

type JokerOffer = Extract<LudoPending, { type: 'joker' }>

/**
 * Deal the colours, the first one to roll
 * @param {EngineSession} session - Game
 * @return {Promise<EngineStep>} - Step
 */

export const openBoard = async (session: EngineSession): Promise<EngineStep> => {
  const settings = ludoSettingsOf(session.settings)
  const order = session.players.toSorted(() => Math.random() - 0.5)
  const corners = LUDO_SEATING[order.length] ?? LUDO_SEATING[LUDO_SETTINGS.maxPlayers]
  const startsAt = countdownEnd(new Date(), LUDO_SETTINGS.countdownSeconds)
  const turnEndsAt = after(startsAt, settings.turnSeconds)

  await prisma.$transaction([
    prisma.ludoPlayer.createMany({
      data: order.map((accountId, index) => ({
        sessionId: session.id,
        accountId,
        corner: corners[index],
        pawns: Array.from({ length: settings.pawns }, () => YARD_STEP),
        joker: settings.rules.chaos ? LUDO_CHAOS.jokers : 0,
      })),
    }),
    prisma.ludoGame.create({
      data: { sessionId: session.id, turnId: order[0], startsAt, turnEndsAt },
    }),
  ])

  return { changed: true, finished: false, deadline: turnEndsAt }
}

/**
 * Game over for the ending picked
 * @param {LudoTable} table - Locked board
 * @param {LudoRow[]} seats - Seats afterwards
 * @return {boolean} - Over
 */

const isOver = ({ session, settings }: LudoTable, seats: LudoRow[]): boolean =>
  isBoardOver({ seats, players: session.players, ending: settings.ending })

/**
 * Places and scores written on the seats
 * @param {LudoTable} table - Locked board
 * @param {LudoRow[]} seats - Seats afterwards
 * @return {Promise<EngineStep>} - Finished step
 */

const closeBoard = async (table: LudoTable, seats: LudoRow[]) => {
  await saveSeats(table, seats)
  for (const seat of seats) {
    await table.tx.playSeat.update({
      where: {
        sessionId_accountId: { sessionId: table.session.id, accountId: seat.accountId },
      },
      data: { score: standingScore(seat, LUDO_SETTINGS.maxPlayers) },
    })
  }

  return { changed: true, finished: true, deadline: null }
}

/**
 * Seats with the changed ones swapped in
 * @param {LudoRow[]} all - Every seat
 * @param {LudoRow[]} changed - Seats changed
 * @return {LudoRow[]} - Seats afterwards
 */

const merged = (all: LudoRow[], changed: LudoRow[]): LudoRow[] =>
  all.map((seat) => changed.find((entry) => entry.id === seat.id) ?? seat)

/**
 * Next colour in line, those who lost a turn to a stall skipped
 * @param {Object} input - Turn change
 * @param {LudoRow[]} input.active - Colours racing
 * @param {LudoRow[]} input.seats - Every seat
 * @param {LudoRow | undefined} input.current - Colour that played
 * @param {string} input.fallback - Player kept when nobody else races
 * @return {Object} - Next player, seats and stall lines
 */

const upcomingOf = ({
  active,
  seats,
  current,
  fallback,
}: {
  active: LudoRow[]
  seats: LudoRow[]
  current: LudoRow | undefined
  fallback: string
}) => {
  const lines: LudoLine[] = []
  let working = seats
  let nextId = nextTurn(active, current?.corner ?? -1) ?? fallback

  // A stalled colour misses its turn once
  for (let guard = 0; guard < active.length; guard += 1) {
    const upcoming = working.find((seat) => seat.accountId === nextId)
    if (!upcoming?.effects.skip) break
    lines.push({ kind: 'STALL', accountId: nextId })
    working = working.map((seat) =>
      seat.id === upcoming.id ? { ...seat, effects: { ...seat.effects, skip: undefined } } : seat
    )
    nextId = nextTurn(active, upcoming.corner) ?? fallback
  }

  return { nextId, seats: working, lines }
}

/**
 * Hand the die on, or back to the same player
 * @param {Object} input - Turn change
 * @param {LudoTable} input.table - Locked board
 * @param {LudoRow[]} input.seats - Seats afterwards
 * @param {number} input.rev - Last revision
 * @param {boolean} input.isBonus - Same player again
 * @param {number} input.sixes - Sixes in a row kept
 * @param {number} [input.steps] - Squares walked
 * @param {number} [input.extraMs] - Beats of effects
 * @return {Promise<EngineStep>} - Step
 */

const passTurn = async ({
  table,
  seats,
  rev,
  isBonus,
  sixes,
  steps = 0,
  extraMs = 0,
}: {
  table: LudoTable
  seats: LudoRow[]
  rev: number
  isBonus: boolean
  sixes: number
  steps?: number
  extraMs?: number
}): Promise<EngineStep> => {
  if (isOver(table, seats)) return closeBoard(table, seats)

  // Bonus only for a player still racing
  const active = racing(table, seats)
  const { turnId } = table.table
  const current = seats.find((seat) => seat.accountId === turnId)
  const keeps = isBonus && active.some((seat) => seat.accountId === turnId)
  let working = seats
  let lines: LudoLine[] = []
  let nextId = turnId

  // Timed effects of the player done, stalled colours skipped
  if (!keeps) {
    if (current && table.settings.rules.chaos) {
      const ticked = tickEffects(current, table.settings.pawns)
      lines = ticked.lines
      working = working.map((seat) =>
        seat.id === current.id ? { ...seat, effects: ticked.effects } : seat
      )
    }
    const upcoming = upcomingOf({ active, seats: working, current, fallback: turnId })
    nextId = upcoming.nextId
    working = upcoming.seats
    lines = [...lines, ...upcoming.lines]
  }

  // Everything written, then the clock
  const last = await writeLines(table, lines, rev)
  await saveSeats(table, working)
  const stalls = lines.filter((line) => line.kind === 'STALL').length
  const turnEndsAt = clockAfter(table, steps, extraMs + stalls * LUDO_CHAOS.effectMs)
  await table.tx.ludoGame.update({
    where: { sessionId: table.session.id },
    data: {
      turnId: nextId,
      dice: null,
      sixes: keeps ? sixes : 0,
      rev: last,
      turnEndsAt,
      pending: Prisma.DbNull,
    },
  })

  return { changed: true, finished: false, deadline: turnEndsAt }
}

/**
 * Lines of a move, in the order the screen plays them
 * @param {LudoTable} table - Locked board
 * @param {Object} move - Move
 * @param {LudoPlan} move.plan - Plan
 * @param {number} move.dice - Die face
 * @param {number | null} move.place - Place just won
 * @param {ReturnType<typeof ghostsAfter>} move.ghosts - Phantoms touched
 * @return {LudoLine[]} - Lines
 */

const linesOf = (
  { table }: LudoTable,
  {
    plan,
    dice,
    place,
    ghosts,
  }: { plan: LudoPlan; dice: number; place: number | null; ghosts: ReturnType<typeof ghostsAfter> }
): LudoLine[] => {
  const accountId = table.turnId
  const { pawn, from, to } = plan
  const move: LudoLine = { kind: 'MOVE', accountId, dice, pawn, from, to, effect: ghosts.moveTag }
  const { walk } = ghosts

  return [
    ...(walk && ghosts.isFirst ? [walk] : []),
    move,
    ...(walk && !ghosts.isFirst ? [walk] : []),
    ...plan.captures.map((taken) => ({
      kind: 'CAPTURE' as const,
      accountId,
      pawn: taken.pawn,
      from: taken.from,
      victimId: taken.accountId,
      effect: ghosts.eaten.get(`${taken.accountId}:${taken.pawn}`),
    })),
    ...(plan.isHome ? [{ kind: 'HOME' as const, accountId, pawn }] : []),
    ...(place ? [{ kind: 'FINISH' as const, accountId, to: place }] : []),
    ...ghosts.fades,
  ]
}

/**
 * Time the screen needs for the chaos lines
 * @param {LudoLine[]} lines - Chaos lines
 * @return {number} - Milliseconds
 */

const chaosMs = (lines: LudoLine[]): number =>
  lines.filter((line) => line.kind === 'EFFECT').length * LUDO_CHAOS.effectMs +
  lines.filter((line) => line.kind === 'DUEL').length * LUDO_CHAOS.duelMs

type DuelWait = Extract<LudoPending, { type: 'duel' }>

/**
 * Duel opened: every other player has to throw their own die
 * @param {Object} input - Duel
 * @param {LudoTable} input.table - Locked board
 * @param {LudoRow[]} input.seats - Seats afterwards
 * @param {number} input.rev - Last revision written
 * @param {Pick<DuelWait, 'pawn' | 'isBonus' | 'steps'>} input.move - Move the duel interrupts
 * @param {number} input.extraMs - Beats of effects
 * @return {Promise<EngineStep>} - Step
 */

const startDuel = async ({
  table,
  seats,
  rev,
  move,
  extraMs,
}: {
  table: LudoTable
  seats: LudoRow[]
  rev: number
  move: Pick<DuelWait, 'pawn' | 'isBonus' | 'steps'>
  extraMs: number
}): Promise<EngineStep> => {
  const moverId = table.table.turnId
  const waiting = racing(table, seats)
    .map((seat) => seat.accountId)
    .filter((accountId) => accountId !== moverId)
  if (!waiting.length)
    return passTurn({
      table,
      seats,
      rev,
      isBonus: move.isBonus,
      sixes: table.table.sixes,
      steps: move.steps,
      extraMs,
    })

  const pending: DuelWait = { type: 'duel', ...move, waiting, rolls: {} }
  const turnEndsAt = clockAfter(table, move.steps, extraMs)
  await saveSeats(table, seats)
  await table.tx.ludoGame.update({
    where: { sessionId: table.session.id },
    data: { dice: null, rev, turnEndsAt, pending: storedPending(pending) },
  })

  return { changed: true, finished: false, deadline: turnEndsAt }
}

/**
 * Faces thrown in a duel, the last one settling it
 * @param {LudoTable} table - Locked board
 * @param {DuelWait} duel - Duel waiting
 * @param {string[]} throwers - Players throwing now
 * @return {Promise<EngineStep>} - Step
 */

const throwDuel = async (
  table: LudoTable,
  duel: DuelWait,
  throwers: string[]
): Promise<EngineStep> => {
  const moverId = table.table.turnId
  const rolls = { ...duel.rolls }
  const waiting = duel.waiting.filter((accountId) => !throwers.includes(accountId))
  const lines: LudoLine[] = throwers.map((accountId, index) => {
    const dice = rollDie()
    rolls[accountId] = dice

    return {
      kind: 'DUEL',
      accountId,
      dice,
      value: !waiting.length && index === throwers.length - 1 ? 1 : 0,
    }
  })

  // Still some to throw: the faces wait on the board
  if (waiting.length) {
    const rev = await writeLines(table, lines)
    await table.tx.ludoGame.update({
      where: { sessionId: table.session.id },
      data: { rev, pending: storedPending({ ...duel, waiting, rolls }) },
    })

    return { changed: true, finished: false, deadline: table.table.turnEndsAt }
  }

  // Everyone threw: the best pushes the trigger back
  const present = table.seats.filter((seat) => table.session.players.includes(seat.accountId))
  const outcome = duelRecoil({
    seats: present,
    moverId,
    pawn: duel.pawn,
    rolls: Object.entries(rolls).map(([accountId, dice]) => ({ accountId, dice })),
  })
  const all = [...lines, ...outcome.lines]
  const rev = await writeLines(table, all)

  return passTurn({
    table,
    seats: merged(table.seats, outcome.seats),
    rev,
    isBonus: duel.isBonus,
    sixes: table.table.sixes,
    steps: duel.steps,
    extraMs: chaosMs(all),
  })
}

/**
 * Move one pawn, take, reach home, land on an action square, then pass the die
 * @param {Object} input - Move
 * @param {LudoTable} input.table - Locked board
 * @param {LudoPlan} input.plan - Move
 * @param {number} input.dice - Die face
 * @param {LudoLine[]} [input.before] - Lines of the same gesture
 * @return {Promise<EngineStep>} - Step
 */

const playPlan = async ({
  table,
  plan,
  dice,
  before = [],
}: {
  table: LudoTable
  plan: LudoPlan
  dice: number
  before?: LudoLine[]
}): Promise<EngineStep> => {
  const moverId = table.table.turnId
  const moved = seatsAfter(table.seats, { moverId, plan, now: table.now })
  const wasDone = Boolean(table.seats.find((seat) => seat.accountId === moverId)?.finishedAt)
  const place = wasDone ? null : (moved.find((seat) => seat.accountId === moverId)?.place ?? null)

  // Phantoms followed, eaten or dispelled
  const ghosts = ghostsAfter({
    seats: moved,
    moverId,
    plan,
    dice,
    count: table.settings.pawns,
  })
  const { sixReplay, captureReplay, homeReplay, chaos } = table.settings.rules
  const isBonus =
    (dice === 6 && sixReplay) ||
    (plan.captures.length > 0 && captureReplay) ||
    (plan.isHome && homeReplay)
  const steps = plan.isExit ? 1 : plan.to - plan.from

  // Action square under the pawn
  const present = ghosts.seats.filter((seat) => table.session.players.includes(seat.accountId))
  const landing = chaos
    ? landOnSquare({ seats: present, moverId, plan })
    : { seats: present, lines: [] as LudoLine[], malus: null }
  const seats = merged(ghosts.seats, landing.seats)
  const rev = await writeLines(table, [
    ...before,
    ...linesOf(table, { plan, dice, place, ghosts }),
    ...landing.lines,
  ])
  const extraMs = chaosMs(landing.lines)

  // Others throw their own die
  if (landing.isDuel)
    return startDuel({ table, seats, rev, move: { pawn: plan.pawn, isBonus, steps }, extraMs })

  // A joker holder chooses before the malus lands
  if (landing.malus) {
    const pending: JokerOffer = {
      type: 'joker',
      malus: landing.malus,
      pawn: plan.pawn,
      to: plan.to,
      isBonus,
      steps,
    }
    const turnEndsAt = clockAfter(table, steps, extraMs)
    await saveSeats(table, seats)
    await table.tx.ludoGame.update({
      where: { sessionId: table.session.id },
      data: {
        dice: null,
        sixes: table.table.sixes,
        rev,
        turnEndsAt,
        pending: storedPending(pending),
      },
    })

    return { changed: true, finished: false, deadline: turnEndsAt }
  }

  return passTurn({ table, seats, rev, isBonus, sixes: table.table.sixes, steps, extraMs })
}

/**
 * Joker played or declined, then the malus lands or not
 * @param {LudoTable} table - Locked board
 * @param {JokerOffer} offer - Malus waiting
 * @param {boolean} isUsed - Joker played
 * @return {Promise<EngineStep>} - Step
 */

const resolveOffer = async (
  table: LudoTable,
  offer: JokerOffer,
  isUsed: boolean
): Promise<EngineStep> => {
  const moverId = table.table.turnId
  let seats = table.seats
  let lines: LudoLine[] = []

  // Joker spent, or the malus lands
  if (isUsed) {
    seats = seats.map((seat) =>
      seat.accountId === moverId ? { ...seat, joker: Math.max(0, seat.joker - 1) } : seat
    )
    lines = [
      { kind: 'JOKER', accountId: moverId, effect: offer.malus, pawn: offer.pawn, to: offer.to },
    ]
  } else if (offer.malus === 'duel') {
    const rev = await writeLines(table, [])

    return startDuel({
      table,
      seats,
      rev,
      move: { pawn: offer.pawn, isBonus: offer.isBonus, steps: offer.steps },
      extraMs: 0,
    })
  } else {
    const present = seats.filter((seat) => table.session.players.includes(seat.accountId))
    const hit = applyMalus(offer.malus, {
      seats: present,
      moverId,
      pawn: offer.pawn,
      random: Math.random,
    })
    seats = merged(seats, hit.seats)
    lines = hit.lines
  }
  const rev = await writeLines(table, lines)

  return passTurn({
    table,
    seats,
    rev,
    isBonus: offer.isBonus,
    sixes: table.table.sixes,
    steps: offer.steps,
    extraMs: chaosMs(lines),
  })
}

/**
 * Die settled: move at once when nothing is to choose, else the player picks a pawn
 * @param {LudoTable} table - Locked board
 * @param {number} dice - Die face kept
 * @param {LudoLine[]} before - Lines of the same gesture
 * @param {boolean} [isAuto] - Clock ran out
 * @return {Promise<EngineStep>} - Step
 */

const settleRoll = async (
  table: LudoTable,
  dice: number,
  before: LudoLine[],
  isAuto = false
): Promise<EngineStep> => {
  const accountId = table.table.turnId
  const sixes = dice === 6 ? table.table.sixes + 1 : 0
  const { settings, seats } = table

  // Third six in a row loses the turn
  if (settings.rules.threeSixes && sixes >= LUDO_SETTINGS.maxSixes) {
    const rev = await writeLines(table, [...before, { kind: 'PENALTY', accountId, dice }])

    return passTurn({ table, seats, rev, isBonus: false, sixes: 0 })
  }

  const plans = legalMoves(boardOf(table), accountId, dice, settings)
  const rolled = { ...table, table: { ...table.table, sixes } }
  if (!plans.length) {
    const rev = await writeLines(table, before)

    return passTurn({
      table: rolled,
      seats,
      rev,
      isBonus: dice === 6 && settings.rules.sixReplay,
      sixes,
    })
  }
  if (isAuto || isOnlyChoice(plans))
    return playPlan({ table: rolled, plan: autoMove(plans)!, dice, before })

  // Several pawns can go, the player picks
  const rev = await writeLines(table, before)
  const turnEndsAt = clockAfter(table, 0)
  await saveSeats(table, seats)
  await table.tx.ludoGame.update({
    where: { sessionId: table.session.id },
    data: { dice, sixes, rev, turnEndsAt, pending: Prisma.DbNull },
  })

  return { changed: true, finished: false, deadline: turnEndsAt }
}

/**
 * One die of a double throw kept
 * @param {LudoTable} table - Locked board
 * @param {[number, number]} dice - Both faces
 * @param {number} index - Face kept
 * @param {LudoLine[]} before - Lines of the same gesture
 * @param {boolean} [isAuto] - Clock ran out
 * @return {Promise<EngineStep>} - Step
 */

const keepDie = (
  table: LudoTable,
  dice: [number, number],
  index: number,
  before: LudoLine[] = [],
  isAuto = false
): Promise<EngineStep> => {
  const pick: LudoLine = {
    kind: 'PICK',
    accountId: table.table.turnId,
    dice: dice[index],
    from: dice[1 - index],
    value: index,
  }

  return settleRoll(table, dice[index], [...before, pick], isAuto)
}

/**
 * Roll for the player on turn, moving at once when nothing is to choose
 * @param {LudoTable} table - Locked board
 * @param {Object} [options] - Roll
 * @param {boolean} [options.isAuto] - Clock ran out
 * @return {Promise<EngineStep>} - Step
 */

const rollFor = async (table: LudoTable, { isAuto = false } = {}): Promise<EngineStep> => {
  const accountId = table.table.turnId
  const me = table.seats.find((seat) => seat.accountId === accountId)!
  const { effects } = me

  // Boost and double are spent by this throw
  const spent = {
    ...table,
    seats: table.seats.map((seat) =>
      seat.id === me.id
        ? { ...seat, effects: { ...effects, boost: undefined, double: undefined } }
        : seat
    ),
  }
  const first = faceOf(effects)
  const before: LudoLine[] = [
    ...(isAuto ? [{ kind: 'SKIP' as const, accountId }] : []),
    { kind: 'ROLL', accountId, dice: first },
  ]
  if (!effects.double) return settleRoll(spent, first, before, isAuto)

  // Two dice on the table, one to keep
  const second = otherFaceOf(effects, first)
  const lines: LudoLine[] = [...before, { kind: 'DOUBLE', accountId, dice: second }]
  const both: [number, number] = [first, second]
  if (isAuto) return keepDie(spent, both, first >= second ? 0 : 1, lines, true)
  const rev = await writeLines(spent, lines)
  const turnEndsAt = clockAfter(spent, 0, LUDO_CHAOS.effectMs)
  await saveSeats(spent, spent.seats)
  await spent.tx.ludoGame.update({
    where: { sessionId: table.session.id },
    data: { rev, turnEndsAt, pending: storedPending({ type: 'pick', dice: both }) },
  })

  return { changed: true, finished: false, deadline: turnEndsAt }
}

/**
 * Board open to the player on turn
 * @param {LudoTable} table - Locked board
 * @param {string} accountId - Player
 * @return {void}
 */

const requireTurn = ({ table, now }: LudoTable, accountId: string): void => {
  if (table.turnId !== accountId || now < table.startsAt) throw conflict(PLAY_ERRORS.notYourTurn)
}

/**
 * Throw the die
 * @param {EngineSession} session - Game
 * @param {string} accountId - Player
 * @return {Promise<EngineStep>} - Step
 */

export const rollDice = (session: EngineSession, accountId: string): Promise<EngineStep> =>
  withTable(session, (table) => {
    requireTurn(table, accountId)
    if (table.table.dice !== null) throw conflict(PLAY_ERRORS.alreadyRolled)
    if (table.table.pending) throw conflict(PLAY_ERRORS.noChoice)

    return rollFor(table)
  })

/**
 * Move the pawn picked with the die on the table
 * @param {EngineSession} session - Game
 * @param {string} accountId - Player
 * @param {Record<string, unknown>} raw - Body with the pawn
 * @return {Promise<EngineStep>} - Step
 */

export const movePawn = (
  session: EngineSession,
  accountId: string,
  raw: Record<string, unknown>
): Promise<EngineStep> =>
  withTable(session, (table) => {
    requireTurn(table, accountId)
    const dice = table.table.dice
    if (dice === null) throw conflict(PLAY_ERRORS.rollFirst)

    const pawn = readBodyInteger(raw, 'pawn')
    const plan = legalMoves(boardOf(table), accountId, dice, table.settings).find(
      (entry) => entry.pawn === pawn
    )
    if (!plan) throw conflict(PLAY_ERRORS.badPawn)

    return playPlan({ table, plan, dice })
  })

/**
 * Keep one die of a double throw
 * @param {EngineSession} session - Game
 * @param {string} accountId - Player
 * @param {Record<string, unknown>} raw - Body with the die
 * @return {Promise<EngineStep>} - Step
 */

export const pickDie = (
  session: EngineSession,
  accountId: string,
  raw: Record<string, unknown>
): Promise<EngineStep> =>
  withTable(session, (table) => {
    requireTurn(table, accountId)
    const pending = pendingOf(table.table.pending)
    if (pending?.type !== 'pick') throw conflict(PLAY_ERRORS.noChoice)

    return keepDie(table, pending.dice, readBodyInteger(raw, 'die') === 1 ? 1 : 0)
  })

/**
 * Play the joker against a malus, or let it land
 * @param {EngineSession} session - Game
 * @param {string} accountId - Player
 * @param {Record<string, unknown>} raw - Body with the answer
 * @return {Promise<EngineStep>} - Step
 */

export const answerJoker = (
  session: EngineSession,
  accountId: string,
  raw: Record<string, unknown>
): Promise<EngineStep> =>
  withTable(session, (table) => {
    requireTurn(table, accountId)
    const pending = pendingOf(table.table.pending)
    if (pending?.type !== 'joker') throw conflict(PLAY_ERRORS.noChoice)

    return resolveOffer(table, pending, raw.use === true)
  })

/**
 * Throw the die of a duel, for a player who is not the one on turn
 * @param {EngineSession} session - Game
 * @param {string} accountId - Player
 * @return {Promise<EngineStep>} - Step
 */

export const rollDuel = (session: EngineSession, accountId: string): Promise<EngineStep> =>
  withTable(session, (table) => {
    const pending = pendingOf(table.table.pending)
    if (pending?.type !== 'duel' || !pending.waiting.includes(accountId))
      throw conflict(PLAY_ERRORS.noChoice)

    return throwDuel(table, pending, [accountId])
  })

/**
 * Turn handed on without a move, no line written
 * @param {LudoTable} table - Locked board
 * @return {Promise<EngineStep>} - Step
 */

const skipTurn = (table: LudoTable): Promise<EngineStep> =>
  passTurn({ table, seats: table.seats, rev: table.table.rev, isBonus: false, sixes: 0 })

/**
 * Play every overdue turn of the board
 * @param {EngineSession} session - Game
 * @return {Promise<EngineStep>} - Step
 */

export const settleBoard = (session: EngineSession): Promise<EngineStep> =>
  withTable(session, async (table) => {
    const { turnId, dice, turnEndsAt } = table.table
    if (isOver(table, table.seats)) return closeBoard(table, table.seats)

    // Player on turn walked away or is home
    if (!racing(table, table.seats).some((seat) => seat.accountId === turnId))
      return skipTurn(table)
    if (table.now < turnEndsAt) return { ...IDLE_STEP, deadline: turnEndsAt }

    // Clock ran out on a choice: no joker, the best die
    const pending = pendingOf(table.table.pending)
    if (pending?.type === 'joker') return resolveOffer(table, pending, false)
    if (pending?.type === 'duel') return throwDuel(table, pending, pending.waiting)
    if (pending?.type === 'pick') {
      const skip: LudoLine = { kind: 'SKIP', accountId: turnId }

      return keepDie(table, pending.dice, pending.dice[0] >= pending.dice[1] ? 0 : 1, [skip], true)
    }

    // Clock ran out, the best move is played
    if (dice === null) return rollFor(table, { isAuto: true })
    const plan = autoMove(legalMoves(boardOf(table), turnId, dice, table.settings))
    if (!plan) return skipTurn(table)

    return playPlan({ table, plan, dice, before: [{ kind: 'SKIP', accountId: turnId }] })
  })
