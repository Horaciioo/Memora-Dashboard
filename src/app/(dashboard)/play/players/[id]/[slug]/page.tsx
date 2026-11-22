import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { PlayPageTitle } from '@/composites/play/hub/PlayPageTitle'
import { PlaySignal } from '@/composites/play/hub/notices/PlaySignal'
import { PlayCareerHero } from '@/composites/play/member/stats/PlayCareerHero'
import { PlayCareerPanels } from '@/composites/play/member/stats/PlayCareerPanels'
import { openGameOfSlug, readPlayPlayer } from '@/core/services/play'
import { requirePermission } from '@/core/wrappers/requireUser'
import { PLAY_GAMES, PLAY_HUB_COPY } from '@/declarations/play'
import { PLAY_TOPICS } from '@/declarations/play/topics'
import { PLAY_PAGE } from '@/declarations/ui/variants'
import { Permissions } from '@/utils/constants/permissions'

export const metadata: Metadata = { title: PLAY_HUB_COPY.pageTitle }

interface PlayPlayerGamePageProps {
  params: Promise<{ id: string; slug: string }>
}

/**
 * Stats of another player on one game, read only
 * @param {PlayPlayerGamePageProps} props - Player id and game segment
 * @return {Promise<JSX.Element>} - Game stats page
 */

export default async function PlayPlayerGamePage({ params }: PlayPlayerGamePageProps) {
  await requirePermission(Permissions.PlayAccess)
  const { id, slug } = await params
  const game = openGameOfSlug(slug)
  const found = game && (await readPlayPlayer(id))
  const totals = found && found.profile.games.find((entry) => entry.game === game)
  if (!game || !found || !totals) notFound()

  return (
    <div className={PLAY_PAGE.frame}>
      <PlaySignal topic={PLAY_TOPICS.lobbies} />
      <PlayPageTitle
        page="profile"
        aside={null}
        body={
          <PlayCareerHero totals={totals} player={found.player} subtitle={PLAY_GAMES.label(game)} />
        }
      >
        {PLAY_HUB_COPY.profileTitle}
      </PlayPageTitle>
      <div className={PLAY_PAGE.grid}>
        <PlayCareerPanels totals={totals} />
      </div>
    </div>
  )
}
