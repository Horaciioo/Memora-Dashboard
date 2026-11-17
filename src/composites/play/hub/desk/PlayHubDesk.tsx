'use client'

import { PlayDeskStage } from '@/composites/play/hub/desk/PlayDeskStage'
import { PlayFriends } from '@/composites/play/hub/desk/PlayFriends'
import { PlayGamesNav } from '@/composites/play/hub/desk/PlayGamesNav'
import { PlayGameGrid } from '@/composites/play/hub/PlayGameGrid'
import {
  useIsMobileShell,
  useMediaQuery,
} from '@/core/hooks/interaction/layout/measure/useBreakpoint'
import { splitPlayGames } from '@/core/lib/play/hubGames'
import type { PlayHubGame } from '@/core/lib/play/hubGames'
import { BREAKPOINTS } from '@/declarations/ui/responsive'
import { PLAY_DESK } from '@/declarations/ui/variants'
import type { PlayLobbyCard, PlayRecentPlayer } from '@/types/play'

// Below it the bars give way to the stage alone
const BARS_QUERY = `(width < ${BREAKPOINTS.xl}px)`

export interface PlayHubDeskProps {
  games: PlayHubGame[]
  recents: PlayRecentPlayer[]
  tables: PlayLobbyCard[]
}

/**
 * Play home: games bar, featured games with the cards below, players column. The phone keeps its posters
 * @param {PlayHubDeskProps} props - Catalogue, former opponents, tables
 * @return {JSX.Element}
 */

export const PlayHubDesk = ({ games, recents, tables }: PlayHubDeskProps) => {
  const isMobile = useIsMobileShell()
  const isNarrow = useMediaQuery(BARS_QUERY)
  if (isMobile) return <PlayGameGrid games={games} />

  const { featured, rest } = splitPlayGames(games)
  const stage = <PlayDeskStage featured={featured} rest={rest} />
  if (isNarrow) return stage

  const playable = [
    ...featured,
    ...rest.filter((entry) => entry.playable).map((entry) => entry.game),
  ]

  return (
    <div className={PLAY_DESK.layout}>
      <PlayGamesNav games={playable} />
      {stage}
      <PlayFriends recents={recents} tables={tables} />
    </div>
  )
}
