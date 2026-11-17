import AppLink from '@/components/elements/navigation/AppLink'
import { PlayGameLogo } from '@/composites/play/brand/PlayGameLogo'
import { ROUTES } from '@/declarations/navigation'
import { PLAY_GAMES, PLAY_HUB_COPY } from '@/declarations/play'
import { PLAY_DESK } from '@/declarations/ui/variants'
import type { PlayGameName } from '@/utils/constants/play'

/**
 * Left bar of the desktop hub, one entry per playable game
 * @param {Object} props - Bar
 * @param {PlayGameName[]} props.games - Playable games, in order
 * @return {JSX.Element}
 */

export const PlayGamesNav = ({ games }: { games: PlayGameName[] }) => (
  <nav className={PLAY_DESK.side} aria-label={PLAY_HUB_COPY.navTitle}>
    <h2 className={PLAY_DESK.sideTitle}>{PLAY_HUB_COPY.navTitle}</h2>
    <ul className={PLAY_DESK.nav}>
      {games.map((game) => {
        const meta = PLAY_GAMES.get(game)

        return (
          <li key={game}>
            <AppLink href={ROUTES.playGame(meta.slug)} className={PLAY_DESK.navItem}>
              <PlayGameLogo game={game} className={PLAY_DESK.navLogo} />
              <span className={PLAY_DESK.navName}>{meta.label}</span>
            </AppLink>
          </li>
        )
      })}
    </ul>
  </nav>
)
