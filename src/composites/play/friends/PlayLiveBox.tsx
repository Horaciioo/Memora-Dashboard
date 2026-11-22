'use client'

import { PlayRecentRow } from '@/composites/play/friends/PlayRecentRow'
import { PlayLiveTables } from '@/composites/play/hub/lobby/PlayLiveTables'
import { usePlayShelf } from '@/core/hooks/interaction/state/play/usePlayShelf'
import { useScrollFade } from '@/core/hooks/interaction/state/play/useScrollFade'
import {
  PLAY_FRIENDS_COPY,
  PLAY_GAMES,
  PLAY_LAUNCHER_COPY,
  PLAY_MOBILE_COPY,
} from '@/declarations/play'
import { PLAY_FRIENDS } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'
import type { PlayLobbyCard, PlayPresence } from '@/types/play'

export interface PlayLiveBoxProps {
  tables: PlayLobbyCard[]
  presence: PlayPresence | null
  isLocked: boolean
}

/**
 * Public games going on now, an empty state when there are none
 * @param {PlayLiveBoxProps} props - Tables, own game, lock
 * @return {JSX.Element}
 */

export const PlayLiveBox = ({ tables, presence, isLocked }: PlayLiveBoxProps) => {
  const shelf = usePlayShelf()
  const recents = shelf.recents.filter(PLAY_GAMES.has)
  const { ref: fadeRef, onScroll, hasMore } = useScrollFade([recents.length, tables.length])
  const publicTables = tables.filter((table) => !table.isOverseen)

  return (
    <section className={PLAY_FRIENDS.live} aria-label={PLAY_MOBILE_COPY.tabLive}>
      <h2 className={PLAY_FRIENDS.title}>{PLAY_MOBILE_COPY.tabLive}</h2>
      <div
        ref={fadeRef}
        className={cn(PLAY_FRIENDS.liveBody, hasMore && PLAY_FRIENDS.fade)}
        onScroll={onScroll}
      >
        {recents.length > 0 && (
          <div className={PLAY_FRIENDS.section}>
            <h3 className={PLAY_FRIENDS.sectionTitle}>{PLAY_LAUNCHER_COPY.resume}</h3>
            {recents.map((game) => (
              <PlayRecentRow
                key={game}
                game={game}
                onOpen={() => shelf.pushRecent(game)}
                onForget={() => shelf.removeRecent(game)}
              />
            ))}
          </div>
        )}
        {publicTables.length === 0 ? (
          <p className={PLAY_FRIENDS.empty}>{PLAY_FRIENDS_COPY.noneLive}</p>
        ) : (
          <PlayLiveTables
            isFlat
            hasGame
            title={PLAY_MOBILE_COPY.tabLive}
            empty={PLAY_FRIENDS_COPY.noneLive}
            tables={publicTables}
            mineId={presence?.sessionId}
            isLocked={isLocked}
          />
        )}
      </div>
    </section>
  )
}
