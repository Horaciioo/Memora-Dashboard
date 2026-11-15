'use client'

import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

import { PlayGameChatBar } from '@/composites/play/mobile/PlayGameChatBar'
import { PlayGameMenu } from '@/composites/play/mobile/PlayGameMenu'
import type { PlayFace } from '@/composites/play/session/BacSessionCrowd'
import { PlaySpectatorBar } from '@/composites/play/session/PlaySpectatorBar'
import { PlayStageKeys } from '@/composites/play/session/PlayStageKeys'
import { PlayLoading } from '@/composites/play/loading/PlayLoading'
import { PlayChat } from '@/composites/play/session/PlayChat'
import type { PlayChatProps } from '@/composites/play/session/PlayChat'
import { PlayEndActions } from '@/composites/play/session/PlayEndActions'
import type { PlayRematchState, PlayTournamentStep } from '@/composites/play/session/PlayEndActions'
import { usePlayCrowd } from '@/core/hooks/data/play/usePlayCrowd'
import { useIsMobileShell } from '@/core/hooks/interaction/layout/measure/useBreakpoint'
import { usePlaySessionLoad } from '@/core/hooks/interaction/state/play/usePlaySessionLoad'
import { usePlayFullscreen } from '@/core/hooks/interaction/state/play/usePlayFullscreen'
import { usePlaySessionLoadStore } from '@/core/store/play/playSessionLoad'
import { usePlayStageStore } from '@/core/store/play/playStage'
import { PLAY_GAMES, PLAY_HUB_COPY, PLAY_HUD_GAMES, PLAY_HUD_SKINS } from '@/declarations/play'
import { BAC_SESSION, PLAY_GAME_BAR, PLAY_ROOM } from '@/declarations/ui/variants'
import { PlayGames } from '@/utils/constants/play'
import type { PlayGameName } from '@/utils/constants/play'
import { cn } from '@/utils/classnames'

export interface PlaySessionRoomProps {
  game: PlayGameName
  gameSlug: string
  players: PlayFace[]
  spectators: PlayFace[]
  me: { isSeated: boolean; isHost: boolean }
  chat: Omit<PlayChatProps, 'onFold' | 'isSide'>
  // Feed window under the chat
  feed: ReactNode
  // Offer once the game is over
  replay: {
    canReplay: boolean
    rematch: PlayRematchState | null
    tournament?: PlayTournamentStep | null
  } | null
  // The game table
  children: ReactNode
}

/**
 * Running game: the table fills the page, chat laid over it, a column flush right for the games without a HUD
 * @param {PlaySessionRoomProps} props - Game, crowd and chat
 * @return {JSX.Element}
 */

export const PlaySessionRoom = ({
  game,
  gameSlug,
  players,
  spectators,
  me,
  chat,
  feed,
  replay,
  children,
}: PlaySessionRoomProps) => {
  const isMobile = useIsMobileShell()
  const load = usePlaySessionLoad()
  // Screen covers the table until it is loaded, or has failed and the feed says why
  const [isCovered, setCovered] = useState(true)
  const setCover = usePlaySessionLoadStore((state) => state.setCover)
  // Boards hold their countdown until the screen has left
  useEffect(() => {
    setCover(isCovered)

    return () => setCover(false)
  }, [isCovered, setCover])
  const crowd = usePlayCrowd(chat.sessionId, players, spectators)
  // Absent seats shown dimmed
  const faces = useMemo(
    () => players.map((player) => ({ ...player, isAway: crowd.away.has(player.id) })),
    [players, crowd.away]
  )
  const { isChatOpen, toggleChat } = usePlayStageStore()
  usePlayFullscreen()
  // Every game opens on the whole page
  useEffect(() => usePlayStageStore.getState().enter(), [])
  // These games keep their keys and chat in their own HUD
  const isHud = PLAY_HUD_GAMES.has(game)
  const hasKeys = !isHud
  const { ground } = PLAY_GAMES.get(game)
  // Chat open: the keys leave the table for the column
  const isDocked = isChatOpen && !isMobile
  // Ludo: the board takes the whole screen, no panel around it
  const isBare = game === PlayGames.Ludo
  const crowdFaces = { players: faces, spectators: crowd.spectators }

  return (
    <div data-play-stage className={BAC_SESSION.pageFull}>
      {/* Own room, the game ground marked inside it */}
      {ground && <i className={cn(ground, BAC_SESSION.groundMark)} aria-hidden="true" />}
      {isCovered && (
        <PlayLoading
          game={game}
          percent={load.percent}
          isDone={load.status !== 'loading'}
          isInstant
          // Only a column beside the table is left uncovered, the HUD chat is covered too
          hasChat={!isMobile && !isHud && isChatOpen}
          onExited={() => setCovered(false)}
        />
      )}
      <div
        className={cn(
          BAC_SESSION.mainFull,
          hasKeys && isChatOpen && BAC_SESSION.mainBeside,
          isMobile && [PLAY_GAME_BAR.room, hasKeys && PLAY_GAME_BAR.roomKeys]
        )}
      >
        {crowd.isLost && (
          <p role="status" className={PLAY_ROOM.lost}>
            {PLAY_HUB_COPY.reconnecting}
          </p>
        )}
        {!me.isSeated && <PlaySpectatorBar players={faces} />}
        {hasKeys && !isDocked && (
          <PlayStageKeys
            game={game}
            sessionId={chat.sessionId}
            gameSlug={gameSlug}
            isSeated={me.isSeated}
            isHost={me.isHost}
            isOver={replay !== null}
          />
        )}
        <section
          data-play-box
          className={cn(
            'relative',
            BAC_SESSION.boxFull,
            isHud
              ? BAC_SESSION.boxFullHud
              : isBare
                ? BAC_SESSION.boxFullBare
                : BAC_SESSION.boxFullPad
          )}
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
            <PlayGameMenu
              sessionId={chat.sessionId}
              gameSlug={gameSlug}
              isSeated={me.isSeated}
              isHost={me.isHost}
              isOver={replay !== null}
            />
          )}
          <PlayGameChatBar chat={{ ...chat, load }} crowd={crowdFaces} feed={feed} />
        </>
      ) : isHud ? (
        // Last lines only, in the HUD corner, kept mounted so the lines keep coming
        <div
          data-hud={game.toLowerCase()}
          className={cn(BAC_SESSION.hudChat, PLAY_HUD_SKINS.get(game), !isChatOpen && 'hidden')}
        >
          <PlayChat {...chat} load={load} isHud initialTab="all" feed={feed} />
        </div>
      ) : (
        <aside
          className={cn(
            BAC_SESSION.side,
            BAC_SESSION.sideFull,
            BAC_SESSION.sideFullPad,
            isChatOpen ? BAC_SESSION.sideShown : BAC_SESSION.sideHidden
          )}
          inert={!isChatOpen}
        >
          {hasKeys && isDocked && (
            <PlayStageKeys
              game={game}
              sessionId={chat.sessionId}
              gameSlug={gameSlug}
              isSeated={me.isSeated}
              isHost={me.isHost}
              isOver={replay !== null}
              isDocked
            />
          )}
          <PlayChat
            {...chat}
            load={load}
            isSide
            crowd={crowdFaces}
            feed={feed}
            onFold={toggleChat}
          />
        </aside>
      )}
    </div>
  )
}
