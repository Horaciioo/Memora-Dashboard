import type { ReactNode } from 'react'

import { BaccalaureatBoard } from '@/composites/play/baccalaureat/BaccalaureatBoard'
import type { BacBoardView } from '@/composites/play/baccalaureat/types'
import { CroquisBoard } from '@/composites/play/croquis/CroquisBoard'
import type { CroquisBoardView } from '@/composites/play/croquis/types'
import { EchoBoard } from '@/composites/play/echo/EchoBoard'
import type { EchoBoardView } from '@/composites/play/echo/types'
import { SuspensBoard } from '@/composites/play/suspens/SuspensBoard'
import type { SuspensBoardView } from '@/composites/play/suspens/types'
import { GlitchBoard } from '@/composites/play/glitch/GlitchBoard'
import type { GlitchBoardView } from '@/composites/play/glitch/types'
import { JumbleBoard } from '@/composites/play/jumble/JumbleBoard'
import type { JumbleBoardView } from '@/composites/play/jumble/types'
import { BombBoard } from '@/composites/play/bomb/BombBoard'
import type { BombBoardView } from '@/composites/play/bomb/types'
import { GolfBoard } from '@/composites/play/golf/GolfBoard'
import { GolfFeed } from '@/composites/play/golf/GolfFeed'
import { LudoBoard } from '@/composites/play/ludo/LudoBoard'
import { LudoFeed } from '@/composites/play/ludo/LudoFeed'
import { NavalBoard } from '@/composites/play/naval/battle/NavalBoard'
import type { LudoBoardView } from '@/core/lib/play/ludo/state'
import type { NavalBoardView } from '@/core/lib/play/naval/state'
import type { GolfBoardView } from '@/core/lib/play/golf'
import type { PlayFace } from '@/composites/play/session/BacSessionCrowd'
import { PlainLiveFeed } from '@/composites/play/session/live/PlainLiveFeed'
import {
  BAC_FEED_COPY,
  BOMB_FEED_COPY,
  CROQUIS_FEED_COPY,
  SUSPENS_FEED_COPY,
  ECHO_FEED_COPY,
  GLITCH_FEED_COPY,
  JUMBLE_FEED_COPY,
} from '@/declarations/play'
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
  // Play management right: inspection tools in the free view
  canInspect?: boolean
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
        <BaccalaureatBoard
          sessionId={sessionId}
          board={bac}
          players={asPlayers(players)}
          viewerId={viewerId}
          me={me}
        />
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
  [PlayGames.Croquis]: ({ sessionId, board, seats, spectators, viewerId, me }) => {
    const croquis = board as CroquisBoardView

    return {
      board: (
        <CroquisBoard
          sessionId={sessionId}
          board={croquis}
          faces={asPlayers(seats)}
          viewerId={viewerId}
          isSeated={me.isSeated}
        />
      ),
      feed: (
        <PlainLiveFeed
          sessionId={sessionId}
          board={croquis}
          copy={CROQUIS_FEED_COPY}
          players={[...seats, ...spectators]}
        />
      ),
    }
  },
  [PlayGames.Suspens]: ({ sessionId, board, seats, spectators, viewerId, me }) => {
    const suspens = board as SuspensBoardView

    return {
      board: (
        <SuspensBoard
          sessionId={sessionId}
          board={suspens}
          faces={asPlayers(seats)}
          viewerId={viewerId}
          isSeated={me.isSeated}
        />
      ),
      feed: (
        <PlainLiveFeed
          sessionId={sessionId}
          board={suspens}
          copy={SUSPENS_FEED_COPY}
          players={[...seats, ...spectators]}
        />
      ),
    }
  },
  [PlayGames.Echo]: ({ sessionId, board, seats, spectators, viewerId, me }) => {
    const echo = board as EchoBoardView

    return {
      board: (
        <EchoBoard
          sessionId={sessionId}
          board={echo}
          faces={asPlayers(seats)}
          viewerId={viewerId}
          isSeated={me.isSeated}
        />
      ),
      feed: (
        <PlainLiveFeed
          sessionId={sessionId}
          board={echo}
          copy={ECHO_FEED_COPY}
          players={[...seats, ...spectators]}
        />
      ),
    }
  },
  [PlayGames.Glitch]: ({ sessionId, board, seats, spectators, viewerId, me }) => {
    const glitch = board as GlitchBoardView

    return {
      board: (
        <GlitchBoard
          sessionId={sessionId}
          board={glitch}
          faces={asPlayers(seats)}
          viewerId={viewerId}
          isSeated={me.isSeated}
        />
      ),
      feed: (
        <PlainLiveFeed
          sessionId={sessionId}
          board={glitch}
          copy={GLITCH_FEED_COPY}
          players={[...seats, ...spectators]}
        />
      ),
    }
  },
  [PlayGames.Jumble]: ({ sessionId, board, seats, spectators, viewerId, me }) => {
    const jumble = board as JumbleBoardView

    return {
      board: (
        <JumbleBoard
          sessionId={sessionId}
          board={jumble}
          faces={asPlayers(seats)}
          viewerId={viewerId}
          isSeated={me.isSeated}
        />
      ),
      feed: (
        <PlainLiveFeed
          sessionId={sessionId}
          board={jumble}
          copy={JUMBLE_FEED_COPY}
          players={[...seats, ...spectators]}
        />
      ),
    }
  },
  [PlayGames.Golf]: ({ sessionId, board, seats, spectators, viewerId, me, canInspect }) => {
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
          canInspect={Boolean(canInspect)}
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
  [PlayGames.Ludo]: ({ sessionId, board, seats, spectators, viewerId }) => {
    const ludo = board as LudoBoardView

    return {
      board: (
        <LudoBoard
          // A new game of a tournament starts from a clean screen
          key={sessionId}
          sessionId={sessionId}
          board={ludo}
          faces={seats.map(({ id, name, avatarUrl, isHost }) => ({
            accountId: id,
            name,
            avatarUrl,
            isHost: Boolean(isHost),
          }))}
          viewerId={viewerId}
        />
      ),
      feed: <LudoFeed sessionId={sessionId} board={ludo} players={[...seats, ...spectators]} />,
    }
  },
  [PlayGames.Naval]: ({ sessionId, board, seats, viewerId }) => ({
    board: (
      <NavalBoard
        sessionId={sessionId}
        board={board as NavalBoardView}
        faces={seats.map(({ id, name, avatarUrl, isBot }) => ({
          accountId: id,
          name,
          avatarUrl,
          isBot: Boolean(isBot),
        }))}
        viewerId={viewerId}
      />
    ),
    feed: null,
  }),
}
