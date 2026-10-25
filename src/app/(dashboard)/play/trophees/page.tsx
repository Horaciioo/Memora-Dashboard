import type { Metadata } from 'next'

import { PlayBackLink } from '@/composites/play/member/stats/PlayBackLink'
import { PlayTrophies } from '@/composites/play/member/stats/PlayTrophies'
import { readPlayProfile } from '@/core/services/play'
import { requirePermission } from '@/core/wrappers/requireUser'
import { PLAY_HUB_COPY } from '@/declarations/play'
import { PLAY_HUB } from '@/declarations/ui/variants'
import { Permissions } from '@/utils/constants/permissions'

export const metadata: Metadata = { title: PLAY_HUB_COPY.trophiesTitle }

/**
 * Every trophy, won or on its way
 * @return {Promise<JSX.Element>} - Trophies page
 */

export default async function PlayTrophiesPage() {
  const { session } = await requirePermission(Permissions.PlayAccess)
  const profile = await readPlayProfile(session.id)

  return (
    <div className={PLAY_HUB.main}>
      <PlayBackLink />
      <PlayTrophies global={profile.global} />
    </div>
  )
}
