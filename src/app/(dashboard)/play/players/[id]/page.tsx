import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { PlayGameLevels } from '@/composites/play/member/stats/PlayGameLevels'
import { PlayPageTitle } from '@/composites/play/hub/PlayPageTitle'
import { PlaySignal } from '@/composites/play/hub/notices/PlaySignal'
import { PlayProfileHero } from '@/composites/play/member/profile/PlayProfileHero'
import {
  PlayPresenceActions,
  PlayPresenceBadge,
} from '@/composites/play/member/stats/PlayPlayerPresence'
import { PlayProfileSections } from '@/composites/play/member/stats/PlayProfileSections'
import { PlayPinnedTrophies } from '@/composites/play/member/stats/PlayPinnedTrophies'
import { PlayRelationKey } from '@/composites/play/friends/PlayRelationKey'
import {
  readPlayPlayer,
  readPlayPresence,
  readPlayRelation,
  readPlaySheet,
} from '@/core/services/play'
import { requirePermission } from '@/core/wrappers/requireUser'
import { PLAY_HEAD_COPY, PLAY_HUB_COPY } from '@/declarations/play'
import { PLAY_TOPICS } from '@/declarations/play/topics'
import { PLAY_PAGE, PLAY_PROFILE, PLAY_PROFILE_HERO } from '@/declarations/ui/variants'
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
  const [sheet, mine, tie] = await Promise.all([
    readPlaySheet(id),
    readPlayPresence(session.id),
    readPlayRelation(session.id, id),
  ])
  const { player, profile } = found

  const isOther = id !== session.id

  return (
    <div className={PLAY_PAGE.frame}>
      <PlaySignal topic={PLAY_TOPICS.lobbies} />
      <PlayPageTitle
        page="profile"
        aside={null}
        body={
          <PlayProfileHero
            totals={profile.global}
            player={player}
            badge={
              isOther && (
                <PlayPresenceBadge
                  playerId={id}
                  seat={sheet.presence}
                  lastSeenAt={sheet.lastSeenAt}
                />
              )
            }
            actions={
              isOther && (
                <PlayPresenceActions
                  playerId={id}
                  seat={sheet.presence}
                  viewerLobbyId={mine?.status === PlayStatuses.Lobby ? mine.sessionId : null}
                >
                  <PlayRelationKey
                    accountId={id}
                    {...tie}
                    styles={{ base: PLAY_PROFILE_HERO.link, main: PLAY_PROFILE.keyGhost }}
                  />
                </PlayPresenceActions>
              )
            }
          />
        }
      >
        {PLAY_HUB_COPY.profileTitle}
      </PlayPageTitle>
      <div className={PLAY_PAGE.grid}>
        <PlayProfileSections sheet={sheet} playerId={id} />
        <PlayGameLevels games={profile.games} playerId={id} />
        <PlayPageTitle
          heading="h2"
          className={PLAY_PAGE.cellWide}
          body={<PlayPinnedTrophies pins={profile.pins} />}
        >
          {PLAY_HEAD_COPY.pinsTitle}
        </PlayPageTitle>
      </div>
    </div>
  )
}
