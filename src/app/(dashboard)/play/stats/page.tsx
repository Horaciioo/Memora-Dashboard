import type { Metadata } from 'next'

import AppLink from '@/components/elements/navigation/AppLink'
import { PlayFold } from '@/composites/play/mobile/PlayFold'
import { PlayPageTitle } from '@/composites/play/hub/PlayPageTitle'
import { PlaySignal } from '@/composites/play/hub/notices/PlaySignal'
import { PlayCareerPanels } from '@/composites/play/member/stats/PlayCareerPanels'
import { PlayCareerHero } from '@/composites/play/member/stats/PlayCareerHero'
import { PlayGamePicker } from '@/composites/play/member/stats/PlayGamePicker'
import { PlayMastery } from '@/composites/play/member/stats/PlayMastery'
import { PlayPinnedTrophies } from '@/composites/play/member/stats/PlayPinnedTrophies'
import { readPlayProfile } from '@/core/services/play'
import { requirePermission } from '@/core/wrappers/requireUser'
import { ROUTES } from '@/declarations/navigation'
import { PLAY_HEAD_COPY, PLAY_HUB_COPY, playGameOfSlug } from '@/declarations/play'
import { PLAY_TOPICS } from '@/declarations/play/topics'
import { PLAY_HEAD, PLAY_PAGE } from '@/declarations/ui/variants'
import { Permissions } from '@/utils/constants/permissions'

export const metadata: Metadata = { title: PLAY_HUB_COPY.statsTitle }

interface PlayStatsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

/**
 * Own progression, one ribbon and box per topic
 * @param {PlayStatsPageProps} props - Query with the game slug
 * @return {Promise<JSX.Element>} - Stats page
 */

export default async function PlayStatsPage({ searchParams }: PlayStatsPageProps) {
  const { session } = await requirePermission(Permissions.PlayAccess)
  const query = await searchParams
  const asked = typeof query.game === 'string' ? playGameOfSlug(query.game) : null
  const profile = await readPlayProfile(session.id)
  // No game asked: every game together
  const entry = profile.games.find((item) => item.game === asked)
  const game = entry ? asked : null
  const totals = entry ?? profile.global
  const player = { name: session.displayName, avatarUrl: session.avatarUrl }

  return (
    <div className={PLAY_PAGE.frame}>
      <PlaySignal topic={PLAY_TOPICS.lobbies} />
      <PlayPageTitle
        page="stats"
        aside={null}
        body={
          <>
            <PlayGamePicker current={game} games={profile.games} />
            <PlayCareerHero totals={totals} player={player} />
          </>
        }
      >
        {PLAY_HUB_COPY.statsTitle}
      </PlayPageTitle>
      <div className={PLAY_PAGE.grid}>
        <PlayCareerPanels totals={totals} />
        {!game && (
          <PlayPageTitle
            heading="h2"
            className={PLAY_PAGE.cellWide}
            action={
              <AppLink href={ROUTES.playTrophies} className={PLAY_HEAD.panelLink}>
                {PLAY_HEAD_COPY.manage}
              </AppLink>
            }
            body={<PlayPinnedTrophies pins={profile.pins} />}
          >
            {PLAY_HEAD_COPY.pinsTitle}
          </PlayPageTitle>
        )}
        {!game && (
          <PlayFold title={PLAY_HUB_COPY.sectionMastery} isWide isClosed>
            <PlayMastery games={profile.games} />
          </PlayFold>
        )}
      </div>
    </div>
  )
}
