import 'server-only'

import type { LudoMove } from '@prisma/client'

import { prisma } from '@/core/lib/db'
import {
  effectsOf,
  isBoardOver,
  legalMoves,
  looksOf,
  ludoSettingsOf,
  pendingOf,
  progressOf,
  readGhostTag,
  mapOf,
} from '@/core/lib/play/ludo'
import type { LudoEffects } from '@/core/lib/play/ludo'
import { HIDDEN_STEP, YARD_STEP } from '@/core/lib/play/ludo/track'
import { LUDO_CHAOS_COPY, ludoPlaceLabel } from '@/declarations/play/ludo/copy'
import { LUDO_SETTINGS } from '@/declarations/play/ludo/settings'
import type { EngineSession } from '@/types/play'

// Lines shown in the feed
const FEED_KINDS = ['CAPTURE', 'HOME', 'SKIP', 'PENALTY', 'FINISH', 'EFFECT', 'JOKER'] as const

/**
 * Feed line of a board line
 * @param {LudoMove} move - Line
 * @return {object} - Feed line
 */

const feedLineOf = (move: LudoMove) => ({
  id: move.id,
  // A move out of the yard is an exit
  kind: move.kind === 'MOVE' ? 'EXIT' : move.kind,
  accountId: move.accountId,
  at: move.createdAt,
  values: {
    victimId: move.victimId ?? '',
    place: move.to && move.kind === 'FINISH' ? ludoPlaceLabel(move.to) : '',
    effect: move.effect
      ? (LUDO_CHAOS_COPY[move.effect as keyof typeof LUDO_CHAOS_COPY]?.name ?? '')
      : '',
    // Told once the screen reaches this line
    rev: move.rev,
  },
})

/**
 * Effects of a colour as a screen may read them
 * @param {LudoEffects} effects - Effects
 * @param {boolean} isOwner - The colour's own screen
 * @param {number} count - Pawns per colour
 * @return {object} - Effects shown
 */

const effectsView = (effects: LudoEffects, isOwner: boolean, count: number) => ({
  // Both copies look alike, only the owner knows which is real
  ghost: effects.ghost
    ? {
        turns: effects.ghost.turns,
        pair: [count, count + 1],
        real: isOwner ? effects.ghost.pawn : null,
        decoy: isOwner ? count : null,
      }
    : null,
  chameleon: effects.chameleon?.turns ?? 0,
  faulty: effects.faulty ?? 0,
  blind: effects.blind ?? 0,
  skip: Boolean(effects.skip),
  double: Boolean(effects.double),
  boost: isOwner && Boolean(effects.boost),
})

/**
 * Pawns of a colour as a screen may see them, phantom included
 * @param {number[]} pawns - Real steps
 * @param {LudoEffects} effects - Effects
 * @param {boolean} isOwner - The colour's own screen
 * @return {number[]} - Steps shown
 */

const pawnsView = (pawns: number[], effects: LudoEffects, isOwner: boolean): number[] => {
  const { ghost } = effects
  if (!ghost) return pawns
  if (isOwner) return [...pawns, ghost.step]

  // Others get two anonymous copies, the pawn's own slot is blanked
  const shown = [...pawns]
  shown[ghost.pawn] = HIDDEN_STEP
  shown[pawns.length + ghost.swap] = pawns[ghost.pawn]
  shown[pawns.length + 1 - ghost.swap] = ghost.step

  return shown
}

/**
 * Line as a screen may read it, phantom pawns relabelled
 * @param {object} line - Line
 * @param {string} viewerId - Reader
 * @param {number} count - Pawns per colour
 * @return {object} - Line shown
 */

const lineView = <
  T extends {
    kind: string
    accountId: string
    victimId: string | null
    effect: string | null
    pawn: number | null
    value: number | null
    dice: number | null
  },
>(
  line: T,
  viewerId: string,
  count: number
): T => {
  const tag = readGhostTag(line.effect)
  if (!tag) return line
  const owner = line.kind === 'CAPTURE' ? line.victimId : line.accountId
  const isOwner = owner === viewerId
  const labelOf = (isReal: boolean) =>
    isOwner ? (isReal ? tag.pawn : count) : count + (isReal ? tag.swap : 1 - tag.swap)
  const isJumperReal = tag.role === 'real'
  const label = labelOf(isJumperReal)
  if (line.kind !== 'SPLIT') return { ...line, pawn: label }

  // A split names the jumper and the pawn left behind
  return { ...line, pawn: label, value: labelOf(!isJumperReal), dice: tag.pawn }
}

/**
 * Boards of a Ludo game read once
 * @param {EngineSession} session - Game
 * @return {Promise<(viewerId: string) => object>} - Board of each reader
 */

export const ludoBoards = async (session: EngineSession) => {
  const where = { sessionId: session.id }
  const newest = { orderBy: { rev: 'desc' as const }, take: LUDO_SETTINGS.feedSize }
  const [table, seats, lines, feed] = await Promise.all([
    prisma.ludoGame.findUnique({ where }),
    prisma.ludoPlayer.findMany({ where, orderBy: { corner: 'asc' } }),
    prisma.ludoMove.findMany({ where, ...newest }),
    prisma.ludoMove.findMany({
      where: {
        ...where,
        OR: [{ kind: { in: [...FEED_KINDS] } }, { kind: 'MOVE', from: { lte: YARD_STEP } }],
      },
      ...newest,
    }),
  ])
  const settings = ludoSettingsOf(session.settings)
  const map = mapOf(settings.rules.chaos)
  const present = new Set(session.players)
  const read = seats.map((seat) => ({ ...seat, effects: effectsOf(seat.effects) }))
  const board = read
    .filter((seat) => present.has(seat.accountId))
    .map(({ accountId, corner, pawns }) => ({ accountId, corner, pawns }))
  const looks = looksOf(read)
  const pending = pendingOf(table?.pending)
  const base = {
    settings,
    rev: table?.rev ?? 0,
    startsAt: table?.startsAt ?? new Date(),
    turnEndsAt: table?.turnEndsAt ?? new Date(),
    turnId: table?.turnId ?? null,
    dice: table?.dice ?? null,
    isOver: isBoardOver({ seats, players: session.players, ending: settings.ending }),
    feed: feed.map(feedLineOf),
    serverTime: new Date(),
  }

  return (viewerId: string) => {
    const isMyTurn = table?.turnId === viewerId

    return {
      ...base,
      isMyTurn,
      looks,
      // Colours as each screen may see them
      players: read.map((seat) => {
        const isOwner = seat.accountId === viewerId

        return {
          accountId: seat.accountId,
          corner: seat.corner,
          pawns: pawnsView(seat.pawns, seat.effects, isOwner),
          place: seat.place,
          progress: progressOf(map, seat.pawns),
          hasLeft: !present.has(seat.accountId),
          joker: seat.joker,
          effects: effectsView(seat.effects, isOwner, seat.pawns.length),
        }
      }),
      // Newest first, replayed oldest first
      lines: lines.map(
        ({ id, kind, rev, accountId, dice, pawn, from, to, victimId, effect, value }) =>
          lineView(
            { id, kind, rev, accountId, dice, pawn, from, to, victimId, effect, value },
            viewerId,
            settings.pawns
          )
      ),
      // Choice the turn waits on, its content told to the player only
      pending: pending
        ? pending.type === 'duel' || pending.type === 'frenzy'
          ? { type: pending.type, dice: null, malus: null, waiting: pending.waiting }
          : isMyTurn
            ? pending
            : { type: pending.type, dice: null, malus: null }
        : null,
      // Pawns the viewer may move with the die on the table
      movable:
        isMyTurn && table?.dice
          ? legalMoves(board, viewerId, table.dice, settings).map(({ pawn, to }) => ({ pawn, to }))
          : [],
    }
  }
}

/**
 * Board of a Ludo game for one reader
 * @param {EngineSession} session - Game
 * @param {string} viewerId - Reader
 * @return {Promise<object>} - Board
 */

export const ludoView = async (session: EngineSession, viewerId: string) =>
  (await ludoBoards(session))(viewerId)
