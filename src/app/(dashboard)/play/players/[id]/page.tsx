import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { PlayGameLevels } from '@/composites/play/member/stats/PlayGameLevels'
import { PlayPageTitle } from '@/composites/play/hub/PlayPageTitle'
import { PlaySignal } from '@/composites/play/hub/notices/PlaySignal'
import { PlayPlayerHero } from '@/composites/play/member/stats/PlayPlayerHero'
import { PlayPlayerPresence } from '@/composites/play/member/stats/PlayPlayerPresence'
import { PlayProfileSections } from '@/composites/play/member/stats/PlayProfileSections'
import { PlayTrophies } from '@/composites/play/member/stats/PlayTrophies'
import { readPlayPlayer, readPlayPresence, readPlaySheet } from '@/core/services/play'
import { requirePermission } from '@/core/wrappers/requireUser'
import { PLAY_HUB_COPY } from '@/declarations/play'
import { PLAY_TOPICS } from '@/declarations/play/topics'
import { PLAY_HUB } from '@/declarations/ui/variants'
import { PlayStatuses } from '@/utils/constants/play'
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
  const { session } = await requirePermission(Permissions.PlayAccess)
  const { id } = await params
  const found = await readPlayPlayer(id)
  if (!found) notFound()
  const [sheet, mine] = await Promise.all([readPlaySheet(id), readPlayPresence(session.id)])
  const { player, profile } = found

  return (
    <div className={PLAY_HUB.main}>
      <PlaySignal topic={PLAY_TOPICS.lobbies} />
      <PlayPageTitle>{PLAY_HUB_COPY.profileTitle}</PlayPageTitle>
      <PlayPlayerHero totals={profile.global} player={player} />
      {id !== session.id && (
        <PlayPlayerPresence
          playerId={id}
          seat={sheet.presence}
          lastSeenAt={sheet.lastSeenAt}
          viewerLobbyId={mine?.status === PlayStatuses.Lobby ? mine.sessionId : null}
        />
      )}
      <PlayProfileSections sheet={sheet} playerId={id} />
      <PlayGameLevels games={profile.games} />
      <PlayTrophies global={profile.global} />
    </div>
  )
}
