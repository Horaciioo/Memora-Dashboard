import type { Metadata } from 'next'

import { PlayRankingBox } from '@/composites/play/hub/leaderboard/PlayRankingBox'
import { PlayPageTitle } from '@/composites/play/hub/PlayPageTitle'
import { PlaySignal } from '@/composites/play/hub/notices/PlaySignal'
import { readCatalog, readLeaderboards } from '@/core/services/play'
import { requirePermission } from '@/core/wrappers/requireUser'
import { PLAY_MOBILE_COPY, playGameOfSlug } from '@/declarations/play'
import { PLAY_TOPICS } from '@/declarations/play/topics'
import { PLAY_BOX } from '@/declarations/ui/variants'
import { Permissions } from '@/utils/constants/permissions'

export const metadata: Metadata = { title: PLAY_MOBILE_COPY.rankingTitle }

interface PlayRankingPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

/**
 * Leaderboard of one game, the game picked from a menu
 * @param {PlayRankingPageProps} props - Query with the game slug
 * @return {Promise<JSX.Element>} - Ranking page
 */

export default async function PlayRankingPage({ searchParams }: PlayRankingPageProps) {
  const { session, access } = await requirePermission(Permissions.PlayAccess)
  const query = await searchParams
  const games = (await readCatalog(access.isSystem)).games
    .filter((entry) => entry.playable)
    .map((entry) => entry.game)
  const asked = typeof query.game === 'string' ? playGameOfSlug(query.game) : null
  // No game asked: every game together
  const game = games.find((entry) => entry === asked) ?? null
  const leaders = await readLeaderboards(game)

  return (
    <div className={PLAY_BOX.stack}>
      <PlaySignal topic={PLAY_TOPICS.lobbies} />
      <PlayPageTitle>{PLAY_MOBILE_COPY.rankingTitle}</PlayPageTitle>
      <PlayRankingBox games={games} game={game} leaders={leaders} meId={session.id} />
    </div>
  )
}
