import type { CSSProperties } from 'react'

import AppLink from '@/components/elements/navigation/AppLink'
import { PlayGameLogo } from '@/composites/play/brand/PlayGameLogo'
import { ROUTES } from '@/declarations/navigation'
import { PLAY_GAMES, PLAY_HUB_COPY, PLAY_MOBILE_COPY } from '@/declarations/play'
import { PLAY_CAREER } from '@/declarations/ui/variants'
import type { PlayGameName } from '@/utils/constants/play'
import { cn } from '@/utils/classnames'

/**
 * Game buttons, all games first
 * @param {Object} props - Picker
 * @param {PlayGameName | null} props.current - Chosen game
 * @return {JSX.Element}
 */

export const PlayGamePicker = ({ current }: { current: PlayGameName | null }) => (
  <nav aria-label={PLAY_MOBILE_COPY.rankingGames} className={PLAY_CAREER.picker}>
    <AppLink
      href={ROUTES.playStats}
      aria-current={current === null ? 'page' : undefined}
      className={cn(PLAY_CAREER.pick, current === null && PLAY_CAREER.pickOn)}
    >
      {PLAY_HUB_COPY.allGames}
    </AppLink>
    {PLAY_GAMES.keys
      .filter((game) => PLAY_GAMES.get(game).playable)
      .map((game) => (
        <AppLink
          key={game}
          href={ROUTES.playStatsGame(PLAY_GAMES.get(game).slug)}
          aria-current={current === game ? 'page' : undefined}
          style={{ '--game': `var(${PLAY_GAMES.get(game).tone})` } as CSSProperties}
          className={cn(PLAY_CAREER.pick, current === game && PLAY_CAREER.pickGame)}
        >
          <PlayGameLogo game={game} className={PLAY_CAREER.pickLogo} />
          {PLAY_GAMES.label(game)}
        </AppLink>
      ))}
  </nav>
)
