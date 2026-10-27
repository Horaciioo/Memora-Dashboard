import 'server-only'

import type { LudoGame, LudoMoveKind, LudoPlayer, Prisma } from '@prisma/client'

import { prisma } from '@/core/lib/db'
import { conflict, notFound } from '@/core/lib/errors'
import { after, countdownEnd } from '@/core/lib/play/clock'
import {
  autoMove,
  isBoardOver,
  isOnlyChoice,
  legalMoves,
  ludoSettingsOf,
  nextTurn,
  rollDie,
  seatsAfter,
  standingScore,
  YARD_STEP,
} from '@/core/lib/play/ludo'
import type { LudoGameSettings, LudoPlan, LudoSeat } from '@/core/lib/play/ludo'
import { readBodyInteger } from '@/core/lib/play/parse'
import { IDLE_STEP } from '@/core/engines/play/steps'
import { holdSession } from '@/core/services/play/PlaySessionService'
import { LUDO_SEATING } from '@/declarations/play/ludo/board'
import { LUDO_SETTINGS } from '@/declarations/play/ludo/settings'
import { PLAY_ERRORS } from '@/declarations/play/copy'
import type { EngineSession, EngineStep } from '@/types/play'
import { SECOND_MS } from '@/utils/constants/time'

// Locked board of a game
interface LudoTable {
  tx: Prisma.TransactionClient
  session: EngineSession
  settings: LudoGameSettings
  table: LudoGame
  seats: LudoPlayer[]
  now: Date
}

// One line written for the board
interface LudoLine {
  kind: LudoMoveKind
  accountId: string
  dice?: number
  pawn?: number
  from?: number
  to?: number
  victimId?: string
}

/**
 * Colours still seated, as the rules read them
 * @param {LudoTable} table - Locked board
 * @return {LudoSeat[]} - Board
 */

const boardOf = ({ seats, session }: LudoTable): LudoSeat[] =>
  seats
    .filter((seat) => session.players.includes(seat.accountId))
    .map(({ accountId, corner, pawns }) => ({ accountId, corner, pawns }))

/**
 * Colours still racing
 * @param {LudoTable} table - Locked board
 * @param {LudoPlayer[]} seats - Seats to read
 * @return {LudoPlayer[]} - Seated, not home
 */

const racing = ({ session }: LudoTable, seats: LudoPlayer[]): LudoPlayer[] =>
  seats.filter((seat) => session.players.includes(seat.accountId) && !seat.finishedAt)

/**
 * Run work on the locked board
 * @param {EngineSession} session - Game
 * @param {(table: LudoTable) => Promise<EngineStep>} work - Board work
 * @return {Promise<EngineStep>} - Step
 */

const withTable = (
  session: EngineSession,
  work: (table: LudoTable) => Promise<EngineStep>
): Promise<EngineStep> =>
  prisma.$transaction(async (tx) => {
    await holdSession(tx, session.id)
    const [table, seats] = await Promise.all([
      tx.ludoGame.findUnique({ where: { sessionId: session.id } }),
      tx.ludoPlayer.findMany({ where: { sessionId: session.id }, orderBy: { corner: 'asc' } }),
    ])
    if (!table) throw notFound(PLAY_ERRORS.roundMissing)

    return work({
      tx,
      session,
      settings: ludoSettingsOf(session.settings),
      table,
      seats,
      now: new Date(),
    })
  })

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
      })),
    }),
    prisma.ludoGame.create({
      data: { sessionId: session.id, turnId: order[0], startsAt, turnEndsAt },
    }),
  ])

  return { changed: true, finished: false, deadline: turnEndsAt }
}

/**
 * Write the lines of one gesture, a revision each
 * @param {LudoTable} table - Locked board
 * @param {LudoLine[]} lines - Lines in order
 * @return {Promise<number>} - Last revision
 */

const writeLines = async ({ tx, session, table }: LudoTable, lines: LudoLine[]) => {
  await tx.ludoMove.createMany({
    data: lines.map((line, index) => ({
      sessionId: session.id,
      rev: table.rev + index + 1,
      ...line,
    })),
  })

  return table.rev + lines.length
}

/**
 * Turn clock, the moves on screen left to play out first
 * @param {LudoTable} table - Locked board
 * @param {number} steps - Squares walked
 * @return {Date} - End of the turn
 */

const clockAfter = ({ settings, now }: LudoTable, steps: number): Date =>
  new Date(
    now.getTime() +
      (settings.turnSeconds + LUDO_SETTINGS.graceSeconds) * SECOND_MS +
      LUDO_SETTINGS.rollMs +
      steps * LUDO_SETTINGS.stepMs
  )

/**
 * Game over for the ending picked
 * @param {LudoTable} table - Locked board
 * @param {LudoPlayer[]} seats - Seats afterwards
 * @return {boolean} - Over
 */

const isOver = ({ session, settings }: LudoTable, seats: LudoPlayer[]): boolean =>
  isBoardOver({ seats, players: session.players, ending: settings.ending })

/**
 * Places and scores written on the seats
 * @param {LudoTable} table - Locked board
 * @param {LudoPlayer[]} seats - Seats afterwards
 * @return {Promise<EngineStep>} - Finished step
 */

const closeBoard = async ({ tx, session }: LudoTable, seats: LudoPlayer[]) => {
  for (const seat of seats) {
    await tx.playSeat.update({
      where: { sessionId_accountId: { sessionId: session.id, accountId: seat.accountId } },
      data: { score: standingScore(seat, LUDO_SETTINGS.maxPlayers) },
    })
  }

  return { changed: true, finished: true, deadline: null }
}

/**
 * Hand the die on, or back to the same player
 * @param {Object} input - Turn change
 * @param {LudoTable} input.table - Locked board
 * @param {LudoPlayer[]} input.seats - Seats afterwards
 * @param {number} input.rev - Last revision
 * @param {boolean} input.isBonus - Same player again
 * @param {number} input.sixes - Sixes in a row kept
 * @param {number} [input.steps] - Squares walked
 * @return {Promise<EngineStep>} - Step
 */

const passTurn = async ({
  table,
  seats,
  rev,
  isBonus,
  sixes,
  steps = 0,
}: {
  table: LudoTable
  seats: LudoPlayer[]
  rev: number
  isBonus: boolean
  sixes: number
  steps?: number
}): Promise<EngineStep> => {
  if (isOver(table, seats)) return closeBoard(table, seats)

  // Bonus only for a player still racing
  const active = racing(table, seats)
  const { turnId } = table.table
  const current = seats.find((seat) => seat.accountId === turnId)
  const keeps = isBonus && active.some((seat) => seat.accountId === turnId)
  const turnEndsAt = clockAfter(table, steps)
  await table.tx.ludoGame.update({
    where: { sessionId: table.session.id },
    data: {
      turnId: keeps ? turnId : (nextTurn(active, current?.corner ?? -1) ?? turnId),
      dice: null,
      sixes: keeps ? sixes : 0,
      rev,
      turnEndsAt,
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
 * @return {LudoLine[]} - Lines
 */

const linesOf = (
  { table }: LudoTable,
  { plan, dice, place }: { plan: LudoPlan; dice: number; place: number | null }
): LudoLine[] => {
  const accountId = table.turnId
  const { pawn, from, to } = plan

  return [
    { kind: 'MOVE', accountId, dice, pawn, from, to },
    ...plan.captures.map((taken) => ({
      kind: 'CAPTURE' as const,
      accountId,
      pawn: taken.pawn,
      from: taken.from,
      victimId: taken.accountId,
    })),
    ...(plan.isHome ? [{ kind: 'HOME' as const, accountId, pawn }] : []),
    ...(place ? [{ kind: 'FINISH' as const, accountId, to: place }] : []),
  ]
}

/**
 * Move one pawn, take, reach home, then pass the die
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
  const seats = seatsAfter(table.seats, { moverId, plan, now: table.now })
  const wasDone = Boolean(table.seats.find((seat) => seat.accountId === moverId)?.finishedAt)
  const place = wasDone ? null : (seats.find((seat) => seat.accountId === moverId)?.place ?? null)
  const rev = await writeLines(table, [...before, ...linesOf(table, { plan, dice, place })])

  // Only the colours that moved
  for (const seat of seats) {
    const old = table.seats.find((entry) => entry.id === seat.id)
    if (old?.pawns.join() === seat.pawns.join() && old.place === seat.place) continue
    await table.tx.ludoPlayer.update({
      where: { id: seat.id },
      data: { pawns: seat.pawns, finishedAt: seat.finishedAt, place: seat.place },
    })
  }

  // Bonus throws of the house rules
  const { sixReplay, captureReplay, homeReplay } = table.settings.rules
  const isBonus =
    (dice === 6 && sixReplay) ||
    (plan.captures.length > 0 && captureReplay) ||
    (plan.isHome && homeReplay)
  const steps = plan.isExit ? 1 : plan.to - plan.from

  return passTurn({ table, seats, rev, isBonus, sixes: table.table.sixes, steps })
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
  const dice = rollDie()
  const sixes = dice === 6 ? table.table.sixes + 1 : 0
  const before: LudoLine[] = [
    ...(isAuto ? [{ kind: 'SKIP' as const, accountId }] : []),
    { kind: 'ROLL', accountId, dice },
  ]
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
  await table.tx.ludoGame.update({
    where: { sessionId: table.session.id },
    data: { dice, sixes, rev, turnEndsAt },
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

    // Clock ran out, the best move is played
    if (dice === null) return rollFor(table, { isAuto: true })
    const plan = autoMove(legalMoves(boardOf(table), turnId, dice, table.settings))
    if (!plan) return skipTurn(table)

    return playPlan({ table, plan, dice, before: [{ kind: 'SKIP', accountId: turnId }] })
  })
