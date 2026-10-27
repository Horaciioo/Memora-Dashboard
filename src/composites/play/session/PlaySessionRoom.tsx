'use client'

import { useRef, useState } from 'react'
import type { ReactNode } from 'react'

import { Button } from '@/components/elements/actions/Button'
import AppLink from '@/components/elements/navigation/AppLink'
import { PlayGameLogo } from '@/composites/play/brand/PlayGameLogo'
import { BacSessionCrowd } from '@/composites/play/session/BacSessionCrowd'
import type { PlayFace } from '@/composites/play/session/BacSessionCrowd'
import { PlayStageKeys } from '@/composites/play/session/PlayStageKeys'
import { PlayChat } from '@/composites/play/session/PlayChat'
import type { PlayChatProps } from '@/composites/play/session/PlayChat'
import { PlayReplay } from '@/composites/play/session/PlayReplay'
import type { PlayReplayState } from '@/composites/play/session/PlayReplay'
import { usePlayMoves } from '@/core/hooks/data/play/usePlayMoves'
import { usePlayFullscreen } from '@/core/hooks/interaction/state/usePlayFullscreen'
import { usePlayStageStore } from '@/core/store/playStage'
import { ROUTES } from '@/declarations/navigation'
import { BAC_SESSION_COPY, PLAY_HUB_COPY } from '@/declarations/play'
import { ICONS } from '@/declarations/ui/icons'
import { BAC_SESSION, BUTTON_STYLES, PLAY_ROOM } from '@/declarations/ui/variants'
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
  replay: PlayReplayState | null
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
  // Chat and feed fold together
  const [isSideOpen, setSideOpen] = useState(true)
  const BackIcon = ICONS.playBack
  const LeaveIcon = ICONS.playLeave
  const UnfoldIcon = ICONS.playUnfold
  const rootRef = useRef<HTMLDivElement>(null)
  const { isFullscreen, isChatOpen, toggleChat } = usePlayStageStore()
  usePlayFullscreen(rootRef)
  // Full screen: column slides over the table, never folded to a rail
  const isColumn = isFullscreen || isSideOpen
  // Golf keeps its own keys in the course HUD
  const hasKeys = game !== PlayGames.Golf

  return (
    <div
      ref={rootRef}
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
      <div className={cn(BAC_SESSION.main, isFullscreen && BAC_SESSION.mainFull)}>
        <div className={cn(BAC_SESSION.top, isFullscreen && 'hidden')}>
          <div className={BAC_SESSION.exits}>
            <AppLink
              href={ROUTES.playGame(gameSlug)}
              className={cn(BUTTON_STYLES.base, BUTTON_STYLES.arcadeGhost, BAC_SESSION.exit)}
            >
              <BackIcon className={BAC_SESSION.exitIcon} aria-hidden="true" />
              {PLAY_HUB_COPY.backToHub}
            </AppLink>
            {replay && (
              <PlayReplay sessionId={chat.sessionId} className={BAC_SESSION.exit} {...replay} />
            )}
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
            {hasKeys && !isFullscreen && <PlayStageKeys />}
            <div className={BAC_SESSION.titles}>
              <h1 className={BAC_SESSION.title}>{title}</h1>
              <p className={PLAY_ROOM.game}>{gameLabel}</p>
            </div>
            <PlayGameLogo game={game} className={BAC_SESSION.logo} />
          </div>
        </div>

        {hasKeys && isFullscreen && <PlayStageKeys />}
        <section
          className={
            isFullscreen
              ? cn(BAC_SESSION.boxFull, hasKeys && BAC_SESSION.boxFullPad)
              : BAC_SESSION.box
          }
        >
          {children}
        </section>
      </div>

      <aside
        className={cn(
          BAC_SESSION.side,
          isFullscreen
            ? [BAC_SESSION.sideFull, isChatOpen ? BAC_SESSION.sideShown : BAC_SESSION.sideHidden]
            : isSideOpen
              ? BAC_SESSION.sideOpen
              : BAC_SESSION.sideFolded
        )}
        inert={isFullscreen && !isChatOpen}
      >
        {isColumn ? (
          <>
            <BacSessionCrowd players={players} spectators={spectators} />
            <PlayChat
              {...chat}
              isSide
              onFold={isFullscreen ? toggleChat : () => setSideOpen(false)}
            />
            {feed}
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
    </div>
  )
}
