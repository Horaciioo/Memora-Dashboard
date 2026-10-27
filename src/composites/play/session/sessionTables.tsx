import type { ReactNode } from 'react'

import { BacLiveProgress } from '@/composites/play/baccalaureat/BacLiveProgress'
import { BaccalaureatBoard } from '@/composites/play/baccalaureat/BaccalaureatBoard'
import type { BacBoardView } from '@/composites/play/baccalaureat/types'
import { BombBoard } from '@/composites/play/bomb/BombBoard'
import type { BombBoardView } from '@/composites/play/bomb/types'
import { GolfBoard } from '@/composites/play/golf/GolfBoard'
import { GolfFeed } from '@/composites/play/golf/GolfFeed'
import { LudoBoard } from '@/composites/play/ludo/LudoBoard'
import { LudoFeed } from '@/composites/play/ludo/LudoFeed'
import type { LudoBoardView } from '@/core/lib/play/ludo/state'
import type { GolfBoardView } from '@/core/lib/play/golf'
import type { PlayFace } from '@/composites/play/session/BacSessionCrowd'
import { PlainLiveFeed } from '@/composites/play/session/live/PlainLiveFeed'
import { BAC_FEED_COPY, BOMB_FEED_COPY } from '@/declarations/play'
import { PlayGames } from '@/utils/constants/play'
import type { PlayGameName } from '@/utils/constants/play'

/**
 * What a running table is drawn from
 * @typedef {Object} PlayTableInput
 */

export interface PlayTableInput {
  sessionId: string
  board: unknown
  players: PlayFace[]
  // Seated once, gone or not
  seats: PlayFace[]
  spectators: PlayFace[]
  viewerId: string
  me: { isSeated: boolean; isHost: boolean }
}

/**
 * Board and feed of a running game
 * @typedef {Object} PlayTable
 */

export interface PlayTable {
  board: ReactNode
  feed: ReactNode
}

/**
 * Faces as a board names them
 * @param {PlayFace[]} faces - Faces
 * @return {object[]} - Board players
 */

const asPlayers = (faces: PlayFace[]) =>
  faces.map(({ id, name, avatarUrl }) => ({ accountId: id, name, avatarUrl }))

/**
 * Running table per game
 * @type {Partial<Record<PlayGameName, (input: PlayTableInput) => PlayTable>>}
 */

export const PLAY_SESSION_TABLES: Partial<
  Record<PlayGameName, (input: PlayTableInput) => PlayTable>
> = {
  [PlayGames.Baccalaureat]: ({ sessionId, board, players, spectators, viewerId, me }) => {
    const bac = board as BacBoardView

    return {
      board: (
        <>
          <BaccalaureatBoard
            sessionId={sessionId}
            board={bac}
            players={asPlayers(players)}
            viewerId={viewerId}
            me={me}
          />
          <BacLiveProgress sessionId={sessionId} board={bac} players={players} />
        </>
      ),
      feed: (
        <PlainLiveFeed
          sessionId={sessionId}
          board={bac}
          copy={BAC_FEED_COPY}
          players={[...players, ...spectators]}
        />
      ),
    }
  },
  [PlayGames.Bomb]: ({ sessionId, board, seats, spectators, viewerId, me }) => {
    const bomb = board as BombBoardView

    return {
      board: (
        <BombBoard
          sessionId={sessionId}
          board={bomb}
          faces={asPlayers(seats)}
          viewerId={viewerId}
          isSeated={me.isSeated}
        />
      ),
      feed: (
        <PlainLiveFeed
          sessionId={sessionId}
          board={bomb}
          copy={BOMB_FEED_COPY}
          players={[...seats, ...spectators]}
        />
      ),
    }
  },
  [PlayGames.Golf]: ({ sessionId, board, seats, spectators, viewerId, me }) => {
    const golf = board as GolfBoardView

    return {
      board: (
        <GolfBoard
          sessionId={sessionId}
          board={golf}
          faces={seats.map(({ id, name, avatarUrl, color }) => ({
            accountId: id,
            name,
            avatarUrl,
            color: color ?? '',
          }))}
          viewerId={viewerId}
          isSeated={me.isSeated}
        />
      ),
      // Client element, keyed in the side column
      feed: (
        <GolfFeed
          key={sessionId}
          sessionId={sessionId}
          board={golf}
          players={[...seats, ...spectators]}
        />
      ),
    }
  },
  [PlayGames.Ludo]: ({ sessionId, board, seats, spectators, viewerId, me }) => {
    const ludo = board as LudoBoardView

    return {
      board: (
        <LudoBoard
          sessionId={sessionId}
          board={ludo}
          faces={seats.map(({ id, name, avatarUrl, isHost }) => ({
            accountId: id,
            name,
            avatarUrl,
            isHost: Boolean(isHost),
          }))}
          viewerId={viewerId}
          isSeated={me.isSeated}
        />
      ),
      feed: <LudoFeed sessionId={sessionId} board={ludo} players={[...seats, ...spectators]} />,
    }
  },
}
