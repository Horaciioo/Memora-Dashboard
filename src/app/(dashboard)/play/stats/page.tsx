import type { Metadata } from 'next'

import { PlayPageTitle } from '@/composites/play/hub/PlayPageTitle'
import { PlaySignal } from '@/composites/play/hub/notices/PlaySignal'
import { PlayCareerCounters } from '@/composites/play/member/stats/PlayCareerCounters'
import { PlayCareerHero } from '@/composites/play/member/stats/PlayCareerHero'
import { PlayCareerRecord } from '@/composites/play/member/stats/PlayCareerRecord'
import { PlayGamePicker } from '@/composites/play/member/stats/PlayGamePicker'
import { PlayMastery } from '@/composites/play/member/stats/PlayMastery'
import { PlayPinnedTrophies } from '@/composites/play/member/stats/PlayPinnedTrophies'
import { readPlayProfile } from '@/core/services/play'
import { requirePermission } from '@/core/wrappers/requireUser'
import { PLAY_HUB_COPY, playGameOfSlug } from '@/declarations/play'
import { PLAY_TOPICS } from '@/declarations/play/topics'
import { PLAY_CAREER } from '@/declarations/ui/variants'
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
    <div className={PLAY_CAREER.page}>
      <PlaySignal topic={PLAY_TOPICS.lobbies} />
      <PlayPageTitle
        body={
          <>
            <PlayGamePicker current={game} games={profile.games} />
            <PlayCareerHero
              totals={totals}
              player={player}
              games={game ? undefined : profile.games}
            />
          </>
        }
      >
        {PLAY_HUB_COPY.statsTitle}
      </PlayPageTitle>
      <div className={PLAY_CAREER.grid}>
        <PlayPageTitle
          heading="h2"
          className={PLAY_CAREER.cell}
          body={<PlayCareerCounters totals={totals} />}
        >
          {PLAY_HUB_COPY.sectionFigures}
        </PlayPageTitle>
        <PlayPageTitle
          heading="h2"
          className={PLAY_CAREER.cell}
          body={<PlayCareerRecord totals={totals} />}
        >
          {PLAY_HUB_COPY.sectionRecord}
        </PlayPageTitle>
        {!game && (
          <PlayPageTitle
            heading="h2"
            className={PLAY_CAREER.cellWide}
            body={<PlayPinnedTrophies global={profile.global} />}
          >
            {PLAY_HUB_COPY.pinnedTrophies}
          </PlayPageTitle>
        )}
        {!game && (
          <PlayPageTitle
            heading="h2"
            className={PLAY_CAREER.cellWide}
            body={<PlayMastery games={profile.games} />}
          >
            {PLAY_HUB_COPY.sectionMastery}
          </PlayPageTitle>
        )}
      </div>
    </div>
  )
}
