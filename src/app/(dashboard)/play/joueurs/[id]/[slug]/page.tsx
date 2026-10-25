import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { PlayBackLink } from '@/composites/play/member/stats/PlayBackLink'
import { PlayPlayerHero } from '@/composites/play/member/stats/PlayPlayerHero'
import { openGameOfSlug, readPlayPlayer } from '@/core/services/play'
import { requirePermission } from '@/core/wrappers/requireUser'
import { PLAY_GAMES, PLAY_HUB_COPY } from '@/declarations/play'
import { PLAY_HUB } from '@/declarations/ui/variants'
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
    <div className={PLAY_HUB.main}>
      <PlayBackLink />
      <PlayPlayerHero totals={totals} player={found.player} subtitle={PLAY_GAMES.label(game)} />
    </div>
  )
}
