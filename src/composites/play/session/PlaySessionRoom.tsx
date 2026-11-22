'use client'

import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'

import { PlayGameChatBar } from '@/composites/play/mobile/PlayGameChatBar'
import { PlayGameMenu } from '@/composites/play/mobile/PlayGameMenu'
import type { PlayFace } from '@/composites/play/session/BacSessionCrowd'
import { PlaySpectatorBar } from '@/composites/play/session/PlaySpectatorBar'
import { PlayStageKeys } from '@/composites/play/session/PlayStageKeys'
import { PlayLoading } from '@/composites/play/loading/PlayLoading'
import { PlayChat } from '@/composites/play/session/PlayChat'
import type { PlayChatProps } from '@/composites/play/session/PlayChat'
import { PlayEndBackdrop } from '@/composites/play/results/end/PlayEndBackdrop'
import { PlayEndFacts } from '@/composites/play/results/end/PlayEndFacts'
import { PlayEndHeader } from '@/composites/play/results/end/PlayEndHeader'
import { PlayEndMe } from '@/composites/play/results/end/PlayEndMe'
import { PlayEndIntro } from '@/composites/play/results/end/PlayEndIntro'
import { PlayEndActions } from '@/composites/play/session/PlayEndActions'
import type { PlayRematchState, PlayTournamentStep } from '@/composites/play/session/PlayEndActions'
import type { PlayEndReport, PlayRewardView } from '@/types/play'
import { usePlayCrowd } from '@/core/hooks/data/play/usePlayCrowd'
import { useIsMobileShell } from '@/core/hooks/interaction/layout/measure/useBreakpoint'
import { useHeightVar } from '@/core/hooks/interaction/layout/measure/useHeightVar'
import { usePlaySessionLoad } from '@/core/hooks/interaction/state/play/usePlaySessionLoad'
import { usePlayFullscreen } from '@/core/hooks/interaction/state/play/usePlayFullscreen'
import { usePlaySessionLoadStore } from '@/core/store/play/playSessionLoad'
import { usePlayStageStore } from '@/core/store/play/playStage'
import {
  PLAY_END_TIMING,
  PLAY_GAMES,
  PLAY_HUB_COPY,
  PLAY_HUD_GAMES,
  PLAY_HUD_SKINS,
} from '@/declarations/play'
import { BAC_SESSION, PLAY_END_PAGE, PLAY_GAME_BAR, PLAY_ROOM } from '@/declarations/ui/variants'
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
  // XP the game paid the reader
  reward?: PlayRewardView | null
  // Figures of the finished game
  report?: PlayEndReport | null
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
  reward = null,
  report = null,
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
  const chatRef = useHeightVar('--play-chat-h')
  usePlayFullscreen()
  // Every game opens on the whole page
  useEffect(() => usePlayStageStore.getState().enter(), [])
  // These games keep their keys and chat in their own HUD
  const isHud = PLAY_HUD_GAMES.has(game)
  const hasKeys = !isHud
  const { ground, tone } = PLAY_GAMES.get(game)
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
        {hasKeys && (
          <PlayStageKeys
            game={game}
            sessionId={chat.sessionId}
            gameSlug={gameSlug}
            isSeated={me.isSeated}
            isHost={me.isHost}
            isOver={replay !== null}
          />
        )}
        <div
          className={replay ? PLAY_END_PAGE.root : 'contents'}
          style={
            replay
              ? ({
                  '--end-tone': `var(${tone})`,
                  '--end-intro': `${PLAY_END_TIMING.intro}ms`,
                } as CSSProperties)
              : undefined
          }
        >
          {replay && (
            <>
              <PlayEndBackdrop />
              <PlayEndIntro game={game} winner={report?.winner ?? null} />
              <PlayEndHeader game={game} />
            </>
          )}
          <div className={replay ? PLAY_END_PAGE.body : 'contents'}>
            {replay && (
              <PlayEndMe
                game={game}
                reward={reward}
                place={report?.place ?? null}
                career={report?.career ?? null}
              />
            )}
            <section
              data-play-box
              className={cn(
                'relative',
                BAC_SESSION.boxFull,
                isHud ? BAC_SESSION.boxFullHud : BAC_SESSION.boxFullPad,
                replay && PLAY_END_PAGE.result
              )}
            >
              {children}
            </section>
            {replay && (
              <PlayEndFacts
                game={game}
                stats={report?.stats ?? []}
                awards={report?.awards ?? []}
                trophies={report?.trophies ?? []}
              />
            )}
          </div>
        </div>
        {replay && (
          <div className="play-end-rise" style={{ animationDelay: `${PLAY_END_TIMING.actions}ms` }}>
            <PlayEndActions
              game={game}
              gameSlug={gameSlug}
              sessionId={chat.sessionId}
              isSeated={me.isSeated}
              {...replay}
            />
          </div>
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
          <PlayGameChatBar chat={{ ...chat, load }} crowd={crowdFaces} feed={feed} game={game} />
        </>
      ) : isHud ? (
        // Last lines only, in the HUD corner, kept mounted so the lines keep coming
        <div
          ref={chatRef}
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
