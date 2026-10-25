import type { Metadata } from 'next'

import { PlayBackLink } from '@/composites/play/member/stats/PlayBackLink'
import { PlayGameLevels } from '@/composites/play/member/stats/PlayGameLevels'
import { PlayPlayerCard } from '@/composites/play/member/stats/PlayPlayerCard'
import { PlayStatTiles } from '@/composites/play/member/stats/PlayStatTiles'
import { readPlayProfile } from '@/core/services/play'
import { requirePermission } from '@/core/wrappers/requireUser'
import { PLAY_HUB_COPY } from '@/declarations/play'
import { PLAY_HUB } from '@/declarations/ui/variants'
import { Permissions } from '@/utils/constants/permissions'

export const metadata: Metadata = { title: PLAY_HUB_COPY.statsTitle }

/**
 * Every figure of the player, global then per game
 * @return {Promise<JSX.Element>} - Stats page
 */

export default async function PlayStatsPage() {
  const { session } = await requirePermission(Permissions.PlayAccess)
  const profile = await readPlayProfile(session.id)

  return (
    <div className={PLAY_HUB.main}>
      <PlayBackLink />
      <h1 className={PLAY_HUB.heading}>{PLAY_HUB_COPY.statsTitle}</h1>
      <PlayPlayerCard
        totals={profile.global}
        player={{ name: session.displayName, avatarUrl: session.avatarUrl }}
      />
      <PlayStatTiles totals={profile.global} />
      <PlayGameLevels games={profile.games} />
    </div>
  )
}
