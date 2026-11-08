import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

import AppLink from '@/components/elements/navigation/AppLink'
import { joinByCode } from '@/core/services/play'
import { requirePermission } from '@/core/wrappers/requireUser'
import { ROUTES } from '@/declarations/navigation'
import { PLAY_HUB_COPY } from '@/declarations/play'
import { PLAY_ROOM } from '@/declarations/ui/variants'
import { Permissions } from '@/utils/constants/permissions'

export const metadata: Metadata = { title: PLAY_HUB_COPY.codeTitle }

interface PlayJoinPageProps {
  params: Promise<{ code: string }>
}

/**
 * Invitation link: takes the seat the code opens, or says why not
 * @param {PlayJoinPageProps} props - Code segment
 * @return {Promise<JSX.Element>} - Page, or a redirect to the game
 */

export default async function PlayJoinPage({ params }: PlayJoinPageProps) {
  const { session } = await requirePermission(Permissions.PlayAccess)
  const { code } = await params
  const game = await joinByCode(session.id, { code }).catch(() => null)
  if (game) redirect(ROUTES.playSession(game.id))

  return (
    <div className={PLAY_ROOM.middle}>
      <p className={PLAY_ROOM.note}>{PLAY_HUB_COPY.codeInvalid}</p>
      <AppLink href={ROUTES.play} className={PLAY_ROOM.back}>
        {PLAY_HUB_COPY.backToHub}
      </AppLink>
    </div>
  )
}
