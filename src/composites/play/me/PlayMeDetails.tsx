import AppLink from '@/components/elements/navigation/AppLink'
import { logout } from '@/app/login/actions'
import { PlayMeFigures } from '@/composites/play/me/PlayMeFigures'
import { PlayTopGames } from '@/composites/play/member/stats/PlayTopGames'
import { ROUTES } from '@/declarations/navigation'
import { PLAY_ME_COPY, PLAY_SETTINGS } from '@/declarations/play'
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
      <PlayTopGames games={topGames} />
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
