import type { Metadata } from 'next'

import { PlayPageTitle } from '@/composites/play/hub/PlayPageTitle'
import { PlaySignal } from '@/composites/play/hub/notices/PlaySignal'
import { PlayTrophies } from '@/composites/play/member/stats/PlayTrophies'
import { trophiesOf } from '@/core/lib/play'
import { readPlayProfile, readTrophyRarity } from '@/core/services/play'
import { requirePermission } from '@/core/wrappers/requireUser'
import { fillPlayMessage, PLAY_HEAD_COPY, PLAY_HUB_COPY } from '@/declarations/play'
import { PLAY_TOPICS } from '@/declarations/play/topics'
import { PLAY_HEAD, PLAY_PAGE } from '@/declarations/ui/variants'
import { Permissions } from '@/utils/constants/permissions'

export const metadata: Metadata = { title: PLAY_HUB_COPY.trophiesTitle }

/**
 * Every trophy, won or on its way
 * @return {Promise<JSX.Element>} - Trophies page
 */

export default async function PlayTrophiesPage() {
  const { session } = await requirePermission(Permissions.PlayAccess)
  const [profile, rarity] = await Promise.all([readPlayProfile(session.id), readTrophyRarity()])

  const trophies = trophiesOf(profile.games)
  const won = trophies.filter((trophy) => trophy.reached).length

  return (
    <div className={PLAY_PAGE.frame}>
      <PlaySignal topic={PLAY_TOPICS.lobbies} />
      <PlayPageTitle
        page="trophies"
        aside={
          <span className={PLAY_HEAD.fig}>
            <span className={PLAY_HEAD.figValue}>
              {fillPlayMessage(PLAY_HEAD_COPY.wonValue, { won, total: trophies.length })}
            </span>
            <span className={PLAY_HEAD.figLabel}>{PLAY_HEAD_COPY.wonLabel}</span>
          </span>
        }
        body={
          <PlayTrophies
            games={profile.games}
            wonAt={profile.wonAt}
            rarity={rarity}
            pins={profile.pins}
            canPin
          />
        }
      >
        {PLAY_HUB_COPY.trophiesTitle}
      </PlayPageTitle>
    </div>
  )
}
