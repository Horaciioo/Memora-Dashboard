import AppLink from '@/components/elements/navigation/AppLink'
import { logout } from '@/app/login/actions'
import { PlayMeFigures, PlayMeRecord } from '@/composites/play/me/PlayMeFigures'
import { PlayGameLogo } from '@/composites/play/brand/PlayGameLogo'
import { ROUTES } from '@/declarations/navigation'
import {
  fillPlayMessage,
  PLAY_GAMES,
  PLAY_ME_COPY,
  PLAY_PROFILE_COPY,
  PLAY_SETTINGS,
} from '@/declarations/play'
import { AUTH_COPY } from '@/declarations/ui/copy/auth'
import { PLAY_FOLD, PLAY_ME, PLAY_PROFILE } from '@/declarations/ui/variants'
import type { PlayProfileView } from '@/types/play'
import { cn } from '@/utils/classnames'

/**
 * Unfolded card: figures, most played games, links
 * @param {Object} props - Profile
 * @param {PlayProfileView} props.profile - Stats of the player
 * @return {JSX.Element}
 */

export const PlayMeDetails = ({ profile }: { profile: PlayProfileView }) => {
  const topGames = profile.games
    .filter((entry) => entry.played > 0)
    .sort((left, right) => right.played - left.played)
    .slice(0, PLAY_SETTINGS.sidebarGames)
    .map(({ game, played }) => ({ game, played }))

  return (
    <div className={cn(PLAY_FOLD.body, PLAY_ME.body)}>
      <PlayMeFigures totals={profile.global} />
      <div className={PLAY_ME.pair}>
        <PlayMeRecord totals={profile.global} />
        {topGames.slice(0, 1).map(({ game, played }) => (
          <div key={game} className={PLAY_ME.best}>
            <PlayGameLogo game={game} className={PLAY_ME.bestLogo} />
            <span className={PLAY_ME.bestText}>
              <span className={PLAY_ME.bestName}>{PLAY_GAMES.label(game)}</span>
              <span className={PLAY_PROFILE.rowNote}>
                {fillPlayMessage(PLAY_PROFILE_COPY.topGamesPlayed, { count: played })}
              </span>
            </span>
          </div>
        ))}
      </div>
      <div className={PLAY_ME.links}>
        <AppLink href={ROUTES.playStats} className={PLAY_PROFILE.more}>
          {PLAY_ME_COPY.allStats}
        </AppLink>
        <AppLink href={ROUTES.preferencesPlay} className={PLAY_PROFILE.more}>
          {PLAY_ME_COPY.settings}
        </AppLink>
        <form action={logout}>
          <button type="submit" className={cn(PLAY_PROFILE.more, 'text-[var(--color-danger)]')}>
            {AUTH_COPY.signOut}
          </button>
        </form>
      </div>
    </div>
  )
}
