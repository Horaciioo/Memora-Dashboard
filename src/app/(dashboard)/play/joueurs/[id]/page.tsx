import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { PlayGameLevels } from '@/composites/play/member/stats/PlayGameLevels'
import { PlayBackLink } from '@/composites/play/member/stats/PlayBackLink'
import { PlayPlayerHero } from '@/composites/play/member/stats/PlayPlayerHero'
import { PlayTrophies } from '@/composites/play/member/stats/PlayTrophies'
import { readPlayPlayer } from '@/core/services/play'
import { requirePermission } from '@/core/wrappers/requireUser'
import { PLAY_HUB_COPY } from '@/declarations/play'
import { PLAY_HUB } from '@/declarations/ui/variants'
import { Permissions } from '@/utils/constants/permissions'

export const metadata: Metadata = { title: PLAY_HUB_COPY.pageTitle }

interface PlayPlayerPageProps {
  params: Promise<{ id: string }>
}

/**
 * Stats of another player, read only
 * @param {PlayPlayerPageProps} props - Player id
 * @return {Promise<JSX.Element>} - Player stats page
 */

export default async function PlayPlayerPage({ params }: PlayPlayerPageProps) {
  await requirePermission(Permissions.PlayAccess)
  const { id } = await params
  const found = await readPlayPlayer(id)
  if (!found) notFound()
  const { player, profile } = found

  return (
    <div className={PLAY_HUB.main}>
      <PlayBackLink />
      <PlayPlayerHero totals={profile.global} player={player} />
      <PlayGameLevels games={profile.games} />
      <PlayTrophies global={profile.global} />
    </div>
  )
}
