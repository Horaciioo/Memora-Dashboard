import type { Prisma } from '@prisma/client'

import type { EngineSession } from '@/types/play'
import { PLAY_OPEN_STATUSES } from '@/utils/constants/play'

/**
 * Game with its seats and players
 * @type {Prisma.PlaySessionInclude}
 */

export const SESSION_INCLUDE = {
  seats: {
    orderBy: { joinedAt: 'asc' },
    include: { account: { select: { id: true, displayName: true, avatarUrl: true } } },
  },
  tournament: true,
  rematch: { select: { id: true, status: true } },
} as const satisfies Prisma.PlaySessionInclude

export type LoadedSession = Prisma.PlaySessionGetPayload<{ include: typeof SESSION_INCLUDE }>

export type LoadedSeat = LoadedSession['seats'][number]

/**
 * Seat still held
 * @param {{ leftAt: Date | null, kickedAt: Date | null }} seat - Seat
 * @return {boolean} - Present
 */

export const isPresent = (seat: { leftAt: Date | null; kickedAt: Date | null }): boolean =>
  !seat.leftAt && !seat.kickedAt

/**
 * Engine view of a game
 * @param {LoadedSession} session - Game
 * @return {EngineSession} - Engine input
 */

export const toEngineSession = (session: LoadedSession): EngineSession => ({
  id: session.id,
  hostId: session.hostId,
  settings: session.settings,
  players: session.seats.filter(isPresent).map((seat) => seat.accountId),
})

/**
 * Seat still held in an open game
 * @param {string} accountId - Player
 * @return {Prisma.PlaySeatWhereInput} - Filter
 */

export const openSeatOf = (accountId: string) =>
  ({
    accountId,
    leftAt: null,
    kickedAt: null,
    session: { status: { in: [...PLAY_OPEN_STATUSES] } },
  }) satisfies Prisma.PlaySeatWhereInput
