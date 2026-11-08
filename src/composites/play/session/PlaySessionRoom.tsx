'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'

import { Button } from '@/components/elements/actions/Button'
import AppLink from '@/components/elements/navigation/AppLink'
import { PlayGameChatBar } from '@/composites/play/mobile/PlayGameChatBar'
import { PlayGameMenu } from '@/composites/play/mobile/PlayGameMenu'
import { PlayGameLogo } from '@/composites/play/brand/PlayGameLogo'
import type { PlayFace } from '@/composites/play/session/BacSessionCrowd'
import { PlaySpectatorBar } from '@/composites/play/session/PlaySpectatorBar'
import { PlayStageKeys } from '@/composites/play/session/PlayStageKeys'
import { PlayChat } from '@/composites/play/session/PlayChat'
import type { PlayChatProps } from '@/composites/play/session/PlayChat'
import { PlayEndActions } from '@/composites/play/session/PlayEndActions'
import type { PlayRematchState } from '@/composites/play/session/PlayEndActions'
import { usePlayCrowd } from '@/core/hooks/data/play/usePlayCrowd'
import { usePlayMoves } from '@/core/hooks/data/play/usePlayMoves'
import { useBoxSpan } from '@/core/hooks/interaction/layout/useBoxSpan'
import { useIsMobileShell } from '@/core/hooks/interaction/layout/useBreakpoint'
import { usePlayFullscreen } from '@/core/hooks/interaction/state/usePlayFullscreen'
import { usePlayStageStore } from '@/core/store/playStage'
import { ROUTES } from '@/declarations/navigation'
import { BAC_SESSION_COPY, PLAY_GAMES, PLAY_HUB_COPY } from '@/declarations/play'
import { ICONS } from '@/declarations/ui/icons'
import { BAC_SESSION, BUTTON_STYLES, PLAY_GAME_BAR, PLAY_ROOM } from '@/declarations/ui/variants'
import { PlayGames } from '@/utils/constants/play'
import type { PlayGameName } from '@/utils/constants/play'
import { cn } from '@/utils/classnames'

export interface PlaySessionRoomProps {
  game: PlayGameName
  gameLabel: string
  gameSlug: string
  title: string
  players: PlayFace[]
  spectators: PlayFace[]
  me: { isSeated: boolean }
  chat: Omit<PlayChatProps, 'onFold' | 'isSide'>
  // Feed window under the chat
  feed: ReactNode
  // Offer once the game is over
  replay: { canReplay: boolean; rematch: PlayRematchState | null } | null
  // The game table
  children: ReactNode
}

/**
 * Running game: the table on the left, a column flush right with crowd, chat and feed
 * @param {PlaySessionRoomProps} props - Game, crowd and chat
 * @return {JSX.Element}
 */

export const PlaySessionRoom = ({
  game,
  gameLabel,
  gameSlug,
  title,
  players,
  spectators,
  me,
  chat,
  feed,
  replay,
  children,
}: PlaySessionRoomProps) => {
  const moves = usePlayMoves()
  const isMobile = useIsMobileShell()
  const crowd = usePlayCrowd(chat.sessionId, players, spectators)
  // Absent seats shown dimmed
  const faces = useMemo(
    () => players.map((player) => ({ ...player, isAway: crowd.away.has(player.id) })),
    [players, crowd.away]
  )
  // Chat and feed fold together
  const [isSideOpen, setSideOpen] = useState(true)
  const BackIcon = ICONS.playBack
  const LeaveIcon = ICONS.playLeave
  const UnfoldIcon = ICONS.playUnfold
  const rootRef = useRef<HTMLDivElement>(null)
  const boxRef = useRef<HTMLElement>(null)
  const { isFullscreen, isChatOpen, toggleChat } = usePlayStageStore()
  usePlayFullscreen(rootRef)
  // Windowed: the column stands level with the table
  const span = useBoxSpan(boxRef, !isFullscreen)
  // Every game opens full screen
  useEffect(() => usePlayStageStore.getState().enter(), [])
  // Full screen: column slides over the table, never folded to a rail
  const isColumn = isFullscreen || isSideOpen
  // Golf keeps its own keys in the course HUD
  const hasKeys = game !== PlayGames.Golf
  const { ground } = PLAY_GAMES.get(game)

  return (
    <div
      ref={rootRef}
      data-play-stage
      style={{ viewTransitionName: 'play-room' }}
      className={cn(
        BAC_SESSION.page,
        isFullscreen
          ? BAC_SESSION.pageFull
          : isSideOpen
            ? BAC_SESSION.pageOpen
            : BAC_SESSION.pageFolded
      )}
    >
      {/* Full screen is its own room, the game ground marked inside it */}
      {isFullscreen && ground && (
        <i className={cn(ground, BAC_SESSION.groundMark)} aria-hidden="true" />
      )}
      <div
        className={cn(
          BAC_SESSION.main,
          isFullscreen && [BAC_SESSION.mainFull, isChatOpen && BAC_SESSION.mainBeside],
          isMobile && [PLAY_GAME_BAR.room, hasKeys && PLAY_GAME_BAR.roomKeys]
        )}
      >
        <div className={cn(BAC_SESSION.top, isFullscreen && 'hidden')}>
          <div className={BAC_SESSION.exits}>
            <AppLink
              href={ROUTES.playGame(gameSlug)}
              className={cn(BUTTON_STYLES.base, BUTTON_STYLES.arcadeGhost, BAC_SESSION.exit)}
            >
              <BackIcon className={BAC_SESSION.exitIcon} aria-hidden="true" />
              {PLAY_HUB_COPY.backToHub}
            </AppLink>
            {me.isSeated && (
              <Button
                variant="arcadeDanger"
                className={BAC_SESSION.exit}
                isLoading={moves.isSaving}
                onClick={() => void moves.leave(chat.sessionId)}
              >
                <LeaveIcon className={BAC_SESSION.exitIcon} aria-hidden="true" />
                {PLAY_HUB_COPY.leave}
              </Button>
            )}
          </div>
          <div className={BAC_SESSION.identity}>
            {hasKeys && !isFullscreen && <PlayStageKeys game={game} />}
            <div className={BAC_SESSION.titles}>
              <h1 className={BAC_SESSION.title}>{title}</h1>
              <p className={PLAY_ROOM.game}>{gameLabel}</p>
            </div>
            <PlayGameLogo game={game} className={BAC_SESSION.logo} />
          </div>
        </div>

        {crowd.isLost && (
          <p role="status" className={PLAY_ROOM.lost}>
            {PLAY_HUB_COPY.reconnecting}
          </p>
        )}
        {!me.isSeated && <PlaySpectatorBar players={faces} />}
        {hasKeys && isFullscreen && <PlayStageKeys game={game} />}
        <section
          ref={boxRef}
          className={
            isFullscreen
              ? cn(BAC_SESSION.boxFull, hasKeys && BAC_SESSION.boxFullPad)
              : BAC_SESSION.box
          }
        >
          {children}
        </section>
        {replay && (
          <PlayEndActions
            game={game}
            gameSlug={gameSlug}
            sessionId={chat.sessionId}
            isSeated={me.isSeated}
            {...replay}
          />
        )}
      </div>

      {isMobile ? (
        <>
          {hasKeys && (
            <PlayGameMenu sessionId={chat.sessionId} gameSlug={gameSlug} isSeated={me.isSeated} />
          )}
          <PlayGameChatBar
            chat={chat}
            crowd={{ players: faces, spectators: crowd.spectators }}
            feed={feed}
          />
        </>
      ) : (
        <aside
          className={cn(
            BAC_SESSION.side,
            span && BAC_SESSION.sideSpan,
            isFullscreen
              ? [
                  BAC_SESSION.sideFull,
                  hasKeys ? BAC_SESSION.sideFullPad : BAC_SESSION.sideFullBleed,
                  isChatOpen ? BAC_SESSION.sideShown : BAC_SESSION.sideHidden,
                ]
              : isSideOpen
                ? BAC_SESSION.sideOpen
                : BAC_SESSION.sideFolded
          )}
          style={span}
          inert={isFullscreen && !isChatOpen}
        >
          {isColumn ? (
            <>
              <PlayChat
                {...chat}
                isSide
                crowd={{ players: faces, spectators: crowd.spectators }}
                feed={feed}
                onFold={isFullscreen ? toggleChat : () => setSideOpen(false)}
              />
            </>
          ) : (
            <div className={BAC_SESSION.rail}>
              <button
                type="button"
                className={BAC_SESSION.fold}
                aria-label={BAC_SESSION_COPY.unfoldSide}
                onClick={() => setSideOpen(true)}
              >
                <UnfoldIcon className={BAC_SESSION.foldIcon} aria-hidden="true" />
              </button>
            </div>
          )}
        </aside>
      )}
    </div>
  )
}
