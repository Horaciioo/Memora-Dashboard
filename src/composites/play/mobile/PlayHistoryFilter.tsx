import AppLink from '@/components/elements/navigation/AppLink'
import { ROUTES } from '@/declarations/navigation'
import { PLAY_GAMES, PLAY_HISTORY_COPY } from '@/declarations/play'
import { PLAY_HISTORY } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'
import type { PlayGameName } from '@/utils/constants/play'

/**
 * One chip per game, plus all of them
 * @param {Object} props - Filter
 * @param {PlayGameName | null} props.game - Game on, null for all
 * @return {JSX.Element}
 */

export const PlayHistoryFilter = ({ game }: { game: PlayGameName | null }) => {
  const chip = (href: string, label: string, isOn: boolean) => (
    <AppLink
      key={href}
      href={href}
      aria-current={isOn ? 'page' : undefined}
      className={cn(PLAY_HISTORY.chip, isOn && PLAY_HISTORY.chipOn)}
    >
      {label}
    </AppLink>
  )

  return (
    <nav aria-label={PLAY_HISTORY_COPY.filterLabel} className={PLAY_HISTORY.chips}>
      {chip(ROUTES.playHistory(), PLAY_HISTORY_COPY.filterAll, game === null)}
      {PLAY_GAMES.keys.map((key) =>
        chip(ROUTES.playHistory(PLAY_GAMES.get(key).slug), PLAY_GAMES.label(key), key === game)
      )}
    </nav>
  )
}
